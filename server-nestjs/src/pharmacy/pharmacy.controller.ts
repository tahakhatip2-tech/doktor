import { Controller, Post, Body, Get, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post('auth/register')
  async register(@Body() body: any) {
    return this.pharmacyService.register(body);
  }

  @Post('auth/login')
  async login(@Body() body: any) {
    return this.pharmacyService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.pharmacyService.getDashboardStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('prescriptions')
  async getPrescriptions(@Request() req, @Body('status') status?: string) {
    return this.pharmacyService.getPrescriptions(req.user.id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('prescriptions/:id/dispense')
  async dispensePrescription(@Request() req, @Param('id') id: string) {
    return this.pharmacyService.dispensePrescription(req.user.id, parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  async getSettings(@Request() req) {
    return this.pharmacyService.getSettings(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('settings')
  async updateSettings(@Request() req, @Body() body: any) {
    return this.pharmacyService.updateSettings(req.user.id, body);
  }
}
