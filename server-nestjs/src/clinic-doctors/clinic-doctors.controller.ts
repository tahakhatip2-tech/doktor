import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ClinicDoctorsService } from './clinic-doctors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clinic-doctors')
@UseGuards(JwtAuthGuard)
export class ClinicDoctorsController {
  constructor(private readonly service: ClinicDoctorsService) {}

  // GET /clinic-doctors - جلب أطباء العيادة
  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }

  // POST /clinic-doctors - إضافة طبيب
  @Post()
  create(@Request() req, @Body() body: {
    name: string;
    specialty?: string;
    phone?: string;
    workingHours?: string;
    hourlyRate?: number;
  }) {
    return this.service.create(req.user.id, body);
  }

  // PATCH /clinic-doctors/:id - تعديل طبيب
  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      name?: string;
      specialty?: string;
      phone?: string;
      workingHours?: string;
      hourlyRate?: number;
      isActive?: boolean;
    },
  ) {
    return this.service.update(req.user.id, id, body);
  }

  // DELETE /clinic-doctors/:id - حذف طبيب
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(req.user.id, id);
  }
}
