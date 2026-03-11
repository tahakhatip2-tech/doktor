import { Controller, Post, Get, Delete, Body, UseGuards, Request, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PatientAppointmentService } from './patient-appointment.service';
import { CreatePatientAppointmentDto, CancelAppointmentDto } from './patient-appointment.dto';
import { PatientAuthGuard } from './patient-auth.guard';

@Controller('patient/appointments')
@UseGuards(PatientAuthGuard)
export class PatientAppointmentController {
    constructor(private readonly appointmentService: PatientAppointmentService) { }

    // ─── المسارات الثابتة أولاً (قبل :id الديناميكي) ───────────────────────

    @Get('upcoming')
    async getUpcomingAppointments(@Request() req) {
        return this.appointmentService.getUpcomingAppointments(req.user.id);
    }

    @Get('medical-records/all')
    async getMedicalRecords(@Request() req) {
        return this.appointmentService.getMedicalRecords(req.user.id);
    }

    @Get('medical-records/:id/advice')
    async getRecordAiAdvice(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.appointmentService.getRecordAiAdvice(req.user.id, id);
    }

    // ─── المسارات الديناميكية بعد الثابتة ──────────────────────────────────

    @Post()
    async createAppointment(@Request() req, @Body() dto: CreatePatientAppointmentDto) {
        return this.appointmentService.createAppointment(req.user.id, dto);
    }

    @Get()
    async getMyAppointments(@Request() req, @Query('status') status?: string) {
        return this.appointmentService.getMyAppointments(req.user.id, status);
    }

    @Get(':id')
    async getAppointmentById(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.appointmentService.getAppointmentById(req.user.id, id);
    }

    @Delete(':id')
    async cancelAppointment(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CancelAppointmentDto,
    ) {
        return this.appointmentService.cancelAppointment(req.user.id, id, dto);
    }
}
