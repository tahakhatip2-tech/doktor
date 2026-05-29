import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ClinicDoctorsService } from './clinic-doctors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clinic-doctors')
export class ClinicDoctorsController {
  constructor(private readonly service: ClinicDoctorsService) {}

  // POST /clinic-doctors/login — بدون Auth guard (لأنه تسجيل دخول الموظف)
  @Post('login')
  loginAsStaff(@Body() body: { username: string; password: string }) {
    return this.service.loginAsStaff(body.username, body.password);
  }

  // GET /clinic-doctors
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }

  // POST /clinic-doctors
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() body: {
    name: string;
    role?: string;
    specialty?: string;
    email?: string;
    phone?: string;
    workingHours?: string;
    hourlyRate?: number;
    username?: string;
    password?: string;
    avatar?: string;
    workingDays?: string;
    shiftTiming?: string;
    certifications?: string;
    experienceYears?: number;
  }) {
    return this.service.create(req.user.id, body);
  }

  // PATCH /clinic-doctors/:id
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      name?: string;
      role?: string;
      specialty?: string;
      email?: string;
      phone?: string;
      workingHours?: string;
      hourlyRate?: number;
      isActive?: boolean;
      username?: string;
      password?: string;
      avatar?: string;
      workingDays?: string;
      shiftTiming?: string;
      certifications?: string;
      experienceYears?: number;
    },
  ) {
    return this.service.update(req.user.id, id, body);
  }

  // DELETE /clinic-doctors/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(req.user.id, id);
  }
}
