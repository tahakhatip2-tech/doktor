import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards, Request, ParseIntPipe, UseInterceptors, UploadedFile, Inject, forwardRef } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AppointmentsService } from './appointments.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAppointmentDto, UpdateAppointmentDto, SaveMedicalRecordDto, AppointmentResponseDto } from './dto/appointment.dto';

@ApiTags('Appointments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
    constructor(
        private readonly appointmentsService: AppointmentsService,
        @Inject(forwardRef(() => WhatsAppService)) private readonly whatsAppService: WhatsAppService
    ) { }

    @Get()
    @ApiOperation({ summary: 'جلب جميع المواعيد', description: 'عرض قائمة بجميع المواعيد مع إمكانية التصفية' })
    @ApiQuery({ name: 'status', required: false, description: 'تصفية حسب الحالة' })
    @ApiResponse({ status: 200, description: 'تم جلب القائمة بنجاح', type: [AppointmentResponseDto] })
    findAll(@Request() req, @Query() query: any) {
        return this.appointmentsService.findAll(req.user.id, query);
    }

    @Get('today')
    @ApiOperation({ summary: 'مواعيد اليوم', description: 'عرض قائمة المواعيد المجدولة لليوم الحالي' })
    @ApiResponse({ status: 200, description: 'تم جلب مواعيد اليوم بنجاح', type: [AppointmentResponseDto] })
    getToday(@Request() req) {
        return this.appointmentsService.getToday(req.user.id);
    }

    @Get('stats')
    @ApiOperation({ summary: 'إحصائيات المواعيد', description: 'جلب إحصائيات عامة حول المواعيد (العدد الكلي، المؤكد، الملغى...)' })
    @ApiResponse({ status: 200, description: 'تم جلب الإحصائيات بنجاح' })
    getStats(@Request() req) {
        return this.appointmentsService.getStats(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'تفاصيل موعد محدد', description: 'جلب بيانات موعد معين باستخدام المعرف الخاص به' })
    @ApiParam({ name: 'id', description: 'معرف الموعد' })
    @ApiResponse({ status: 200, description: 'تم جلب البيانات بنجاح', type: AppointmentResponseDto })
    @ApiResponse({ status: 404, description: 'الموعد غير موجود' })
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.appointmentsService.findOne(id, req.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'إنشاء موعد جديد', description: 'إضافة موعد جديد للنظام وحجز فترة زمنية' })
    @ApiResponse({ status: 201, description: 'تم إنشاء الموعد بنجاح', type: AppointmentResponseDto })
    @ApiResponse({ status: 400, description: 'بيانات غير صالحة أو الفترة الزمنية غير متوفرة' })
    create(@Request() req, @Body() data: CreateAppointmentDto) {
        return this.appointmentsService.create(req.user.id, data);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'تحديث بيانات موعد', description: 'تعديل بيانات موعد موجود مسبقاً' })
    @ApiParam({ name: 'id', description: 'معرف الموعد' })
    @ApiResponse({ status: 200, description: 'تم التحديث بنجاح', type: AppointmentResponseDto })
    update(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() data: UpdateAppointmentDto) {
        return this.appointmentsService.update(id, req.user.id, data);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'تحديث حالة الموعد', description: 'تغيير حالة الموعد فقط (مثلاً من مجدول إلى مكتمل أو ملغى)' })
    @ApiParam({ name: 'id', description: 'معرف الموعد' })
    @ApiBody({ schema: { properties: { status: { type: 'string', example: 'completed' } } } })
    @ApiResponse({ status: 200, description: 'تم تحديث الحالة بنجاح' })
    updateStatus(@Param('id', ParseIntPipe) id: number, @Request() req, @Body('status') status: string) {
        return this.appointmentsService.updateStatus(id, req.user.id, status);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'حذف موعد', description: 'إزالة موعد من النظام' })
    @ApiParam({ name: 'id', description: 'معرف الموعد' })
    @ApiResponse({ status: 200, description: 'تم الحذف بنجاح' })
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.appointmentsService.remove(id, req.user.id);
    }

    @Get(':id/medical-record')
    @ApiOperation({ summary: 'جلب السجل الطبي لليوم', description: 'عرض التشخيص والعلاج المرتبط بهذا الموعد' })
    @ApiParam({ name: 'id', description: 'معرف الموعد' })
    @ApiResponse({ status: 200, description: 'تم جلب السجل بنجاح' })
    getMedicalRecord(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.appointmentsService.getMedicalRecord(id, req.user.id);
    }

    @Post(':id/medical-record')
    @ApiOperation({ summary: 'حفظ السجل الطبي', description: 'إضافة التشخيص والعلاج ورفع المرفقات للموعد' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                diagnosis: { type: 'string' },
                treatment: { type: 'string' },
                age: { type: 'string' },
                feeAmount: { type: 'number' },
                feeDetails: { type: 'string' },
                recordType: { type: 'string', enum: ['prescription', 'lab_report', 'sick_leave', 'referral'] },
                file: { type: 'string', format: 'binary', description: 'المرفق (صورة أو PDF)' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'تم حفظ السجل الطبي بنجاح' })
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/medical-records',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    saveMedicalRecord(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Body() data: SaveMedicalRecordDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (file) {
            data['attachmentUrl'] = `/uploads/medical-records/${file.filename}`;
        }
        return this.appointmentsService.saveMedicalRecord(id, req.user.id, data);
    }

    @Post(':id/prescription')
    @ApiOperation({ summary: 'إنشاء وصفة طبية PDF', description: 'توليد ملف وصفة طبية احترافي بصيغة PDF بناءً على بيانات الموعد' })
    @ApiParam({ name: 'id', description: 'معرف الموعد' })
    @ApiResponse({ status: 200, description: 'تم إنشاء الملف بنجاح وإرجاع الرابط' })
    generatePrescription(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.appointmentsService.generatePrescription(id, req.user.id);
    }

    @Post(':id/prescription/send')
    @ApiOperation({ summary: 'إرسال الوصفة عبر واتساب', description: 'إرسال ملف الوصفة الطبية (PDF) مباشرة إلى هاتف المريض عبر واتساب' })
    @ApiBody({ schema: { properties: { url: { type: 'string' }, phone: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'تم الإرسال بنجاح' })
    async sendPrescription(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() data: any) {
        const { url, phone } = data;

        // Format phone to JID
        let formattedPhone = phone.toString().replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = '962' + formattedPhone.substring(1);
        if (!formattedPhone.endsWith('@s.whatsapp.net')) formattedPhone += '@s.whatsapp.net';

        const relativePath = url.startsWith('/') ? url.substring(1) : url;
        const absolutePath = join(process.cwd(), relativePath);

        console.log(`[Prescription] Sending file: ${absolutePath} to ${phone}`);

        const sent = await this.whatsAppService.sendMessage(req.user.id, {
            phone: formattedPhone,
            message: 'إليك الوصفة الطبية / التقرير الطبي',
            mediaUrl: absolutePath,
            mediaType: 'document'
        });

        if (!sent) {
            throw new Error('Failed to send message via WhatsApp');
        }

        return { success: true, message: 'Prescription sent successfully' };
    }

    @Post(':id/confirm')
    @ApiOperation({ summary: 'تأكيد موعد من المريض', description: 'تأكيد طلب موعد قادم من بوابة المرضى' })
    @ApiParam({ name: 'id', description: 'معرف الموعد' })
    @ApiResponse({ status: 200, description: 'تم تأكيد الموعد بنجاح' })
    @ApiResponse({ status: 400, description: 'الموعد ليس في حالة الانتظار' })
    confirmAppointment(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.appointmentsService.confirmAppointment(id, req.user.id);
    }

    @Post(':id/reject')
    @ApiOperation({ summary: 'رفض موعد من المريض', description: 'رفض طلب موعد قادم من بوابة المرضى' })
    @ApiParam({ name: 'id', description: 'معرف الموعد' })
    @ApiBody({ schema: { properties: { reason: { type: 'string', description: 'سبب الرفض (اختياري)' } } } })
    @ApiResponse({ status: 200, description: 'تم رفض الموعد بنجاح' })
    @ApiResponse({ status: 400, description: 'الموعد ليس في حالة الانتظار' })
    rejectAppointment(@Param('id', ParseIntPipe) id: number, @Request() req, @Body('reason') reason?: string) {
        return this.appointmentsService.rejectAppointment(id, req.user.id, reason);
    }
}
