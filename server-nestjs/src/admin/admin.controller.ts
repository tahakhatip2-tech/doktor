import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, SubscriptionStatus } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    // ═══════════════════════════════════════════════════════════
    // Dashboard
    // ═══════════════════════════════════════════════════════════
    @Get('dashboard/stats')
    @ApiOperation({ summary: 'جلب إحصائيات لوحة التحكم' })
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    // ═══════════════════════════════════════════════════════════
    // Users Management
    // ═══════════════════════════════════════════════════════════
    @Get('users')
    @ApiOperation({ summary: 'جلب جميع المستخدمين مع الفلاتر' })
    async getUsers(
        @Query('search') search?: string,
        @Query('role') role?: UserRole,
        @Query('status') status?: string,
        @Query('subscriptionStatus') subscriptionStatus?: SubscriptionStatus,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getUsers({
            search,
            role,
            status,
            subscriptionStatus,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20
        });
    }

    @Get('users/:id')
    @ApiOperation({ summary: 'جلب تفاصيل مستخدم' })
    async getUserDetails(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getUserDetails(id);
    }

    @Patch('users/:id')
    @ApiOperation({ summary: 'تحديث بيانات مستخدم' })
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any
    ) {
        return this.adminService.updateUser(id, data);
    }

    @Delete('users/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'حذف مستخدم' })
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deleteUser(id);
    }

    @Patch('users/:id/suspend')
    @ApiOperation({ summary: 'تعليق حساب مستخدم' })
    async suspendUser(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.updateUser(id, { status: 'banned' });
    }

    @Patch('users/:id/activate')
    @ApiOperation({ summary: 'تفعيل حساب مستخدم' })
    async activateUser(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.updateUser(id, { status: 'active' });
    }

    @Patch('users/:id/extend-trial')
    @ApiOperation({ summary: 'تمديد الفترة التجريبية' })
    async extendTrial(
        @Param('id', ParseIntPipe) id: number,
        @Body('days') days: number
    ) {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + (days || 30));
        return this.adminService.updateUser(id, { expiryDate: newDate });
    }

    // ═══════════════════════════════════════════════════════════
    // Plans Management
    // ═══════════════════════════════════════════════════════════
    @Get('plans')
    @ApiOperation({ summary: 'جلب جميع الخطط' })
    async getPlans() {
        return this.adminService.getPlans();
    }

    @Post('plans')
    @ApiOperation({ summary: 'إنشاء خطة جديدة' })
    async createPlan(@Body() data: any) {
        return this.adminService.createPlan(data);
    }

    @Patch('plans/:id')
    @ApiOperation({ summary: 'تحديث خطة' })
    async updatePlan(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: any
    ) {
        return this.adminService.updatePlan(id, data);
    }

    @Delete('plans/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'حذف خطة' })
    async deletePlan(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deletePlan(id);
    }

    // ═══════════════════════════════════════════════════════════
    // Payments Management
    // ═══════════════════════════════════════════════════════════
    @Get('payments')
    @ApiOperation({ summary: 'جلب جميع المدفوعات' })
    async getPayments(
        @Query('status') status?: string,
        @Query('method') method?: string,
        @Query('userId') userId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getPayments({
            status,
            method,
            userId: userId ? parseInt(userId) : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20
        });
    }

    @Patch('payments/:id/approve')
    @ApiOperation({ summary: 'الموافقة على دفعة' })
    async approvePayment(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.approvePayment(id);
    }

    @Patch('payments/:id/reject')
    @ApiOperation({ summary: 'رفض دفعة' })
    async rejectPayment(
        @Param('id', ParseIntPipe) id: number,
        @Body('notes') notes?: string
    ) {
        return this.adminService.rejectPayment(id, notes);
    }

    // ═══════════════════════════════════════════════════════════
    // System Settings
    // ═══════════════════════════════════════════════════════════
    @Get('settings')
    @ApiOperation({ summary: 'جلب إعدادات النظام' })
    async getSystemSettings() {
        return this.adminService.getSystemSettings();
    }

    @Put('settings/:key')
    @ApiOperation({ summary: 'تحديث إعداد النظام' })
    async updateSystemSetting(
        @Param('key') key: string,
        @Body('value') value: string
    ) {
        return this.adminService.updateSystemSetting(key, value);
    }

    // ═══════════════════════════════════════════════════════════
    // Activity Logs
    // ═══════════════════════════════════════════════════════════
    @Get('activity-logs')
    @ApiOperation({ summary: 'جلب سجل الأنشطة' })
    async getActivityLogs(
        @Query('userId') userId?: string,
        @Query('action') action?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getActivityLogs({
            userId: userId ? parseInt(userId) : undefined,
            action,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20
        });
    }
}
