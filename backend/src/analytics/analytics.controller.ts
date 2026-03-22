import { Controller, Get, UseGuards, Query, Res } from '@nestjs/common';
import * as express from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  getStats(@Query('range') range?: string) {
    return this.analyticsService.getStats(range);
  }

  @Get('export')
  async export(@Query('range') range: string, @Res() res: express.Response) {
    const csv = await this.analyticsService.exportStats(range);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analytics-report-${range}-${new Date().toISOString().split('T')[0]}.csv"`,
    });
    return res.send(csv);
  }
}
