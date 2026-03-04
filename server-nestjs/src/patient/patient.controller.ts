import { Controller, Post, Get, Put, Body, UseGuards, Request, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { RegisterPatientDto, LoginPatientDto, UpdatePatientProfileDto } from './patient.dto';
import { PatientAuthGuard } from './patient-auth.guard';
import { AppointmentsService } from '../appointments/appointments.service';

@Controller('patient')
export class PatientController {
    constructor(
        private readonly patientService: PatientService,
        private readonly appointmentsService: AppointmentsService,
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
}
