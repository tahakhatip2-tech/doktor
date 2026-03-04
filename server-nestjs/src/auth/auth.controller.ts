import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, UseGuards, Get, Put, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { LoginDto, UpdateProfileDto, AuthResponseDto } from './dto/auth.dto';
import { SupabaseService } from '../storage/supabase.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private supabaseService: SupabaseService
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'تسجيل الدخول',
        description: 'تسجيل دخول المستخدم باستخدام البريد الإلكتروني وكلمة المرور والحصول على JWT token'
    })
    @ApiResponse({
        status: 200,
        description: 'تم تسجيل الدخول بنجاح',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'بيانات الدخول غير صحيحة',
        schema: {
            example: {
                statusCode: 401,
                message: 'Invalid credentials',
                error: 'Unauthorized'
            }
        }
    })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'الحصول على الملف الشخصي',
        description: 'جلب معلومات المستخدم الحالي'
    })
    @ApiResponse({
        status: 200,
        description: 'تم جلب الملف الشخصي بنجاح',
        schema: {
            example: {
                id: 1,
                email: 'doctor@clinic.com',
                name: 'د. أحمد محمد',
                role: 'ADMIN',
                avatar: '/uploads/avatar.jpg',
                createdAt: '2026-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'غير مصرح - يجب تسجيل الدخول'
    })
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('profile')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'تحديث الملف الشخصي',
        description: 'تحديث معلومات المستخدم الحالي'
    })
    @ApiResponse({
        status: 200,
        description: 'تم تحديث الملف الشخصي بنجاح'
    })
    @ApiResponse({
        status: 401,
        description: 'غير مصرح - يجب تسجيل الدخول'
    })
    async updateProfile(@Request() req, @Body() data: UpdateProfileDto) {
        return this.authService.updateProfile(req.user.id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Post('profile/avatar')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'رفع صورة الملف الشخصي',
        description: 'رفع أو تحديث صورة الملف الشخصي للمستخدم'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary',
                    description: 'ملف الصورة (jpg, jpeg, png, gif)'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'تم رفع الصورة بنجاح',
        schema: {
            example: {
                id: 1,
                avatar: '/uploads/abc123.jpg'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'صيغة الملف غير مدعومة'
    })
    @ApiResponse({
        status: 401,
        description: 'غير مصرح - يجب تسجيل الدخول'
    })
    @UseInterceptors(FileInterceptor('avatar', {
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    async uploadAvatar(@Request() req, @UploadedFile() file: any) {
        if (!file) {
            throw new Error('لم يتم اختيار ملف');
        }

        try {
            // Upload to 'avatars' folder (or 'clinic' if you prefer a single folder)
            const avatarUrl = await this.supabaseService.uploadFile(file, 'avatars');
            return this.authService.updateAvatar(req.user.id, avatarUrl);
        } catch (error) {
            console.error('Avatar Upload Error:', error);
            throw new Error(`فشل رفع الصورة: ${error.message}`);
        }
    }
}

