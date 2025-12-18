import {
  Injectable,
  Logger,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// Entities
import { TransactionEntity } from '../modules/transaction/entities/transaction.entity';
import { UserEntity } from '../modules/user/entities/user.entity';
import { ComplianceAlertEntity } from '../entities/compliance-alert.entity';
import { ComplianceReportEntity } from '../entities/compliance-report.entity';
import { ComplianceEventEntity } from '../entities/compliance-event.entity';

// Reporting Interfaces
interface ReportCriteria {
  reportType: string;
  periodStart: Date;
  periodEnd: Date;
  filters?: any;
  includePersonalData?: boolean;
}

interface SARData {
  subjectInformation: any;
  transactionDetails: any;
  suspiciousActivity: string;
  investigationSummary: string;
  supportingDocuments: string[];
}

interface CTRData {
  transactionDate: string;
  amount: number;
  currency: string;
  parties: any[];
  transactionType: string;
}

@Injectable()
export class RegulatoryReportingService implements OnModuleInit {
  private readonly logger = new Logger('RegulatoryReporting');

  private readonly REPORT_TEMPLATES = {
    sar: {
      name: 'Suspicious Activity Report',
      framework: 'BSA',
      format: 'xml',
      requiredFields: ['subjectInformation', 'transactionDetails', 'suspiciousActivity'],
    },
    ctr: {
      name: 'Currency Transaction Report',
      framework: 'BSA',
      format: 'xml',
      requiredFields: ['transactionDate', 'amount', 'currency', 'parties'],
    },
    monthly_compliance: {
      name: 'Monthly Compliance Summary',
      framework: 'internal',
      format: 'pdf',
      requiredFields: ['summary', 'metrics', 'findings'],
    },
    quarterly_review: {
      name: 'Quarterly Compliance Review',
      framework: 'internal',
      format: 'pdf',
      requiredFields: ['trends', 'riskAssessment', 'recommendations'],
    },
  };

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ComplianceAlertEntity)
    private alertRepository: Repository<ComplianceAlertEntity>,
    @InjectRepository(ComplianceReportEntity)
    private reportRepository: Repository<ComplianceReportEntity>,
    @InjectRepository(ComplianceEventEntity)
    private eventRepository: Repository<ComplianceEventEntity>,
    private configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('📊 Initializing Regulatory Reporting Service');
    this.logger.log('✅ Regulatory Reporting Service initialized');
  }

  /**
   * Generate Suspicious Activity Report (SAR) using real data
   * Updated to match admin controller expectations
   */
  async generateSAR(userId: string, transactionIds: string[], reason: string, adminId: string): Promise<ComplianceReportEntity> {
    try {
      // Get user information
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['wallets', 'transactions'],
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Get transactions for the SAR
      const transactions = await this.transactionRepository.find({
        where: { 
          id: transactionIds.length === 1 ? transactionIds[0] : undefined,
          userId: userId,
        },
        take: transactionIds.length > 1 ? transactionIds.length : undefined,
      });

      if (transactions.length === 0) {
        throw new Error(`No transactions found for user ${userId}`);
      }

      const sarData = await this.buildSARDataFromTransactions(user, transactions, reason);
      
      const report = this.reportRepository.create({
        reportType: 'sar',
        reportCategory: 'aml',
        regulatoryFramework: 'BSA',
        period: 'on_demand',
        periodStart: new Date(),
        periodEnd: new Date(),
        status: 'draft',
        reportData: sarData,
        summary: {
          alertType: 'user_activity',
          severity: 'high',
          subject: user.email || 'Unknown',
          transactionAmount: transactions.reduce((sum, t) => sum + Number(t.fromAmount), 0),
          currency: transactions[0]?.fromCurrency || 'USD',
        },
        findings: {
          suspiciousActivity: sarData.suspiciousActivity,
          riskFactors: ['unusual_transaction_patterns'],
          investigationNotes: reason,
        },
        totalTransactions: transactions.length,
        totalVolume: transactions.reduce((sum, t) => sum + Number(t.fromAmount), 0),
        suspiciousTransactions: transactions.length,
        alertsGenerated: 1,
        automatedGeneration: false,
        createdBy: adminId,
        includesPersonalData: true,
        retentionPeriod: '7_years',
      });

      const savedReport = await this.reportRepository.save(report);

      // Log compliance event
      await this.logComplianceEvent({
        eventType: 'sar_generated',
        category: 'reporting',
        severity: 'info',
        description: `SAR generated for user ${userId} with ${transactions.length} transaction(s)`,
        userId: userId,
        adminId,
        entityType: 'compliance_report',
        entityId: savedReport.id,
        eventData: { reportType: 'sar', userId, transactionCount: transactions.length },
        referenceId: savedReport.id,
        source: 'manual',
      });

      this.logger.log(`📋 SAR generated: ${savedReport.id}`);

      return savedReport;
    } catch (error) {
      this.logger.error(`Error generating SAR for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Generate Currency Transaction Report (CTR) for large transactions
   * Updated to match admin controller expectations
   */
  async generateCTR(transactionIds: string[], thresholdAmount: number, adminId: string): Promise<ComplianceReportEntity> {
    try {
      // Get transactions for the CTR
      const transactions = await this.transactionRepository.find({
        where: transactionIds.length === 1 
          ? { id: transactionIds[0] }
          : { id: transactionIds as any },
        relations: ['user'],
      });

      if (transactions.length === 0) {
        throw new Error(`No transactions found with IDs: ${transactionIds.join(', ')}`);
      }

      const ctrData = await this.buildCTRDataFromTransactions(transactions, thresholdAmount);
      
      const report = this.reportRepository.create({
        reportType: 'ctr',
        reportCategory: 'aml',
        regulatoryFramework: 'BSA',
        period: 'on_demand',
        periodStart: new Date(),
        periodEnd: new Date(),
        reportData: ctrData,
        status: 'generated',
      });

      if (transactions.length === 0) {
        throw new Error(`No transactions found with IDs: ${transactionIds.join(', ')}`);
      }

      const savedReport = await this.reportRepository.save(report);

      // Log compliance event
      await this.logComplianceEvent({
        eventType: 'ctr_report_generated',
        category: 'aml_reporting',
        severity: 'info',
        description: `CTR report generated for ${transactions.length} transactions`,
        adminId,
        entityType: 'compliance_report',
        entityId: savedReport.id,
        eventData: { reportType: 'ctr', transactionCount: transactions.length },
        referenceId: savedReport.id,
        source: 'automated',
      });

      this.logger.log(`📋 CTR report generated: ${savedReport.id}`);

      return savedReport;
    } catch (error) {
      this.logger.error(`Error generating CTR for transactions:`, error);
      throw error;
    }
  }

  /**
   * Generate monthly compliance summary report
   */
  async generateMonthlyReport(year: number, month: number, adminId: string): Promise<ComplianceReportEntity> {
    try {
      const periodStart = new Date(year, month - 1, 1);
      const periodEnd = new Date(year, month, 0, 23, 59, 59);

      const reportData = await this.buildMonthlyReportData(periodStart, periodEnd);
      
      const report = this.reportRepository.create({
        reportType: 'monthly_summary',
        reportCategory: 'compliance',
        regulatoryFramework: 'internal',
        period: 'monthly',
        periodStart,
        periodEnd,
        status: 'approved',
        reportData,
        summary: {
          totalTransactions: reportData.summary.totalTransactions,
          totalVolume: reportData.summary.totalVolume,
          alertsGenerated: reportData.summary.alertsGenerated,
          highRiskTransactions: reportData.summary.highRiskTransactions,
        },
        findings: reportData.findings,
        totalTransactions: reportData.summary.totalTransactions,
        totalVolume: reportData.summary.totalVolume,
        suspiciousTransactions: reportData.summary.suspiciousTransactions,
        alertsGenerated: reportData.summary.alertsGenerated,
        automatedGeneration: true,
        createdBy: adminId,
        includesPersonalData: false,
        retentionPeriod: '3_years',
      });

      const savedReport = await this.reportRepository.save(report);

      // Log compliance event
      await this.logComplianceEvent({
        eventType: 'monthly_report_generated',
        category: 'reporting',
        severity: 'info',
        description: `Monthly compliance report generated for ${year}-${month.toString().padStart(2, '0')}`,
        adminId,
        entityType: 'compliance_report',
        entityId: savedReport.id,
        eventData: { reportType: 'monthly_summary', year, month },
        referenceId: savedReport.id,
        source: 'automated',
      });

      this.logger.log(`📈 Monthly report generated: ${savedReport.id}`);

      return savedReport;
    } catch (error) {
      this.logger.error(`Error generating monthly report for ${year}-${month}:`, error);
      throw error;
    }
  }

  /**
   * Build SAR data structure from compliance alert
   */
  private async buildSARData(alert: ComplianceAlertEntity): Promise<SARData> {
    const user = await this.userRepository.findOne({
      where: { id: alert.userId },
    });

    return {
      subjectInformation: {
        name: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown',
        email: user?.email || 'Unknown',
        country: user?.countryCode || 'Unknown',
        kycStatus: user?.kycStatus || 'unknown',
        riskRating: user?.riskRating || 'unknown',
        isPEP: user?.isPEP || false,
      },
      transactionDetails: {
        date: alert.createdAt,
        amount: alert.transactionAmount,
        currency: alert.transactionCurrency,
        type: alert.transactionId ? 'Transaction' : 'Account Activity',
        referenceId: alert.transactionId,
      },
      suspiciousActivity: alert.description,
      investigationSummary: alert.resolutionNotes || 'Investigation ongoing',
      supportingDocuments: [], // Would include supporting documentation
    };
  }

  /**
   * Build CTR data structure from transaction
   */
  private async buildCTRData(transaction: TransactionEntity): Promise<CTRData> {
    const user = await this.userRepository.findOne({
      where: { id: transaction.userId },
    });

    return {
      transactionDate: transaction.createdAt.toISOString(),
      amount: Number(transaction.fromAmount),
      currency: transaction.fromCurrency,
      parties: [
        {
          role: 'customer',
          name: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown',
          identifier: user?.email || 'Unknown',
          country: user?.countryCode || 'Unknown',
        },
      ],
      transactionType: transaction.type,
    };
  }

  /**
   * Build SAR data from user and transactions (for updated generateSAR)
   */
  private async buildSARDataFromTransactions(user: UserEntity, transactions: TransactionEntity[], reason: string): Promise<SARData> {
    return {
      subjectInformation: {
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.email,
        country: user.countryCode,
        userId: user.id,
        riskRating: user.riskRating || 'unknown',
      },
      transactionDetails: transactions.map(t => ({
        transactionId: t.id,
        amount: Number(t.fromAmount),
        currency: t.fromCurrency,
        type: t.type,
        date: t.createdAt.toISOString(),
        status: t.status,
      })),
      suspiciousActivity: reason,
      investigationSummary: `Automated SAR generation based on ${transactions.length} suspicious transaction(s)`,
      supportingDocuments: [], // Would include transaction records, user documents, etc.
    };
  }

  /**
   * Build CTR data from transactions (for updated generateCTR)
   */
  private async buildCTRDataFromTransactions(transactions: TransactionEntity[], thresholdAmount: number): Promise<CTRData[]> {
    const ctrData: CTRData[] = [];

    for (const transaction of transactions) {
      // Only include transactions above threshold
      if (Number(transaction.fromAmount) >= thresholdAmount) {
        const user = await this.userRepository.findOne({
          where: { id: transaction.userId },
        });

        ctrData.push({
          transactionDate: transaction.createdAt.toISOString(),
          amount: Number(transaction.fromAmount),
          currency: transaction.fromCurrency,
          parties: [
            {
              role: 'customer',
              name: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown',
              identifier: user?.email || 'Unknown',
              country: user?.countryCode || 'Unknown',
            },
          ],
          transactionType: transaction.type,
        });
      }
    }

    return ctrData;
  }

  /**
   * Build comprehensive monthly report data
   */
  private async buildMonthlyReportData(periodStart: Date, periodEnd: Date): Promise<any> {
    // Get real data from repositories
    const [transactions, alerts, users, events] = await Promise.all([
      this.transactionRepository.find({
        where: { createdAt: Between(periodStart, periodEnd), status: 'completed' },
      }),
      this.alertRepository.find({
        where: { createdAt: Between(periodStart, periodEnd) },
      }),
      this.userRepository.find(),
      this.eventRepository.find({
        where: { createdAt: Between(periodStart, periodEnd) },
      }),
    ]);

    const totalVolume = transactions.reduce((sum, t) => sum + Number(t.fromAmount), 0);
    const highRiskTransactions = transactions.filter(t => Number(t.fromAmount) > 10000);
    const suspiciousTransactions = transactions.filter(t => alerts.some(a => a.transactionId === t.id));

    return {
      summary: {
        period: `${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`,
        totalTransactions: transactions.length,
        totalVolume,
        alertsGenerated: alerts.length,
        highRiskTransactions: highRiskTransactions.length,
        suspiciousTransactions: suspiciousTransactions.length,
        usersReviewed: users.length,
        complianceEvents: events.length,
      },
      findings: {
        topAlertTypes: this.getTopAlertTypes(alerts),
        riskTrends: this.analyzeRiskTrends(alerts),
        geographicDistribution: this.analyzeGeographicDistribution(users),
        transactionPatterns: this.analyzeTransactionPatterns(transactions),
      },
      trends: {
        monthlyComparison: {}, // Would compare to previous month
        alertTrend: alerts.length > 0 ? 'increasing' : 'stable',
        riskTrend: highRiskTransactions.length > 10 ? 'elevated' : 'normal',
      },
      recommendations: this.generateRecommendations(alerts, transactions),
    };
  }

  /**
   * Get top alert types for reporting
   */
  private getTopAlertTypes(alerts: ComplianceAlertEntity[]): any[] {
    const alertTypeCounts = alerts.reduce((acc, alert) => {
      acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(alertTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Analyze risk trends from alerts
   */
  private analyzeRiskTrends(alerts: ComplianceAlertEntity[]): any {
    const severityCounts = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: alerts.length,
      bySeverity: severityCounts,
      riskDistribution: Object.entries(severityCounts).map(([severity, count]) => ({
        severity,
        percentage: alerts.length > 0 ? (count / alerts.length) * 100 : 0,
      })),
    };
  }

  /**
   * Analyze geographic distribution of users
   */
  private analyzeGeographicDistribution(users: UserEntity[]): any {
    const countryCounts = users.reduce((acc, user) => {
      const country = user.countryCode || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Analyze transaction patterns
   */
  private analyzeTransactionPatterns(transactions: TransactionEntity[]): any {
    const typeCounts = transactions.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const currencyPairs = transactions.reduce((acc, transaction) => {
      const pair = `${transaction.fromCurrency}/${transaction.toCurrency}`;
      acc[pair] = (acc[pair] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      byType: typeCounts,
      currencyPairs,
      averageAmount: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + Number(t.fromAmount), 0) / transactions.length 
        : 0,
    };
  }

  /**
   * Generate compliance recommendations
   */
  private generateRecommendations(alerts: ComplianceAlertEntity[], transactions: TransactionEntity[]): string[] {
    const recommendations: string[] = [];

    if (alerts.length > 50) {
      recommendations.push('Consider enhancing monitoring rules to reduce false positives');
    }

    const highSeverityAlerts = alerts.filter(a => a.severity === 'high' || a.severity === 'critical');
    if (highSeverityAlerts.length > 5) {
      recommendations.push('Review high-severity alerts and consider additional preventive measures');
    }

    const largeTransactions = transactions.filter(t => Number(t.fromAmount) > 10000);
    if (largeTransactions.length > 10) {
      recommendations.push('Monitor large transaction patterns for potential structuring');
    }

    return recommendations;
  }

  /**
   * Log compliance event for audit trail
   */
  private async logComplianceEvent(eventData: any): Promise<ComplianceEventEntity> {
    const event = this.eventRepository.create({
      ...eventData,
      regulatoryFramework: 'BSA',
      complianceRequirement: 'Regulatory Reporting',
      requiresRetention: true,
      retentionUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
    });

    return await this.eventRepository.save(event);
  }

  /**
   * Get all compliance reports with filtering and pagination
   */
  async getReports(page?: number, limit?: number, filters?: any): Promise<{
    reports: ComplianceReportEntity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Support both old and new calling patterns
    if (typeof page === 'object' && page !== null) {
      // Called with getReports(filters) - backward compatibility
      filters = page;
      page = 1;
      limit = 50;
    }

    const skip = ((page || 1) - 1) * (limit || 10);
    
    const queryBuilder = this.reportRepository.createQueryBuilder('report')
      .orderBy('report.createdAt', 'DESC');

    if (filters?.reportType) {
      queryBuilder.andWhere('report.reportType = :reportType', { reportType: filters.reportType });
    }

    if (filters?.status) {
      queryBuilder.andWhere('report.status = :status', { status: filters.status });
    }

    const [reports, total] = await queryBuilder
      .skip(skip)
      .take(limit || 10)
      .getManyAndCount();

    const totalPages = Math.ceil(total / (limit || 10));

    return {
      reports,
      total,
      page: page || 1,
      totalPages,
    };
  }

  /**
   * Get report statistics
   */
  async getReportStatistics(): Promise<any> {
    const totalReports = await this.reportRepository.count();
    
    const reportsByType = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.reportType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.reportType')
      .getRawMany();

    const reportsByStatus = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.status')
      .getRawMany();

    return {
      totalReports,
      byType: reportsByType,
      byStatus: reportsByStatus,
    };
  }
}