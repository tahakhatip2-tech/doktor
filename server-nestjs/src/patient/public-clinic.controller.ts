import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PatientService } from './patient.service';

/**
 * Public controller — no authentication required.
 * Used for shareable clinic profile links.
 */
@Controller('public')
export class PublicClinicController {
    constructor(private readonly patientService: PatientService) {}

    @Get('clinics/:id')
    async getPublicClinic(@Param('id', ParseIntPipe) id: number) {
        return this.patientService.getClinicById(id);
    }
}
