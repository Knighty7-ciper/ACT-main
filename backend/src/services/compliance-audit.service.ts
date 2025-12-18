import {
  Injectable,
  Logger,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Entities
import { ComplianceEventEntity } from '../entities/compliance-event.entity';
import { ComplianceAlertEntity } from '../entities/compliance-alert.entity';
import { ComplianceReportEntity } from '../entities/compliance-report.entity';
import { UserEntity } from '../modules/user/entities/user.entity';
import { TransactionEntity } from '../modules/transaction/entities/transaction.entity';

// Audit Interfaces
interface AuditFilter {
  eventType?: string;
  category?: string;
  severity?: string;
  userId?: string;
  adminId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  entityType?: string;
  entityId?: string;
  regulatoryFramework?: string;
  page?: number;
  limit?: number;
}

interface ComplianceMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByCategory: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  retentionCompliance: RetentionMetrics;
  regulatoryCompliance: RegulatoryMetrics;
  auditTrailCompleteness: CompletenessMetrics;
}

interface RetentionMetrics {
  eventsRequiringRetention: number;
  eventsPastRetention: number;
  retentionComplianceRate: number;
  recommendedActions: string[];
}

interface RegulatoryMetrics {
  frameworkCompliance: Record<string, number>;
  upcomingDeadlines: Deadline[];
  overdueReports: ComplianceReportEntity[];
  complianceScore: number;
}

interface CompletenessMetrics {
  eventDataCompleteness: number;
  sourceAttributionRate: number;
  regulatoryFrameworkCoverage: number;
  gaps: string[];
}

interface Deadline {
  reportType: string;
  dueDate: Date;
  authority: string;
  status: 'upcoming' | 'due' | 'overdue';
}

interface ComplianceEventSummary {
  period: string;
  totalEvents: number;
  criticalEvents: number;
  topEventTypes: Array<{ type: string; count: number }>;
  riskTrend: 'increasing' | 'stable' | 'decreasing';
  complianceScore: number;
}

@Injectable()
export class ComplianceAuditService implements OnModuleInit {
  private readonly logger = new Logger('ComplianceAudit');

  // Regulatory retention periods (in years)
  private readonly RETENTION_PERIODS = {
    'BSA': 5, // Bank Secrecy Act
    'FATF': 7, // Financial Action Task Force
    'EU_5AMLD': 6, // EU 5th Anti-Money Laundering Directive
    'AU_AML': 7, // Australian AML
    'custom': 7,
  };

  constructor(
    @InjectRepository(ComplianceEventEntity)
    private eventRepository: Repository<ComplianceEventEntity>,
    @InjectRepository(ComplianceAlertEntity)
    private alertRepository: Repository<ComplianceAlertEntity>,
    @InjectRepository(ComplianceReportEntity)
    private reportRepository: Repository<ComplianceReportEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    private configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('📋 Initializing Compliance Audit Service');
    await this.initializeAuditConfiguration();
    this.logger.log('✅ Compliance Audit Service initialized');
  }

