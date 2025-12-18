import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { FraudDetectionService } from './fraud-detection.service';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@Controller('fraud-detection')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FraudDetectionController {
  constructor(private readonly fraudDetectionService: FraudDetectionService) {}

  @Get('alerts')
  @Roles('admin')
  async getFraudAlerts(
    @Query('userId') userId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.fraudDetectionService.getFraudAlerts(userId, page, limit);
  }

  @Post('alerts/:alertId/resolve')
  @Roles('admin')
  async resolveFraudAlert(
    @Param('alertId') alertId: string,
    @Body() body: { status: string },
  ) {
    return this.fraudDetectionService.resolveFraudAlert(
      alertId, 
      body.status, 
      'admin-id' // This would come from JWT token
    );
  }

  @Post('analyze')
  async analyzeTransaction(
    @Body() body: {
      transactionId: string;
      userId: string;
      amount: number;
      currency: string;
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
      locationLat?: number;
      locationLng?: number;
      countryCode?: string;
    }
  ) {
    return this.fraudDetectionService.analyzeTransaction(body);
  }
}