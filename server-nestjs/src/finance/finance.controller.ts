import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('stats')
  async getStats(@Request() req) {
    const userId = req.user.id || req.user.userId;
    const role = req.user.role || 'USER';
    return this.financeService.getFinanceStats(userId, role);
  }

  @Get('history')
  async getHistory(@Request() req, @Query('limit') limitStr?: string) {
    const userId = req.user.id || req.user.userId;
    const role = req.user.role || 'USER';
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.financeService.getFinanceHistory(userId, limit, role);
  }

  @Get('chart')
  async getChart(@Request() req) {
    const userId = req.user.id || req.user.userId;
    const role = req.user.role || 'USER';
    return this.financeService.getFinanceChart(userId, role);
  }

  @Get('pharmacy/advanced')
  async getPharmacyAdvanced(@Request() req) {
    const userId = req.user.id || req.user.userId;
    return this.financeService.getPharmacyAdvancedStats(userId);
  }
}
