import { Controller, Post, Get, Delete, Body, UseGuards, Request, Param, ParseIntPipe, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PatientAppointmentService } from './patient-appointment.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { CreatePatientAppointmentDto, CancelAppointmentDto } from './patient-appointment.dto';
import { PatientAuthGuard } from './patient-auth.guard';

@Controller('patient/appointments')
@UseGuards(PatientAuthGuard)
export class PatientAppointmentController {
    constructor(
        private readonly appointmentService: PatientAppointmentService,
        private readonly apptsService: AppointmentsService
    ) { }

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

    @Post(':id/pdf')
    async generatePdf(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() data: any) {
        // asPatient = true
        return this.apptsService.generatePrescription(id, req.user.id, data?.docType, true);
    }

    @Delete(':id')
    async cancelAppointment(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CancelAppointmentDto,
    ) {
        return this.appointmentService.cancelAppointment(req.user.id, id, dto);
    }

    @Get(':id/video-token')
    async getVideoToken(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.appointmentService.getVideoToken(req.user.id, id);
    }

    @Post(':id/upload-file')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const dir = './uploads/patient-files';
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    async uploadFile(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        const fileUrl = `/uploads/patient-files/${file.filename}`;
        return this.appointmentService.uploadPatientFile(req.user.id, id, fileUrl, file.originalname);
    }
}
