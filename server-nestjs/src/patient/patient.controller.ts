import { Controller, Post, Get, Put, Body, UseGuards, Request, Param, ParseIntPipe, Query, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PatientService } from './patient.service';
import { RegisterPatientDto, LoginPatientDto, UpdatePatientProfileDto } from './patient.dto';
import { PatientAuthGuard } from './patient-auth.guard';
import { AppointmentsService } from '../appointments/appointments.service';
import { SupabaseService } from '../storage/supabase.service';

@Controller('patient')
export class PatientController {
    private readonly logger = new Logger(PatientController.name);

    constructor(
        private readonly patientService: PatientService,
        private readonly appointmentsService: AppointmentsService,
        private readonly supabaseService: SupabaseService,
    ) { }

    @Post('auth/register')
    async register(@Body() dto: RegisterPatientDto) {
        return this.patientService.register(dto);
    }

    @Post('auth/login')
    async login(@Body() dto: LoginPatientDto) {
        return this.patientService.login(dto);
    }

    @Get('profile')
    @UseGuards(PatientAuthGuard)
    async getProfile(@Request() req) {
        return this.patientService.getProfile(req.user.id);
    }

    @Put('profile')
    @UseGuards(PatientAuthGuard)
    async updateProfile(@Request() req, @Body() dto: UpdatePatientProfileDto) {
        return this.patientService.updateProfile(req.user.id, dto);
    }

    @Post('profile/avatar')
    @UseGuards(PatientAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (_req, file, cb) => {
                if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname)) {
                    return cb(new BadRequestException('صيغة الملف غير مدعومة. الرجاء اختيار صورة JPG/PNG/WEBP/GIF.'), false);
                }
                cb(null, true);
            },
        }),
    )
    async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('لم يتم اختيار ملف');
        }

        try {
            const url = await this.supabaseService.uploadFile(file, 'patient-avatars');
            const updated = await this.patientService.updateAvatar(req.user.id, url);
            return { avatar: url, url, patient: updated };
        } catch (err: unknown) {
            const e = err as Error;
            this.logger.error(`Patient avatar upload failed: ${e?.message || err}`, e?.stack);
            throw new InternalServerErrorException(
                e?.message || 'فشل رفع الصورة. حاول مرة أخرى.',
            );
        }
    }

    @Get('clinics')
    @UseGuards(PatientAuthGuard)
    async getClinics() {
        return this.patientService.getClinics();
    }

    @Get('clinics/:id')
    @UseGuards(PatientAuthGuard)
    async getClinicById(@Param('id', ParseIntPipe) id: number) {
        return this.patientService.getClinicById(id);
    }

    // ─── المواعيد المتاحة لعيادة في يوم معين ───────────────
    @Get('clinics/:id/available-slots')
    @UseGuards(PatientAuthGuard)
    async getAvailableSlots(
        @Param('id', ParseIntPipe) clinicId: number,
        @Query('date') date: string,
    ) {
        const slots = await this.appointmentsService.getAvailableSlots(clinicId, date);
        return { date, clinicId, slots };
    }

    @Get('pharmacies')
    @UseGuards(PatientAuthGuard)
    async getPharmacies() {
        return this.patientService.getPharmacies();
    }

    @Get('prescriptions')
    @UseGuards(PatientAuthGuard)
    async getPrescriptions(@Request() req) {
        return this.patientService.getPrescriptions(req.user.id);
    }

    @Post('prescriptions/:id/send-to-pharmacy')
    @UseGuards(PatientAuthGuard)
    async sendPrescriptionToPharmacy(
        @Request() req,
        @Param('id', ParseIntPipe) prescriptionId: number,
        @Body('pharmacyId', ParseIntPipe) pharmacyId: number
    ) {
        return this.patientService.sendPrescriptionToPharmacy(req.user.id, prescriptionId, pharmacyId);
    }
}