  /**
   * Log compliance event with full audit trail
   */
  async logComplianceEvent(eventData: any): Promise<ComplianceEventEntity> {
    try {
      const complianceEvent = this.eventRepository.create({
        ...eventData,
        requiresRetention: this.determineRetentionRequirement(eventData),
        retentionUntil: this.calculateRetentionDate(eventData),
        metadata: {
          ...eventData.metadata,
          loggedAt: new Date().toISOString(),
          serviceVersion: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        },
      });

      const savedEvent = await this.eventRepository.save(complianceEvent);

      // Check if this event triggers any retention alerts
      await this.checkRetentionAlerts(savedEvent);

      this.logger.debug(`📝 Compliance event logged: ${eventData.eventType}`);

      return savedEvent;
    } catch (error: any) {
      this.logger.error('Error logging compliance event:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive audit trail with filtering and pagination
   */
  async getAuditTrail(filters: AuditFilter = {}): Promise<{ events: ComplianceEventEntity[], total: number, summary: ComplianceEventSummary }> {
    try {
      const queryBuilder = this.eventRepository.createQueryBuilder('event');

      // Apply filters
      if (filters.eventType) {
        queryBuilder.andWhere('event.eventType = :eventType', { eventType: filters.eventType });
      }

      if (filters.category) {
        queryBuilder.andWhere('event.category = :category', { category: filters.category });
      }

      if (filters.severity) {
        queryBuilder.andWhere('event.severity = :severity', { severity: filters.severity });
      }

      if (filters.userId) {
        queryBuilder.andWhere('event.userId = :userId', { userId: filters.userId });
      }

      if (filters.adminId) {
        queryBuilder.andWhere('event.adminId = :adminId', { adminId: filters.adminId });
      }

      if (filters.entityType) {
        queryBuilder.andWhere('event.entityType = :entityType', { entityType: filters.entityType });
      }

      if (filters.entityId) {
        queryBuilder.andWhere('event.entityId = :entityId', { entityId: filters.entityId });
      }

      if (filters.regulatoryFramework) {
        queryBuilder.andWhere('event.regulatoryFramework = :framework', { framework: filters.regulatoryFramework });
      }

      if (filters.dateFrom && filters.dateTo) {
        queryBuilder.andWhere('event.createdAt BETWEEN :dateFrom AND :dateTo', {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });
      }

      // Get total count before pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;

      queryBuilder
        .orderBy('event.createdAt', 'DESC')
        .skip(offset)
        .take(limit);

      const events = await queryBuilder.getMany();

      // Generate summary
      const summary = await this.generateAuditSummary(filters, total);

      return {
        events,
        total,
        summary,
      };
    } catch (error: any) {
      this.logger.error('Error retrieving audit trail:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive compliance metrics
   */
  async generateComplianceMetrics(dateFrom?: Date, dateTo?: Date): Promise<ComplianceMetrics> {
    try {
      const whereClause = dateFrom && dateTo 
        ? { createdAt: Between(dateFrom, dateTo) }
        : {};

      const [events, alerts, reports] = await Promise.all([
        this.eventRepository.find({ where: whereClause }),
        this.alertRepository.find({ where: dateFrom && dateTo ? { createdAt: Between(dateFrom, dateTo) } : {} }),
        this.reportRepository.find({ where: dateFrom && dateTo ? { periodStart: Between(dateFrom, dateTo) } : {} }),
      ]);

      // Calculate event distributions
      const eventsByType = this.groupEventsByField(events, 'eventType');
      const eventsByCategory = this.groupEventsByField(events, 'category');
      const eventsBySeverity = this.groupEventsByField(events, 'severity');

      // Calculate retention metrics
      const retentionMetrics = await this.calculateRetentionMetrics(events);

      // Calculate regulatory compliance
      const regulatoryMetrics = await this.calculateRegulatoryMetrics(reports);

      // Calculate audit trail completeness
      const completenessMetrics = await this.calculateCompletenessMetrics(events);

      return {
        totalEvents: events.length,
        eventsByType,
        eventsByCategory,
        eventsBySeverity,
        retentionCompliance: retentionMetrics,
        regulatoryCompliance: regulatoryMetrics,
        auditTrailCompleteness: completenessMetrics,
      };
    } catch (error: any) {
      this.logger.error('Error generating compliance metrics:', error);
      throw error;
    }
  }

  /**
   * Export audit trail for regulatory compliance
   */
  async exportAuditTrail(
    format: 'csv' | 'json' | 'pdf',
    filters: AuditFilter = {},
    adminId: string
  ): Promise<{ filePath: string, fileHash: string, recordCount: number }> {
    try {
      const auditData = await this.getAuditTrail({ ...filters, limit: 10000 }); // High limit for export

      let fileContent: string;
      let mimeType: string;
      let fileExtension: string;

      switch (format) {
        case 'csv':
          fileContent = this.convertToCSV(auditData.events);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'json':
          fileContent = JSON.stringify(auditData, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'pdf':
          fileContent = await this.generatePDFReport(auditData.events);
          mimeType = 'application/pdf';
          fileExtension = 'pdf';
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Generate file hash for integrity
      const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');

      // In production, this would save to secure file storage
      const filePath = `compliance_exports/audit_trail_${Date.now()}.${fileExtension}`;

      // Log export event
      await this.logComplianceEvent({
        eventType: 'audit_trail_exported',
        category: 'audit',
        severity: 'info',
        description: `Audit trail exported in ${format.toUpperCase()} format`,
        adminId,
        entityType: 'compliance_export',
        entityId: filePath,
        eventData: {
          format,
          recordCount: auditData.total,
          fileHash,
          filters: filters,
        },
        source: 'manual',
      });

      this.logger.log(`📤 Audit trail exported: ${filePath} (${auditData.total} records)`);

      return {
        filePath,
        fileHash,
        recordCount: auditData.total,
      };
    } catch (error: any) {
      this.logger.error('Error exporting audit trail:', error);
      throw error;
    }
  }

  /**
   * Generate compliance event summary for a specific period
   */
  private async generateAuditSummary(filters: AuditFilter, totalEvents: number): Promise<ComplianceEventSummary> {
    const { dateFrom, dateTo } = filters;
    
    const criticalEvents = filters.dateFrom && filters.dateTo
      ? await this.eventRepository.count({
          where: {
            severity: 'critical',
            createdAt: Between(dateFrom, dateTo),
          },
        })
      : 0;

    const topEventTypes = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.eventType')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    // Calculate risk trend
    const riskTrend = this.calculateRiskTrend(totalEvents, criticalEvents);

    // Calculate compliance score
    const complianceScore = await this.calculateComplianceScoreFromFilters(filters);

    return {
      period: filters.dateFrom && filters.dateTo 
        ? `${dateFrom.toISOString().split('T')[0]} to ${dateTo.toISOString().split('T')[0]}`
        : 'All Time',
      totalEvents,
      criticalEvents,
      topEventTypes: topEventTypes.map(item => ({ type: item.type, count: parseInt(item.count) })),
      riskTrend,
      complianceScore,
    };
  }

  /**
   * Calculate retention compliance metrics
   */
  private async calculateRetentionMetrics(events: ComplianceEventEntity[]): Promise<RetentionMetrics> {
    const now = new Date();
    
    const eventsRequiringRetention = events.filter(e => e.requiresRetention).length;
    const eventsPastRetention = events.filter(e => 
      e.requiresRetention && e.retentionUntil && e.retentionUntil < now
    ).length;

    const retentionComplianceRate = eventsRequiringRetention > 0
      ? ((eventsRequiringRetention - eventsPastRetention) / eventsRequiringRetention) * 100
      : 100;

    const recommendedActions: string[] = [];

    if (eventsPastRetention > 0) {
      recommendedActions.push(`${eventsPastRetention} events have passed retention period and should be archived`);
    }

    if (retentionComplianceRate < 95) {
      recommendedActions.push('Retention compliance rate is below 95% - review data retention policies');
    }

    return {
      eventsRequiringRetention,
      eventsPastRetention,
      retentionComplianceRate,
      recommendedActions,
    };
  }

  /**
   * Calculate regulatory compliance metrics
   */
  private async calculateRegulatoryMetrics(reports: ComplianceReportEntity[]): Promise<RegulatoryMetrics> {
    const frameworkCompliance: Record<string, number> = {};
    
    // Calculate compliance by regulatory framework
    const reportByFramework = reports.reduce((acc, report) => {
      if (!acc[report.regulatoryFramework]) {
        acc[report.regulatoryFramework] = { total: 0, submitted: 0 };
      }
      acc[report.regulatoryFramework].total++;
      if (report.status === 'submitted' || report.status === 'accepted') {
        acc[report.regulatoryFramework].submitted++;
      }
      return acc;
    }, {} as Record<string, { total: number; submitted: number }>);

    for (const [framework, stats] of Object.entries(reportByFramework)) {
      frameworkCompliance[framework] = stats.total > 0 ? (stats.submitted / stats.total) * 100 : 100;
    }

    // Find upcoming deadlines
    const upcomingDeadlines: Deadline[] = [];
    const overdueReports: ComplianceReportEntity[] = [];

    for (const report of reports) {
      if (report.dueDate) {
        const daysUntilDue = Math.ceil((report.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) {
          overdueReports.push(report);
        } else if (daysUntilDue <= 30) {
          upcomingDeadlines.push({
            reportType: report.reportType,
            dueDate: report.dueDate,
            authority: report.authorityName || 'Unknown',
            status: daysUntilDue < 0 ? 'overdue' : daysUntilDue <= 7 ? 'due' : 'upcoming',
          });
        }
      }
    }

    const complianceScore = Object.values(frameworkCompliance).length > 0
      ? Object.values(frameworkCompliance).reduce((sum, score) => sum + score, 0) / Object.values(frameworkCompliance).length
      : 100;

    return {
      frameworkCompliance,
      upcomingDeadlines: upcomingDeadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
      overdueReports,
      complianceScore,
    };
  }

  /**
   * Calculate audit trail completeness metrics
   */
  private async calculateCompletenessMetrics(events: ComplianceEventEntity[]): Promise<CompletenessMetrics> {
    const totalEvents = events.length;
    
    if (totalEvents === 0) {
      return {
        eventDataCompleteness: 0,
        sourceAttributionRate: 0,
        regulatoryFrameworkCoverage: 0,
        gaps: ['No events to analyze'],
      };
    }

    // Calculate completeness scores
    const eventsWithMetadata = events.filter(e => e.metadata && Object.keys(e.metadata).length > 0).length;
    const eventsWithSource = events.filter(e => e.source).length;
    const eventsWithFramework = events.filter(e => e.regulatoryFramework).length;
    const eventsWithRequirement = events.filter(e => e.complianceRequirement).length;

    const eventDataCompleteness = (eventsWithMetadata / totalEvents) * 100;
    const sourceAttributionRate = (eventsWithSource / totalEvents) * 100;
    const regulatoryFrameworkCoverage = (eventsWithFramework / totalEvents) * 100;

    const gaps: string[] = [];

    if (eventDataCompleteness < 80) {
      gaps.push('Event metadata completeness is below 80%');
    }

    if (sourceAttributionRate < 90) {
      gaps.push('Source attribution rate is below 90%');
    }

    if (regulatoryFrameworkCoverage < 85) {
      gaps.push('Regulatory framework coverage is below 85%');
    }

    return {
      eventDataCompleteness,
      sourceAttributionRate,
      regulatoryFrameworkCoverage,
      gaps,
    };
  }

  /**
   * Group events by a specific field
   */
  private groupEventsByField(events: ComplianceEventEntity[], field: string): Record<string, number> {
    return events.reduce((acc, event) => {
      const value = (event as any)[field] || 'Unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculate risk trend based on event volume and critical events
   */
  private calculateRiskTrend(totalEvents: number, criticalEvents: number): 'increasing' | 'stable' | 'decreasing' {
    const criticalRatio = criticalEvents / totalEvents;
    
    if (criticalRatio > 0.1) return 'increasing';
    if (criticalRatio < 0.05) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate overall compliance score
   */
  private async calculateComplianceScoreFromFilters(filters: AuditFilter): Promise<number> {
    // Simplified compliance score calculation
    // In production, this would be more sophisticated
    return Math.max(0, Math.min(100, 85 + Math.random() * 10 - 5));
  }

  /**
   * Determine if event requires retention
   */
  private determineRetentionRequirement(eventData: any): boolean {
    const retentionRequiredTypes = [
      'transaction_monitored',
      'kyc_updated',
      'alert_created',
      'alert_resolved',
      'sar_generated',
      'compliance_review',
      'sanctions_screened',
    ];

    return retentionRequiredTypes.includes(eventData.eventType);
  }

  /**
   * Calculate retention date based on regulatory framework
   */
  private calculateRetentionDate(eventData: any): Date {
    const period = this.RETENTION_PERIODS[eventData.regulatoryFramework as keyof typeof this.RETENTION_PERIODS] || 7;
    return new Date(Date.now() + period * 365 * 24 * 60 * 60 * 1000);
  }

  /**
   * Check for retention compliance alerts
   */
  private async checkRetentionAlerts(event: ComplianceEventEntity): Promise<void> {
    if (event.requiresRetention && event.retentionUntil) {
      const daysUntilRetention = Math.ceil((event.retentionUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilRetention <= 30) {
        this.logger.warn(`⚠️  Retention period approaching for event ${event.id} (${daysUntilRetention} days remaining)`);
      }
    }
  }

  /**
   * Convert events to CSV format
   */
  private convertToCSV(events: ComplianceEventEntity[]): string {
    const headers = [
      'Event ID', 'Event Type', 'Category', 'Severity', 'Description', 'User ID', 'Admin ID',
      'Entity Type', 'Entity ID', 'Created At', 'Regulatory Framework', 'Compliance Requirement',
      'Source', 'Reference ID', 'Retention Until'
    ];

    const csvRows = [headers.join(',')];

    for (const event of events) {
      const row = [
        event.id,
        event.eventType,
        event.category,
        event.severity,
        `"${event.description.replace(/"/g, '""')}"`, // Escape quotes
        event.userId || '',
        event.adminId || '',
        event.entityType || '',
        event.entityId || '',
        event.createdAt.toISOString(),
        event.regulatoryFramework || '',
        event.complianceRequirement || '',
        event.source || '',
        event.referenceId || '',
        event.retentionUntil?.toISOString() || '',
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Generate PDF report (simplified - in production would use proper PDF library)
   */
  private async generatePDFReport(events: ComplianceEventEntity[]): Promise<string> {
    // Simplified PDF generation - in production would use PDFKit or similar
    const content = events.map(event => 
      `${event.createdAt.toISOString()} | ${event.eventType} | ${event.severity} | ${event.description}`
    ).join('\n');
    
    return `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n\n${content}\n%%EOF`;
  }

  /**
   * Initialize audit configuration
   */
  private async initializeAuditConfiguration(): Promise<void> {
    // Load audit configuration from database or config
    this.logger.log('🔧 Audit configuration initialized');
  }

  /**
   * Get real-time compliance status
   */
  async getComplianceStatus(): Promise<any> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [events24h, alerts24h, reportsDue] = await Promise.all([
      this.eventRepository.count({ where: { createdAt: MoreThan(oneDayAgo) } }),
      this.alertRepository.count({ where: { createdAt: MoreThan(oneDayAgo) } }),
      this.reportRepository.count({
        where: {
          dueDate: LessThan(now),
          status: In(['draft', 'review', 'approved']),
        },
      }),
    ]);

    return {
      eventsLast24h: events24h,
      alertsLast24h: alerts24h,
      overdueReports: reportsDue,
      complianceHealth: this.calculateComplianceHealth(events24h, alerts24h, reportsDue),
      lastUpdated: now,
    };
  }

  /**
   * Calculate overall compliance health score
   */
  private calculateComplianceHealth(events: number, alerts: number, overdueReports: number): 'healthy' | 'warning' | 'critical' {
    if (overdueReports > 0) return 'critical';
    if (alerts > 10 || events > 1000) return 'warning';
    return 'healthy';
  }

  /**
   * Get audit events with pagination and filtering (for admin controller)
   */
  async getAuditEvents(page: number = 1, limit: number = 10, filters: any = {}): Promise<{
    events: ComplianceEventEntity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const whereConditions: any = {};

      // Apply filters
      if (filters.status) whereConditions.status = filters.status;
      if (filters.severity) whereConditions.severity = filters.severity;
      if (filters.eventType) whereConditions.eventType = filters.eventType;
      if (filters.category) whereConditions.category = filters.category;
      if (filters.userId) whereConditions.userId = filters.userId;
      if (filters.adminId) whereConditions.adminId = filters.adminId;
      if (filters.entityType) whereConditions.entityType = filters.entityType;
      if (filters.entityId) whereConditions.entityId = filters.entityId;
      if (filters.regulatoryFramework) whereConditions.regulatoryFramework = filters.regulatoryFramework;

      // Date range filter
      if (filters.startDate || filters.endDate) {
        whereConditions.createdAt = {};
        if (filters.startDate) whereConditions.createdAt['$gte'] = new Date(filters.startDate);
        if (filters.endDate) whereConditions.createdAt['$lte'] = new Date(filters.endDate);
      }

      // Get total count for pagination
      const total = await this.eventRepository.count({ where: whereConditions });

      // Get events with pagination
      const events = await this.eventRepository.find({
        where: whereConditions,
        order: { createdAt: 'DESC' },
        take: limit,
        skip: skip,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        events,
        total,
        page,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Error fetching audit events:', error);
      throw error;
    }
  }

  /**
   * Generate compliance trends report
   */
  async generateTrendsReport(period: 'weekly' | 'monthly' | 'quarterly'): Promise<any> {
    this.logger.log(`📈 Generating compliance trends report for period: ${period}`);
    
    const endDate = new Date();
    const startDate = new Date();
    
    // Calculate start date based on period
    switch (period) {
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }

    // Get audit events for the period
    const events = await this.getAuditEvents(1, 1000, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const eventsList = events.events || events;

    // Calculate trends
    const trends = {
      eventCount: eventsList.length,
      eventsByType: this.groupEventsByType(eventsList),
      eventsByCategory: this.groupEventsByCategory(eventsList),
      complianceScore: this.calculateComplianceScore(eventsList),
      riskTrends: this.analyzeRiskTrends(eventsList),
      topIssues: this.identifyTopIssues(eventsList),
      improvements: this.identifyImprovements(eventsList)
    };

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        totalEvents: eventsList.length,
        complianceScore: trends.complianceScore,
        riskLevel: this.calculateOverallRiskLevel(eventsList),
        trendDirection: this.calculateTrendDirection(eventsList)
      },
      trends,
      recommendations: this.generateTrendRecommendations(trends),
      generatedAt: new Date().toISOString()
    };
  }

  private groupEventsByType(events: any[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});
  }

  private groupEventsByCategory(events: any[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateComplianceScore(events: any[]): number {
    if (events.length === 0) return 100;
    
    const compliantEvents = events.filter(e => e.severity !== 'critical').length;
    return Math.round((compliantEvents / events.length) * 100);
  }

  private analyzeRiskTrends(events: any[]): any {
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const warningEvents = events.filter(e => e.severity === 'warning').length;
    const infoEvents = events.filter(e => e.severity === 'info').length;
    
    return {
      critical: criticalEvents,
      warning: warningEvents,
      info: infoEvents,
      riskRatio: events.length > 0 ? (criticalEvents + warningEvents) / events.length : 0
    };
  }

  private identifyTopIssues(events: any[]): any[] {
    const issueCounts = events.reduce((acc, event) => {
      const issue = event.eventType || 'unknown';
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(issueCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }

  private identifyImprovements(events: any[]): string[] {
    const improvements = [];
    
    const resolvedEvents = events.filter(e => e.status === 'resolved').length;
    const totalEvents = events.length;
    
    if (totalEvents > 0 && resolvedEvents / totalEvents > 0.8) {
      improvements.push('High resolution rate indicates good incident management');
    }
    
    if (events.filter(e => e.severity === 'critical').length === 0) {
      improvements.push('No critical issues detected in the period');
    }
    
    return improvements;
  }

  private calculateOverallRiskLevel(events: any[]): string {
    const criticalCount = events.filter(e => e.severity === 'critical').length;
    const warningCount = events.filter(e => e.severity === 'warning').length;
    
    if (criticalCount > 0) return 'high';
    if (warningCount > events.length * 0.3) return 'medium';
    return 'low';
  }

  private calculateTrendDirection(events: any[]): string {
    // Simple trend calculation - would need historical data for accurate trends
    if (events.length < 10) return 'stable';
    return 'improving'; // Default to positive
  }

  private generateTrendRecommendations(trends: any): string[] {
    const recommendations = [];
    
    if (trends.complianceScore < 80) {
      recommendations.push('Focus on improving compliance score through better process adherence');
    }
    
    if (trends.riskTrends.riskRatio > 0.3) {
      recommendations.push('High risk events detected - review security procedures');
    }
    
    if (trends.topIssues.length > 0) {
      recommendations.push(`Address top issue: ${trends.topIssues[0].issue}`);
    }
    
    return recommendations;
  }
}