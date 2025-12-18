import {
  Injectable,
  Logger,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// Entities
import { TransactionEntity } from '../modules/transaction/entities/transaction.entity';
import { UserEntity } from '../modules/user/entities/user.entity';
import { ComplianceAlertEntity } from '../entities/compliance-alert.entity';
import { ComplianceEventEntity } from '../entities/compliance-event.entity';

// Compliance Interfaces
interface TransactionAnalysisResult {
  transactionId: string;
  riskScore: number;
  alerts: ComplianceAlert[];
  requiresReview: boolean;
  automatedActions: string[];
}

interface ComplianceAlert {
  type: string;
  severity: string;
  description: string;
  rule: string;
  data: any;
}

interface AMLThresholds {
  largeTransaction: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  velocityThreshold: number;
  structuringThreshold: number;
}

@Injectable()
export class AMLTransactionMonitorService implements OnModuleInit {
  private readonly logger = new Logger('AMLTransactionMonitor');
  
  private readonly AML_THRESHOLDS: AMLThresholds = {
    largeTransaction: 10000, // $10,000 USD equivalent
    dailyLimit: 50000, // $50,000 USD daily limit
    weeklyLimit: 250000, // $250,000 USD weekly limit
    monthlyLimit: 1000000, // $1M USD monthly limit
    velocityThreshold: 5, // 5 transactions per hour
    structuringThreshold: 9000, // Just under reporting threshold
  };

  private monitoringRules: Map<string, any> = new Map();

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ComplianceAlertEntity)
    private alertRepository: Repository<ComplianceAlertEntity>,
    @InjectRepository(ComplianceEventEntity)
    private eventRepository: Repository<ComplianceEventEntity>,
    private configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('🔍 Initializing AML Transaction Monitor Service');
    await this.loadMonitoringRules();
    await this.initializeHighRiskJurisdictions();
    this.logger.log('✅ AML Transaction Monitor Service initialized');
  }

  /**
   * Real-time transaction monitoring from TransactionEntity
   * Analyzes transactions for AML compliance using actual data
   */
  async monitorTransaction(transactionId: string): Promise<TransactionAnalysisResult> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
        relations: ['user', 'user.wallets'],
      });

      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      const analysisResult = await this.analyzeTransactionCompliance(transaction);
      
      // Log compliance event
      await this.logComplianceEvent({
        eventType: 'transaction_monitored',
        category: 'aml',
        severity: analysisResult.alerts.length > 0 ? 'warning' : 'info',
        description: `Transaction ${transactionId} analyzed with ${analysisResult.alerts.length} alerts`,
        userId: transaction.userId,
        transactionId: transaction.id,
        entityType: 'transaction',
        entityId: transaction.id,
        eventData: {
          analysisResult,
          amount: transaction.fromAmount,
          currency: transaction.fromCurrency,
          type: transaction.type,
        },
        source: 'automated',
      });

      // Create alerts if necessary
      for (const alert of analysisResult.alerts) {
        await this.createComplianceAlert(transaction, alert);
      }

      return analysisResult;
    } catch (error: any) {
      this.logger.error(`Error monitoring transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Analyze transaction for AML compliance using real data
   */
  private async analyzeTransactionCompliance(
    transaction: TransactionEntity,
  ): Promise<TransactionAnalysisResult> {
    const alerts: ComplianceAlert[] = [];
    const automatedActions: string[] = [];
    let riskScore = 0;

    // 1. Large Transaction Analysis
    const largeTransactionAlert = await this.checkLargeTransaction(transaction);
    if (largeTransactionAlert) {
      alerts.push(largeTransactionAlert);
      riskScore += largeTransactionAlert.severity === 'critical' ? 30 : 15;
    }

    // 2. Velocity Analysis - Real data from TransactionEntity
    const velocityAlert = await this.checkVelocityPattern(transaction);
    if (velocityAlert) {
      alerts.push(velocityAlert);
      riskScore += 20;
    }

    // 3. Structuring Detection
    const structuringAlert = await this.checkStructuring(transaction);
    if (structuringAlert) {
      alerts.push(structuringAlert);
      riskScore += 25;
    }

    // 4. Geographic Risk Analysis
    const geographicAlert = await this.checkGeographicRisk(transaction);
    if (geographicAlert) {
      alerts.push(geographicAlert);
      riskScore += geographicAlert.severity === 'critical' ? 35 : 15;
    }

    // 5. User Risk Profile Analysis
    const userRiskAlert = await this.checkUserRiskProfile(transaction);
    if (userRiskAlert) {
      alerts.push(userRiskAlert);
      riskScore += 20;
    }

    // 6. High-Risk Transaction Types
    const highRiskAlert = await this.checkHighRiskTransactionTypes(transaction);
    if (highRiskAlert) {
      alerts.push(highRiskAlert);
      riskScore += 15;
    }

    // Determine automated actions based on risk score and alerts
    if (riskScore >= 70) {
      automatedActions.push('freeze_transaction');
      automatedActions.push('enhanced_monitoring');
      automatedActions.push('senior_review_required');
    } else if (riskScore >= 50) {
      automatedActions.push('enhanced_review');
      automatedActions.push('additional_documentation');
    } else if (alerts.length > 0) {
      automatedActions.push('monitoring_flag');
    }

    return {
      transactionId: transaction.id,
      riskScore,
      alerts,
      requiresReview: riskScore >= 50 || alerts.some(a => a.severity === 'high' || a.severity === 'critical'),
      automatedActions,
    };
  }

  /**
   * Check for large transactions exceeding AML thresholds
   */
  private async checkLargeTransaction(
    transaction: TransactionEntity,
  ): Promise<ComplianceAlert | null> {
    const threshold = this.AML_THRESHOLDS.largeTransaction;
    
    if (transaction.fromAmount >= threshold) {
      return {
        type: 'aml_threshold',
        severity: transaction.fromAmount >= threshold * 2 ? 'critical' : 'high',
        description: `Transaction amount ${transaction.fromAmount} ${transaction.fromCurrency} exceeds threshold ${threshold} USD`,
        rule: 'large_transaction_threshold',
        data: {
          amount: transaction.fromAmount,
          currency: transaction.fromCurrency,
          threshold,
          excess: transaction.fromAmount - threshold,
        },
      };
    }
    return null;
  }

  /**
   * Analyze transaction velocity patterns using real transaction history
   */
  private async checkVelocityPattern(
    transaction: TransactionEntity,
  ): Promise<ComplianceAlert | null> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTransactions = await this.transactionRepository.count({
      where: {
        userId: transaction.userId,
        createdAt: MoreThan(oneHourAgo),
      },
    });

    if (recentTransactions >= this.AML_THRESHOLDS.velocityThreshold) {
      return {
        type: 'velocity',
        severity: recentTransactions >= this.AML_THRESHOLDS.velocityThreshold * 2 ? 'high' : 'medium',
        description: `User has ${recentTransactions} transactions in the last hour, exceeding threshold ${this.AML_THRESHOLDS.velocityThreshold}`,
        rule: 'velocity_monitoring',
        data: {
          recentCount: recentTransactions,
          threshold: this.AML_THRESHOLDS.velocityThreshold,
          timeframe: '1_hour',
        },
      };
    }
    return null;
  }

  /**
   * Detect structuring (smurfing) patterns
   */
  private async checkStructuring(
    transaction: TransactionEntity,
  ): Promise<ComplianceAlert | null> {
    const threshold = this.AML_THRESHOLDS.structuringThreshold;
    const lookbackPeriod = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    
    // Get recent transactions for this user
    const recentTransactions = await this.transactionRepository.find({
      where: {
        userId: transaction.userId,
        createdAt: MoreThan(lookbackPeriod),
        status: 'completed',
      },
      order: { createdAt: 'DESC' },
    });

    // Check for patterns: multiple transactions just under threshold
    const nearThresholdTransactions = recentTransactions.filter(
      t => t.fromAmount >= threshold * 0.8 && t.fromAmount < threshold
    );

    if (nearThresholdTransactions.length >= 3) {
      const totalAmount = nearThresholdTransactions.reduce((sum, t) => sum + t.fromAmount, 0);
      
      return {
        type: 'structuring',
        severity: nearThresholdTransactions.length >= 5 ? 'high' : 'medium',
        description: `Detected potential structuring: ${nearThresholdTransactions.length} transactions totaling ${totalAmount} ${transaction.fromCurrency} in 24 hours`,
        rule: 'structuring_detection',
        data: {
          patternTransactions: nearThresholdTransactions.length,
          totalAmount,
          timeSpan: '24_hours',
          avgAmount: totalAmount / nearThresholdTransactions.length,
        },
      };
    }
    return null;
  }

  /**
   * Check geographic risk based on user country and transaction patterns
   */
  private async checkGeographicRisk(
    transaction: TransactionEntity,
  ): Promise<ComplianceAlert | null> {
    const user = await this.userRepository.findOne({
      where: { id: transaction.userId },
    });

    if (!user || !user.countryCode) {
      return null;
    }

    // High-risk jurisdictions (simplified list)
    const highRiskCountries = ['IR', 'KP', 'SY', 'SD', 'AF', 'IQ', 'YE', 'LY', 'CU', 'BY'];
    
    if (highRiskCountries.includes(user.countryCode)) {
      return {
        type: 'geographic_risk',
        severity: 'critical',
        description: `Transaction involving user from high-risk jurisdiction: ${user.countryCode}`,
        rule: 'high_risk_jurisdiction',
        data: {
          userCountry: user.countryCode,
          transactionCurrency: transaction.fromCurrency,
          userRiskLevel: 'high',
        },
      };
    }

    // Check for unusual currency patterns
    const unusualCurrencyCombinations = ['USD', 'RUB', 'CNY', 'BTC', 'ETH'];
    if (unusualCurrencyCombinations.includes(transaction.fromCurrency) && 
        unusualCurrencyCombinations.includes(transaction.toCurrency)) {
      return {
        type: 'currency_risk',
        severity: 'medium',
        description: `Unusual currency combination: ${transaction.fromCurrency} to ${transaction.toCurrency}`,
        rule: 'currency_combination_risk',
        data: {
          fromCurrency: transaction.fromCurrency,
          toCurrency: transaction.toCurrency,
          combination: `${transaction.fromCurrency}/${transaction.toCurrency}`,
        },
      };
    }

    return null;
  }

  /**
   * Check user risk profile from UserEntity compliance fields
   */
  private async checkUserRiskProfile(
    transaction: TransactionEntity,
  ): Promise<ComplianceAlert | null> {
    const user = await this.userRepository.findOne({
      where: { id: transaction.userId },
    });

    if (!user) {
      return null;
    }

    const alerts: ComplianceAlert[] = [];

    // Check PEP status
    if (user.isPEP) {
      alerts.push({
        type: 'pep_transaction',
        severity: 'high',
        description: 'Transaction involving Politically Exposed Person',
        rule: 'pep_monitoring',
        data: {
          pepCategory: user.pepCategory,
          pepDetails: user.pepDetails,
        },
      });
    }

    // Check KYC status
    if (user.kycStatus !== 'verified') {
      alerts.push({
        type: 'kyc_status',
        severity: user.kycStatus === 'unverified' ? 'high' : 'medium',
        description: `Transaction by user with ${user.kycStatus} KYC status`,
        rule: 'kyc_verification_required',
        data: {
          kycStatus: user.kycStatus,
          verificationLevel: user.verificationLevel,
        },
      });
    }

    // Check sanctions screening
    if (!user.sanctionsScreeningPassed) {
      alerts.push({
        type: 'sanctions_risk',
        severity: 'critical',
        description: 'Transaction by user who has not passed sanctions screening',
        rule: 'sanctions_compliance',
        data: {
          sanctionsScreeningResult: user.sanctionsScreeningResult,
          screeningDate: user.sanctionsScreeningDate,
        },
      });
    }

    // Check risk rating
    if (user.riskRating === 'high' || user.riskRating === 'critical') {
      alerts.push({
        type: 'user_risk_rating',
        severity: user.riskRating === 'critical' ? 'critical' : 'high',
        description: `Transaction by user with ${user.riskRating} risk rating`,
        rule: 'user_risk_rating',
        data: {
          riskRating: user.riskRating,
          riskFactors: user.complianceNotes,
        },
      });
    }

    return alerts.length > 0 ? alerts[0] : null;
  }

  /**
   * Check for high-risk transaction types
   */
  private async checkHighRiskTransactionTypes(
    transaction: TransactionEntity,
  ): Promise<ComplianceAlert | null> {
    const highRiskTypes = ['withdrawal', 'cross_border_transfer', 'crypto_conversion'];
    const mediumRiskTypes = ['exchange', 'transfer'];

    if (highRiskTypes.includes(transaction.type)) {
      return {
        type: 'high_risk_transaction',
        severity: 'medium',
        description: `High-risk transaction type: ${transaction.type}`,
        rule: 'transaction_type_monitoring',
        data: {
          transactionType: transaction.type,
          riskLevel: 'high',
        },
      };
    }

    if (mediumRiskTypes.includes(transaction.type) && transaction.fromAmount > 5000) {
      return {
        type: 'medium_risk_transaction',
        severity: 'low',
        description: `Medium-risk transaction type: ${transaction.type} with amount ${transaction.fromAmount}`,
        rule: 'transaction_type_monitoring',
        data: {
          transactionType: transaction.type,
          amount: transaction.fromAmount,
          currency: transaction.fromCurrency,
          riskLevel: 'medium',
        },
      };
    }

    return null;
  }

  /**
   * Create compliance alert in database
   */
  private async createComplianceAlert(
    transaction: TransactionEntity,
    alertData: ComplianceAlert,
  ): Promise<ComplianceAlertEntity> {
    const alert = this.alertRepository.create({
      alertType: alertData.type,
      severity: alertData.severity,
      status: 'open',
      description: alertData.description,
      alertRule: alertData.rule,
      triggerData: alertData.data,
      transactionAmount: transaction.fromAmount,
      transactionCurrency: transaction.fromCurrency,
      userId: transaction.userId,
      transactionId: transaction.id,
      riskFactors: [alertData.data],
    });

    const savedAlert = await this.alertRepository.save(alert);

    this.logger.warn(`🚨 Compliance Alert Created: ${alertData.type} - ${alertData.description}`);

    return savedAlert;
  }

  /**
   * Log compliance event for audit trail
   */
  private async logComplianceEvent(eventData: any): Promise<ComplianceEventEntity> {
    const event = this.eventRepository.create({
      ...eventData,
      regulatoryFramework: 'BSA',
      complianceRequirement: 'Anti-Money Laundering',
      requiresRetention: true,
      retentionUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
    });

    return await this.eventRepository.save(event);
  }

  /**
   * Load monitoring rules from database or configuration
   */
  private async loadMonitoringRules(): Promise<void> {
    // In production, this would load from database or configuration
    this.monitoringRules.set('velocity_threshold', 5);
    this.monitoringRules.set('amount_threshold', 10000);
    this.monitoringRules.set('structuring_amount', 9000);
  }

  /**
   * Initialize high-risk jurisdictions list
   */
  private async initializeHighRiskJurisdictions(): Promise<void> {
    // This would typically load from a sanctions database
    this.logger.log('🌍 High-risk jurisdictions initialized');
  }

  /**
   * Get real-time AML statistics from database
   */
  async getAMLStatistics(): Promise<any> {
    const totalTransactions = await this.transactionRepository.count({
      where: { status: 'completed' },
    });

    const alertsLast30Days = await this.alertRepository.count({
      where: {
        createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      },
    });

    const highRiskTransactions = await this.transactionRepository.count({
      where: {
        fromAmount: MoreThan(this.AML_THRESHOLDS.largeTransaction),
        status: 'completed',
      },
    });

    return {
      totalTransactions,
      alertsLast30Days,
      highRiskTransactions,
      averageRiskScore: 0, // Would be calculated from analysis results
      topAlertTypes: [],
    };
  }

  /**
   * Get compliance alerts with pagination and filtering
   */
  async getAlerts(page: number = 1, limit: number = 10, filters: any = {}): Promise<{
    alerts: ComplianceAlertEntity[];
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
      if (filters.alertType) whereConditions.alertType = filters.alertType;
      if (filters.userId) whereConditions.userId = filters.userId;
      if (filters.transactionId) whereConditions.transactionId = filters.transactionId;

      // Date range filter
      if (filters.startDate || filters.endDate) {
        whereConditions.createdAt = {};
        if (filters.startDate) whereConditions.createdAt['$gte'] = new Date(filters.startDate);
        if (filters.endDate) whereConditions.createdAt['$lte'] = new Date(filters.endDate);
      }

      // Get total count for pagination
      const total = await this.alertRepository.count({ where: whereConditions });

      // Get alerts with pagination
      const alerts = await this.alertRepository.find({
        where: whereConditions,
        order: { createdAt: 'DESC' },
        take: limit,
        skip: skip,
        relations: ['user', 'transaction'],
      });

      const totalPages = Math.ceil(total / limit);

      return {
        alerts,
        total,
        page,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Get a specific compliance alert by ID
   */
  async getAlertById(id: string): Promise<ComplianceAlertEntity> {
    try {
      const alert = await this.alertRepository.findOne({
        where: { id },
        relations: ['user', 'transaction'],
      });

      if (!alert) {
        throw new Error(`Alert with ID ${id} not found`);
      }

      return alert;
    } catch (error: any) {
      this.logger.error(`Error fetching alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update compliance alert status
   */
  async updateAlertStatus(
    id: string,
    status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'escalated' | 'closed',
    notes?: string,
  ): Promise<ComplianceAlertEntity> {
    try {
      const alert = await this.alertRepository.findOne({ where: { id } });

      if (!alert) {
        throw new Error(`Alert with ID ${id} not found`);
      }

      // Update status
      alert.status = status;

      // Add notes if provided
      if (notes) {
        alert.resolutionNotes = notes;
      }

      // Set resolved date if status is resolved or closed
      if (status === 'resolved' || status === 'false_positive' || status === 'closed') {
        alert.resolvedAt = new Date();
      }

      // Update audit trail
      alert.updatedAt = new Date();
      alert.updatedBy = 'admin'; // In real implementation, get from current user

      const updatedAlert = await this.alertRepository.save(alert);

      // Log the status change
      await this.logComplianceEvent({
        eventType: 'alert_status_updated',
        category: 'alert_management',
        severity: 'info',
        description: `Alert ${id} status updated to ${status}${notes ? ' with notes' : ''}`,
        userId: alert.userId,
        transactionId: alert.transactionId,
        entityType: 'compliance_alert',
        entityId: alert.id,
        eventData: {
          alertId: id,
          previousStatus: alert.status,
          newStatus: status,
          notes: notes,
        },
        source: 'admin',
      });

      this.logger.log(`Alert ${id} status updated to ${status}`);

      return updatedAlert;
    } catch (error: any) {
      this.logger.error(`Error updating alert status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk resolve multiple AML alerts
   */
  async bulkResolveAlerts(alertIds: string[], action: string, adminId: string = 'admin'): Promise<any> {
    this.logger.log(`📋 Bulk resolving ${alertIds.length} AML alerts`);
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const alertId of alertIds) {
      try {
        let newStatus: string;
        let notes: string;

        // Determine status and notes based on action
        switch (action) {
          case 'resolve':
            newStatus = 'resolved';
            notes = 'Bulk resolved by admin';
            break;
          case 'investigate':
            newStatus = 'investigating';
            notes = 'Bulk investigation started by admin';
            break;
          case 'review':
            newStatus = 'pending_review';
            notes = 'Bulk review requested by admin';
            break;
          default:
            throw new Error(`Invalid action: ${action}`);
        }

        const updatedAlert = await this.updateAlertStatus(alertId, newStatus, notes);
        results.push({
          alertId,
          success: true,
          newStatus,
          message: `Alert ${alertId} ${newStatus} successfully`
        });
        successCount++;
      } catch (error: any) {
        results.push({
          alertId,
          success: false,
          message: error.message
        });
        errorCount++;
      }
    }

    this.logger.log(`✅ Bulk alert resolution completed: ${successCount} succeeded, ${errorCount} failed`);

    return {
      totalProcessed: alertIds.length,
      successCount,
      errorCount,
      action,
      adminId,
      results,
      timestamp: new Date()
    };
  }
}