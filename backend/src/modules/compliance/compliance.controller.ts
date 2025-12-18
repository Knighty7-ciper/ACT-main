import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

// Services
import { AMLTransactionMonitorService } from '../../services/aml-transaction-monitor.service';
import { RegulatoryReportingService } from '../../services/regulatory-reporting.service';
import { KYCVerificationService } from '../../services/kyc-verification.service';
import { ComplianceAuditService } from '../../services/compliance-audit.service';

// Entities
import { ComplianceAlertEntity } from '../../entities/compliance-alert.entity';
import { ComplianceEventEntity } from '../../entities/compliance-event.entity';
import { ComplianceReportEntity } from '../../entities/compliance-report.entity';
import { KYCDocumentEntity } from '../../entities/kyc-document.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { TransactionEntity } from '../../modules/transaction/entities/transaction.entity';

// DTOs
import { CreateSARDto } from './dto/create-sar.dto';
import { UpdateAlertStatusDto } from './dto/update-alert-status.dto';
import { ExportAuditTrailDto } from './dto/export-audit-trail.dto';
import { GenerateReportDto } from './dto/generate-report.dto';

@Controller('compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ComplianceController {
  private readonly logger = new Logger('ComplianceController');

  constructor(
    @InjectRepository(ComplianceAlertEntity)
    private alertRepository: Repository<ComplianceAlertEntity>,
    @InjectRepository(ComplianceEventEntity)
    private eventRepository: Repository<ComplianceEventEntity>,
    @InjectRepository(ComplianceReportEntity)
    private reportRepository: Repository<ComplianceReportEntity>,
    @InjectRepository(KYCDocumentEntity)
    private documentRepository: Repository<KYCDocumentEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    
    private amlService: AMLTransactionMonitorService,
    private reportingService: RegulatoryReportingService,
    private kycService: KYCVerificationService,
    private auditService: ComplianceAuditService,
  ) {}

  // ================================
  // AML TRANSACTION MONITORING
  // ================================

  /**
   * Monitor specific transaction for AML compliance
   */
  @Post('transactions/:transactionId/monitor')
  async monitorTransaction(
    @Param('transactionId') transactionId: string,
    @Body() body: { adminId: string }
  ) {
    try {
      const result = await this.amlService.monitorTransaction(transactionId);
      
      this.logger.log(`Transaction ${transactionId} monitored for AML compliance`);
      
      return {
        success: true,
        data: result,
        message: 'Transaction monitored successfully',
      };
    } catch (error) {
      this.logger.error(`Error monitoring transaction ${transactionId}:`, error);
      throw new HttpException(
        'Failed to monitor transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get AML statistics dashboard
   */
  @Get('aml/statistics')
  async getAMLStatistics(): Promise<any> {
    try {
      const [statistics, alerts, userStats] = await Promise.all([
        this.amlService.getAMLStatistics(),
        this.alertRepository.find({
          where: { createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) },
          order: { createdAt: 'DESC' },
          take: 10,
        }),
        this.userRepository.find({
          select: ['id', 'email', 'kycStatus', 'riskRating', 'countryCode'],
        }),
      ]);

      return {
        success: true,
        data: {
          amlMetrics: statistics,
          recentAlerts: alerts,
          userDistribution: this.analyzeUserRiskDistribution(userStats),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching AML statistics:', error);
      throw new HttpException(
        'Failed to fetch AML statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ================================
  // COMPLIANCE ALERTS MANAGEMENT
  // ================================

  /**
   * Get all compliance alerts with filtering
   */
  @Get('alerts')
  async getComplianceAlerts(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('type') type?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const queryBuilder = this.alertRepository.createQueryBuilder('alert')
        .leftJoinAndSelect('alert.user', 'user')
        .leftJoinAndSelect('alert.transaction', 'transaction');

      if (status) queryBuilder.andWhere('alert.status = :status', { status });
      if (severity) queryBuilder.andWhere('alert.severity = :severity', { severity });
      if (type) queryBuilder.andWhere('alert.alertType = :type', { type });
      
      if (dateFrom && dateTo) {
        queryBuilder.andWhere('alert.createdAt BETWEEN :dateFrom AND :dateTo', {
          dateFrom: new Date(dateFrom),
          dateTo: new Date(dateTo),
        });
      }

      const total = await queryBuilder.getCount();
      const alerts = await queryBuilder
        .orderBy('alert.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        success: true,
        data: {
          alerts,
          pagination: {
            page: parseInt(page.toString()),
            limit: parseInt(limit.toString()),
            total,
            totalPages: Math.ceil(total / parseInt(limit.toString())),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error fetching compliance alerts:', error);
      throw new HttpException(
        'Failed to fetch compliance alerts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update alert status and resolution
   */
  @Put('alerts/:alertId/status')
  async updateAlertStatus(
    @Param('alertId') alertId: string,
    @Body() updateData: UpdateAlertStatusDto & { adminId: string }
  ) {
    try {
      const alert = await this.alertRepository.findOne({ where: { id: alertId } });
      if (!alert) {
        throw new HttpException('Alert not found', HttpStatus.NOT_FOUND);
      }

      alert.status = updateData.status;
      alert.resolvedAt = updateData.status === 'resolved' ? new Date() : undefined;
      alert.resolvedBy = updateData.adminId;
      alert.resolutionNotes = updateData.notes;

      await this.alertRepository.save(alert);

      // Log compliance event
      await this.auditService.logComplianceEvent({
        eventType: 'alert_resolved',
        category: 'aml',
        severity: alert.severity === 'critical' ? 'high' : 'info',
        description: `Alert ${alertId} status updated to ${updateData.status}`,
        alertId: alertId,
        adminId: updateData.adminId,
        entityType: 'compliance_alert',
        entityId: alertId,
        eventData: {
          previousStatus: alert.status,
          newStatus: updateData.status,
          resolutionNotes: updateData.notes,
        },
        source: 'manual',
      });

      return {
        success: true,
        data: alert,
        message: 'Alert status updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating alert ${alertId}:`, error);
      throw new HttpException(
        'Failed to update alert status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get alert statistics
   */
  @Get('alerts/statistics')
  async getAlertStatistics(): Promise<any> {
    try {
      const [
        totalAlerts,
        openAlerts,
        resolvedAlerts,
        criticalAlerts,
        alertsByType,
        alertsBySeverity,
      ] = await Promise.all([
        this.alertRepository.count(),
        this.alertRepository.count({ where: { status: 'open' } }),
        this.alertRepository.count({ where: { status: 'resolved' } }),
        this.alertRepository.count({ where: { severity: 'critical' } }),
        this.alertRepository
          .createQueryBuilder('alert')
          .select('alert.alertType', 'type')
          .addSelect('COUNT(*)', 'count')
          .groupBy('alert.alertType')
          .getRawMany(),
        this.alertRepository
          .createQueryBuilder('alert')
          .select('alert.severity', 'severity')
          .addSelect('COUNT(*)', 'count')
          .groupBy('alert.severity')
          .getRawMany(),
      ]);

      return {
        success: true,
        data: {
          summary: {
            total: totalAlerts,
            open: openAlerts,
            resolved: resolvedAlerts,
            critical: criticalAlerts,
            resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0,
          },
          byType: alertsByType,
          bySeverity: alertsBySeverity,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching alert statistics:', error);
      throw new HttpException(
        'Failed to fetch alert statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ================================
  // REGULATORY REPORTING
  // ================================

  /**
   * Generate Suspicious Activity Report (SAR)
   */
  @Post('reports/sar')
  async generateSAR(@Body() data: CreateSARDto) {
    try {
      const report = await this.reportingService.generateSAR(
        data.alertId, 
        [], // transactionIds - need to get from alert or provide empty array
        'Manual SAR generation via compliance interface', 
        data.adminId
      );
      
      return {
        success: true,
        data: report,
        message: 'SAR generated successfully',
      };
    } catch (error) {
      this.logger.error('Error generating SAR:', error);
      throw new HttpException(
        'Failed to generate SAR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate Currency Transaction Report (CTR)
   */
  @Post('reports/ctr')
  async generateCTR(@Body() data: { transactionId: string; adminId: string }) {
    try {
      const report = await this.reportingService.generateCTR(
        [data.transactionId], // transactionIds as array
        10000, // thresholdAmount - default $10,000
        data.adminId
      );
      
      return {
        success: true,
        data: report,
        message: 'CTR generated successfully',
      };
    } catch (error) {
      this.logger.error('Error generating CTR:', error);
      throw new HttpException(
        'Failed to generate CTR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate monthly compliance report
   */
  @Post('reports/monthly')
  async generateMonthlyReport(@Body() data: { year: number; month: number; adminId: string }) {
    try {
      const report = await this.reportingService.generateMonthlyReport(
        data.year,
        data.month,
        data.adminId,
      );
      
      return {
        success: true,
        data: report,
        message: 'Monthly report generated successfully',
      };
    } catch (error) {
      this.logger.error('Error generating monthly report:', error);
      throw new HttpException(
        'Failed to generate monthly report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all compliance reports
   */
  @Get('reports')
  async getReports(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    try {
      const filters = { reportType: type, status };
      const result = await this.reportingService.getReports(page, limit, filters);
      
      return {
        success: true,
        data: result,
        message: 'Reports retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching compliance reports:', error);
      throw new HttpException(
        'Failed to fetch compliance reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get report statistics
   */
  @Get('reports/statistics')
  async getReportStatistics(): Promise<any> {
    try {
      const statistics = await this.reportingService.getReportStatistics();
      
      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      this.logger.error('Error fetching report statistics:', error);
      throw new HttpException(
        'Failed to fetch report statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ================================
  // KYC VERIFICATION
  // ================================

  /**
   * Perform KYC verification for user
   */
  @Post('kyc/verify/:userId')
  async performKYCVerification(
    @Param('userId') userId: string,
    @Body() body: { adminId: string },
  ) {
    try {
      const result = await this.kycService.performKYCVerification(userId, body.adminId);
      
      return {
        success: true,
        data: result,
        message: 'KYC verification completed successfully',
      };
    } catch (error) {
      this.logger.error(`Error performing KYC verification for user ${userId}:`, error);
      throw new HttpException(
        'Failed to perform KYC verification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get KYC statistics
   */
  @Get('kyc/statistics')
  async getKYCStatistics(): Promise<any> {
    try {
      const statistics = await this.kycService.getKYCStatistics();
      
      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      this.logger.error('Error fetching KYC statistics:', error);
      throw new HttpException(
        'Failed to fetch KYC statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get KYC documents for user
   */
  @Get('kyc/documents/:userId')
  async getKYCDocuments(@Param('userId') userId: string) {
    try {
      const documents = await this.documentRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      
      return {
        success: true,
        data: { documents },
      };
    } catch (error) {
      this.logger.error(`Error fetching KYC documents for user ${userId}:`, error);
      throw new HttpException(
        'Failed to fetch KYC documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ================================
  // AUDIT TRAIL & COMPLIANCE EVENTS
  // ================================

  /**
   * Get comprehensive audit trail
   */
  @Get('audit/trail')
  async getAuditTrail(
    @Query() filters: any,
  ) {
    try {
      // Parse pagination parameters
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 50;
      
      // Parse date parameters
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : undefined;

      const auditData = await this.auditService.getAuditTrail({
        ...filters,
        page,
        limit,
        dateFrom,
        dateTo,
      });
      
      return {
        success: true,
        data: auditData,
      };
    } catch (error) {
      this.logger.error('Error fetching audit trail:', error);
      throw new HttpException(
        'Failed to fetch audit trail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Export audit trail
   */
  @Post('audit/export')
  async exportAuditTrail(@Body() data: ExportAuditTrailDto) {
    try {
      const result = await this.auditService.exportAuditTrail(
        data.format,
        data.filters,
        data.adminId,
      );
      
      return {
        success: true,
        data: result,
        message: `Audit trail exported in ${data.format.toUpperCase()} format`,
      };
    } catch (error) {
      this.logger.error('Error exporting audit trail:', error);
      throw new HttpException(
        'Failed to export audit trail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get compliance metrics
   */
  @Get('metrics')
  async getComplianceMetrics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const fromDate = dateFrom ? new Date(dateFrom) : undefined;
      const toDate = dateTo ? new Date(dateTo) : undefined;

      const [metrics, status] = await Promise.all([
        this.auditService.generateComplianceMetrics(fromDate, toDate),
        this.auditService.getComplianceStatus(),
      ]);
      
      return {
        success: true,
        data: {
          metrics,
          realTimeStatus: status,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching compliance metrics:', error);
      throw new HttpException(
        'Failed to fetch compliance metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get compliance dashboard summary
   */
  @Get('dashboard')
  async getComplianceDashboard(): Promise<any> {
    try {
      const [amlStats, alertStats, kycStats, reportStats, auditStatus] = await Promise.all([
        this.amlService.getAMLStatistics(),
        this.getAlertStatistics(),
        this.kycService.getKYCStatistics(),
        this.reportingService.getReportStatistics(),
        this.auditService.getComplianceStatus(),
      ]);

      return {
        success: true,
        data: {
          aml: amlStats,
          alerts: alertStats.data,
          kyc: kycStats,
          reports: reportStats,
          audit: auditStatus,
          lastUpdated: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching compliance dashboard:', error);
      throw new HttpException(
        'Failed to fetch compliance dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ================================
  // HELPER METHODS
  // ================================

  /**
   * Analyze user risk distribution for dashboard
   */
  private analyzeUserRiskDistribution(users: UserEntity[]) {
    const distribution = users.reduce((acc, user) => {
      const rating = user.riskRating || 'unknown';
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = users.length;
    return Object.entries(distribution).map(([rating, count]) => ({
      rating,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }
}