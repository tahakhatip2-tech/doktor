import { Controller, Get, Post, Put, Patch, Delete, UseGuards, Request, Body, Param, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { WhatsAppService } from './whatsapp.service';
import { SupabaseService } from '../storage/supabase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WhatsAppSendMessageDto, WhatsAppSettingsDto, CreateTemplateDto, WhatsAppStatusResponseDto } from './dto/whatsapp.dto';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsAppController {
    constructor(
        private whatsappService: WhatsAppService,
        private supabaseService: SupabaseService
    ) { }

    @Get('status')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'حالة اتصال واتساب', description: 'التحقق مما إذا كان واتساب مرتبطاً أو يحتاج لمسح QR code' })
    @ApiResponse({ status: 200, description: 'تم جلب الحالة بنجاح', type: WhatsAppStatusResponseDto })
    async getStatus(@Request() req) {
        console.log(`[WhatsApp] Status check request received for user: ${req.user.id}`);
        return this.whatsappService.getStatus(req.user.id);
    }

    @Post('connect')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'بدء اتصال جديد', description: 'تشغيل جلسة واتساب جديدة وتوليد رمز QR' })
    @ApiResponse({ status: 200, description: 'بدأت الجلسة بنجاح' })
    async connect(@Request() req) {
        return this.whatsappService.startSession(req.user.id);
    }

    @Delete('logout')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'تسجيل الخروج', description: 'قطع الاتصال بواتساب وحذف الجلسة الحالية' })
    @ApiResponse({ status: 200, description: 'تم تسجيل الخروج بنجاح' })
    async logout(@Request() req) {
        return this.whatsappService.logout(req.user.id);
    }

    @Get('settings')
    @ApiOperation({ summary: 'إعدادات واتساب (عام)', description: 'جلب إعدادات العيادة الأساسية - لا يتطلب تسجيل دخول' })
    @ApiResponse({ status: 200, description: 'تم جلب الإعدادات بنجاح', type: WhatsAppSettingsDto })
    async getSettings(@Request() req) {
        // If user is authenticated, use their ID, otherwise use default (user 1)
        const userId = req.user?.id || 1;
        return this.whatsappService.getSettings(userId);
    }

    @Post('settings')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'تحديث الإعدادات', description: 'تعديل خيارات الرد التلقائي والذكاء الاصطناعي' })
    @ApiBody({ type: WhatsAppSettingsDto })
    @ApiResponse({ status: 200, description: 'تم التحديث بنجاح' })
    async updateSettings(@Request() req, @Body() body: WhatsAppSettingsDto) {
        return this.whatsappService.updateSettings(req.user.id, body);
    }

    @Get('chats')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'جلب المحادثات', description: 'عرض قائمة بآخر المحادثات على واتساب' })
    @ApiResponse({ status: 200, description: 'تم جلب المحادثات' })
    async getChats(@Request() req) {
        return this.whatsappService.getChats(req.user.id);
    }

    @Delete('chats/:id')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'حذف محادثة', description: 'حذف سجل محادثة بالكامل من قاعدة البيانات' })
    @ApiParam({ name: 'id', description: 'معرف المحادثة' })
    @ApiResponse({ status: 200, description: 'تم الحذف' })
    async deleteChat(@Param('id') id: string | number, @Request() req) {
        const chatId = typeof id === 'string' ? parseInt(id) : id;
        return this.whatsappService.deleteChat(chatId, req.user.id);
    }

    @Get('chats/:id/messages')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'جلب رسائل محادثة', description: 'عرض تاريخ الرسائل لمحادثة محددة' })
    @ApiParam({ name: 'id', description: 'معرف المحادثة' })
    @ApiResponse({ status: 200, description: 'تم جلب الرسائل' })
    async getMessages(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.whatsappService.getMessages(id, req.user.id);
    }

    @Post('send')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'إرسال رسالة', description: 'إرسال رسالة نصية أو وسائط لأي رقم هاتف' })
    @ApiBody({ type: WhatsAppSendMessageDto })
    @ApiResponse({ status: 200, description: 'تم إرسال الرسالة بنجاح' })
    async sendMessage(@Request() req, @Body() body: WhatsAppSendMessageDto) {
        return this.whatsappService.sendMessage(req.user.id, body);
    }

    @Patch('chats/:id/read')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'تمييز كـ مقروء', description: 'تحديث حالة الرسائل في محادثة لتصبح مقروءة' })
    @ApiParam({ name: 'id', description: 'معرف المحادثة' })
    @ApiResponse({ status: 200, description: 'تم التحديث' })
    async markRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.whatsappService.markRead(id, req.user.id);
    }

    @Get('templates')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'قوالب الرد التلقائي', description: 'عرض قائمة بقوالب الردود المبرمجة' })
    @ApiResponse({ status: 200, description: 'تم جلب القوالب', type: [CreateTemplateDto] })
    async getTemplates(@Request() req) {
        return this.whatsappService.getTemplates(req.user.id);
    }

    @Post('templates')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'إنشاء قالب جديد', description: 'إضافة رد تلقائي جديد بناءً على كلمة مفتاحية' })
    @ApiBody({ type: CreateTemplateDto })
    @ApiResponse({ status: 201, description: 'تم إنشاء القالب' })
    async createTemplate(@Request() req, @Body() body: CreateTemplateDto) {
        return this.whatsappService.createTemplate(req.user.id, body);
    }

    @Put('templates/:id')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'تحديث قالب', description: 'تعديل نص الرد أو كلمة الزناد لقالب موجود' })
    @ApiParam({ name: 'id', description: 'معرف القالب' })
    @ApiResponse({ status: 200, description: 'تم التحديث' })
    async updateTemplate(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() body: CreateTemplateDto) {
        return this.whatsappService.updateTemplate(id, req.user.id, body);
    }

    @Delete('templates/:id')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'حذف قالب', description: 'إزالة قالب رد تلقائي من النظام' })
    @ApiParam({ name: 'id', description: 'معرف القالب' })
    @ApiResponse({ status: 200, description: 'تم الحذف' })
    async deleteTemplate(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.whatsappService.deleteTemplate(id, req.user.id);
    }

    @Get('analytics')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'إحصائيات واتساب', description: 'تحليل أداء الردود التلقائية وعدد الرسائل المرسلة' })
    @ApiResponse({ status: 200, description: 'تم جلب الإحصائيات' })
    async getAnalytics(@Request() req) {
        return this.whatsappService.getAnalytics(req.user.id);
    }

    @Post('upload')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'رفع شعار العيادة', description: 'رفع صورة جديدة لاستخدامها كشعار للعيادة في النظام والتقارير' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'تم رفع الشعار بنجاح' })
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage()
    }))
    async upload(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('لم يتم اختيار ملف');
        }
        const url = await this.supabaseService.uploadFile(file, 'clinic');
        return { url };
    }

    @Get('tags')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'تصنيفات (Tags)', description: 'جلب جميع التصنيفات المتاحة لجهات الاتصال' })
    @ApiResponse({ status: 200, description: 'تم جلب التصنيفات' })
    async getTags(@Request() req) {
        return this.whatsappService.getTags(req.user.id);
    }

    @Get('contacts/:phone/tags')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'تصنيفات مريض محدد', description: 'جلب جميع الـ Tags المرتبطة برقم هاتف معين' })
    @ApiParam({ name: 'phone', description: 'رقم الهاتف' })
    async getContactTags(@Param('phone') phone: string, @Request() req) {
        return this.whatsappService.getContactTags(phone, req.user.id);
    }

    @Post('contacts/:phone/tags')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'إضافة تصنيف لمريض', description: 'ربط Tag محدد بجهة اتصال' })
    @ApiParam({ name: 'phone', description: 'رقم الهاتف' })
    @ApiBody({ schema: { properties: { tagId: { type: 'number' } } } })
    async addContactTag(@Param('phone') phone: string, @Body('tagId') tagId: number, @Request() req) {
        return this.whatsappService.addContactTag(phone, tagId, req.user.id);
    }

    @Delete('contacts/:phone/tags/:tagId')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'حذف تصنيف من مريض', description: 'فك ارتباط Tag معين عن جهة اتصال' })
    @ApiParam({ name: 'phone', description: 'رقم الهاتف' })
    @ApiParam({ name: 'tagId', description: 'معرف التصنيف' })
    async removeContactTag(@Param('phone') phone: string, @Param('tagId', ParseIntPipe) tagId: number, @Request() req) {
        return this.whatsappService.removeContactTag(phone, tagId, req.user.id);
    }
}

