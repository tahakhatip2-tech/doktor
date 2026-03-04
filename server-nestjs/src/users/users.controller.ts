import {
    Controller, Post, Body, Get, UseGuards,
    Request, Patch, Param, ParseIntPipe,
    HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { RegisterDto } from '../auth/dto/auth.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * تسجيل مستخدم جديد (طبيب)
     * الدور يُعيَّن تلقائياً كـ USER — لا يمكن للمستخدم تغييره
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'تسجيل حساب طبيب جديد' })
    @ApiResponse({ status: 201, description: 'تم إنشاء الحساب بنجاح' })
    @ApiResponse({ status: 400, description: 'بيانات غير صحيحة' })
    @ApiResponse({ status: 409, description: 'البريد الإلكتروني أو رقم الهاتف مستخدم مسبقاً' })
    async register(@Body() dto: RegisterDto) {
        // نُمرر فقط الحقول الآمنة — الدور يُحدَّد في الـ service دائماً كـ USER
        const { password, name, email, phone } = dto;
        const { password: _p, ...result } = await this.usersService.create({
            email,
            password,
            name,
            phone,
        });
        return result;
    }

    /**
     * جلب جميع المستخدمين — للمديرين فقط
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'جلب جميع المستخدمين (ADMIN فقط)' })
    @ApiResponse({ status: 200, description: 'قائمة المستخدمين' })
    @ApiResponse({ status: 403, description: 'غير مصرح' })
    async findAll() {
        return this.usersService.findAll();
    }

    /**
     * تحديث بيانات مستخدم — للمديرين فقط
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'تحديث بيانات مستخدم (ADMIN فقط)' })
    @ApiResponse({ status: 200, description: 'تم التحديث بنجاح' })
    @ApiResponse({ status: 403, description: 'غير مصرح' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any,
        @Request() req,
    ) {
        // منع تغيير الدور إلى ADMIN من خلال هذا الـ endpoint إلا بطريقة صريحة
        const { role, ...safeData } = data;
        return this.usersService.update(id, safeData);
    }

    /**
     * تغيير دور مستخدم — للمديرين فقط (endpoint مخصص وواضح)
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id/role')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'تغيير دور المستخدم (ADMIN فقط)' })
    @ApiResponse({ status: 200, description: 'تم تغيير الدور بنجاح' })
    async updateRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { role: UserRole },
    ) {
        // التحقق من أن الدور المُرسَل صحيح
        const validRoles = Object.values(UserRole);
        if (!validRoles.includes(body.role)) {
            throw new Error(`الدور غير صحيح. الأدوار المتاحة: ${validRoles.join(', ')}`);
        }
        return this.usersService.update(id, { role: body.role });
    }
}
