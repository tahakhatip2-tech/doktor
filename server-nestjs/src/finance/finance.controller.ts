import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('stats')
  async getStats(@Request() req) {
    // req.user contains the authenticated clinic/user info
    return this.financeService.getFinanceStats(req.user.id || req.user.userId);
  }

  @Get('history')
  async getHistory(@Request() req, @Query('limit') limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.financeService.getFinanceHistory(req.user.id || req.user.userId, limit);
  }

  @Get('chart')
  async getChart(@Request() req) {
    return this.financeService.getFinanceChart(req.user.id || req.user.userId);
  }
}
