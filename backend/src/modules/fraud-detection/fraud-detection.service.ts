import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { 
  FraudAlert,
  UserRiskProfile,
  TransactionRiskAnalysis,
  FraudPattern,
  TransactionMonitoringRule
} from './entities';
import { v4 as uuidv4 } from 'uuid';

interface TransactionRiskRequest {
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

interface RiskAnalysisResult {
  riskScore: number;
  approved: boolean;
  requiresReview: boolean;
  riskFactors: string[];
  velocityScore: number;
  geographicScore: number;
  behavioralScore: number;
  amountDeviationScore: number;
  confidenceScore: number;
}

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  constructor(
    @InjectRepository(UserRiskProfile)
    private riskProfileRepository: Repository<UserRiskProfile>,
    @InjectRepository(TransactionRiskAnalysis)
    private analysisRepository: Repository<TransactionRiskAnalysis>,
    @InjectRepository(FraudAlert)
    private alertRepository: Repository<FraudAlert>,
    @InjectRepository(FraudPattern)
    private patternRepository: Repository<FraudPattern>,
    @InjectRepository(TransactionMonitoringRule)
    private monitoringRuleRepository: Repository<TransactionMonitoringRule>,
  ) {}

  async analyzeTransaction(request: TransactionRiskRequest): Promise<RiskAnalysisResult> {
    const {
      transactionId,
      userId,
      amount,
      currency,
      ipAddress,
      userAgent,
      deviceFingerprint,
      locationLat,
      locationLng,
      countryCode
    } = request;

    // Get or create user risk profile
    let userProfile = await this.riskProfileRepository.findOne({
      where: { userId }
    });

    if (!userProfile) {
      userProfile = await this.createUserRiskProfile(userId);
    }

    // Perform comprehensive risk analysis
    const velocityScore = await this.analyzeVelocityRisk(userId, amount);
    const geographicScore = await this.analyzeGeographicRisk(userId, locationLat, locationLng, countryCode);
    const behavioralScore = await this.analyzeBehavioralRisk(userId, deviceFingerprint, userAgent, ipAddress);
    const amountDeviationScore = await this.analyzeAmountDeviationRisk(userId, amount, currency);

    // Calculate weighted risk score
    const riskScore = Math.min(100, (
      (velocityScore * 0.3) +
      (geographicScore * 0.2) +
      (behavioralScore * 0.3) +
      (amountDeviationScore * 0.2)
    ));

    const riskFactors = this.identifyRiskFactors(velocityScore, geographicScore, behavioralScore, amountDeviationScore);

    // Determine if transaction is approved, requires review, or should be blocked
    const approved = riskScore < 70;
    const requiresReview = riskScore >= 50 && riskScore < 90;

    // Save transaction risk analysis
    const analysis = this.analysisRepository.create({
      transactionId,
      userId,
      riskScore,
      approved,
      requiresReview,
      riskFactors: riskFactors, // Pass array directly, TypeORM handles JSONB serialization
      velocityScore,
      geographicScore,
      behavioralScore,
      amountDeviationScore,
      deviceFingerprint,
      ipAddress,
      userAgent,
      locationLat,
      locationLng,
      countryCode
    });

    await this.analysisRepository.save(analysis);

    // Generate alerts for high-risk transactions
    if (riskScore >= 70) {
      await this.generateFraudAlert(userId, transactionId, riskScore, riskFactors, amount, currency);
    }

    // Update user risk profile
    await this.updateUserRiskProfile(userId, riskScore, amount);

    return {
      riskScore,
      approved,
      requiresReview,
      riskFactors,
      velocityScore,
      geographicScore,
      behavioralScore,
      amountDeviationScore,
      confidenceScore: this.calculateConfidenceScore(velocityScore, geographicScore, behavioralScore, amountDeviationScore)
    };
  }

  private async analyzeVelocityRisk(userId: string, currentAmount: number): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get transaction counts for velocity analysis
    const hourlyTransactions = await this.analysisRepository
      .createQueryBuilder('analysis')
      .where('analysis.userId = :userId', { userId })
      .andWhere('analysis.createdAt > :oneHourAgo', { oneHourAgo })
      .getCount();

    const dailyTransactions = await this.analysisRepository
      .createQueryBuilder('analysis')
      .where('analysis.userId = :userId', { userId })
      .andWhere('analysis.createdAt > :oneDayAgo', { oneDayAgo })
      .getCount();

    // Velocity risk scoring
    let velocityScore = 0;
    
    // High frequency transactions
    if (hourlyTransactions > 10) velocityScore += 40;
    else if (hourlyTransactions > 5) velocityScore += 20;
    else if (hourlyTransactions > 2) velocityScore += 10;

    if (dailyTransactions > 50) velocityScore += 40;
    else if (dailyTransactions > 25) velocityScore += 20;
    else if (dailyTransactions > 10) velocityScore += 10;

    return Math.min(100, velocityScore);
  }

  private async analyzeGeographicRisk(userId: string, lat?: number, lng?: number, countryCode?: string): Promise<number> {
    const highRiskCountries = ['NG', 'GH', 'KE', 'UG']; // Example high-risk countries
    
    let geographicScore = 0;

    // Country-based risk
    if (countryCode && highRiskCountries.includes(countryCode)) {
      geographicScore += 30;
    }

    // Get user's transaction history for location pattern analysis
    const recentTransactions = await this.analysisRepository
      .createQueryBuilder('analysis')
      .where('analysis.userId = :userId', { userId })
      .andWhere('analysis.createdAt > :sevenDaysAgo', { sevenDaysAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
      .select(['analysis.countryCode', 'analysis.locationLat', 'analysis.locationLng'])
      .getMany();

    // Check for unusual location patterns
    if (recentTransactions.length > 0) {
      const hasConsistentLocation = recentTransactions.some(tx => 
        tx.countryCode === countryCode && 
        Math.abs((tx.locationLat || 0) - (lat || 0)) < 0.1 &&
        Math.abs((tx.locationLng || 0) - (lng || 0)) < 0.1
      );

      if (!hasConsistentLocation && countryCode) {
        geographicScore += 25;
      }
    }

    return Math.min(100, geographicScore);
  }

  private async analyzeBehavioralRisk(userId: string, deviceFingerprint?: string, userAgent?: string, ipAddress?: string): Promise<number> {
    const recentTransactions = await this.analysisRepository
      .createQueryBuilder('analysis')
      .where('analysis.userId = :userId', { userId })
      .andWhere('analysis.createdAt > :thirtyDaysAgo', { thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) })
      .select(['analysis.deviceFingerprint', 'analysis.ipAddress', 'analysis.userAgent'])
      .getMany();

    let behavioralScore = 0;

    // Device fingerprint analysis
    if (deviceFingerprint) {
      const hasUsedDevice = recentTransactions.some(tx => tx.deviceFingerprint === deviceFingerprint);
      if (!hasUsedDevice) {
        behavioralScore += 30;
      }
    }

    // IP address analysis
    if (ipAddress) {
      const hasUsedIP = recentTransactions.some(tx => tx.ipAddress === ipAddress);
      if (!hasUsedIP) {
        behavioralScore += 15;
      }
    }

    // User agent analysis
    if (userAgent) {
      const consistentUA = recentTransactions.some(tx => tx.userAgent === userAgent);
      if (!consistentUA) {
        behavioralScore += 10;
      }
    }

    return Math.min(100, behavioralScore);
  }

  private async analyzeAmountDeviationRisk(userId: string, amount: number, currency: string): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get user's historical transaction amounts
    const historicalAmounts = await this.analysisRepository
      .createQueryBuilder('analysis')
      .leftJoin('analysis', 'transaction', 'analysis.transactionId = transaction.id')
      .where('analysis.userId = :userId', { userId })
      .andWhere('analysis.createdAt > :thirtyDaysAgo', { thirtyDaysAgo })
      .select(['analysis.riskScore'])
      .getMany();

    if (historicalAmounts.length === 0) {
      return 0; // New user, no history to compare
    }

    // Calculate average amount and standard deviation would go here
    // For now, use simple deviation scoring
    const averageAmount = 10000; // This would be calculated from real data
    const deviation = Math.abs(amount - averageAmount) / averageAmount;
    
    if (deviation > 5) return 40;
    if (deviation > 2) return 20;
    if (deviation > 1) return 10;
    
    return 0;
  }

  private identifyRiskFactors(velocityScore: number, geographicScore: number, behavioralScore: number, amountDeviationScore: number): string[] {
    const factors = [];

    if (velocityScore > 30) factors.push('High transaction velocity');
    if (geographicScore > 20) factors.push('Unusual location pattern');
    if (behavioralScore > 20) factors.push('Unrecognized device or behavior');
    if (amountDeviationScore > 15) factors.push('Significant amount deviation');

    return factors;
  }

  private calculateConfidenceScore(...scores: number[]): number {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average);
  }

  private async createUserRiskProfile(userId: string): Promise<UserRiskProfile> {
    const profile = this.riskProfileRepository.create({
      userId,
      overallRiskScore: 0,
      transactionRisk: 0,
      behavioralRisk: 0,
      geographicRisk: 0,
      velocityRisk: 0,
      lastTransactionCount: 0,
      last24hTransactionCount: 0,
      avgTransactionAmount: 0,
      riskLevel: 'low',
      isFlagged: false
    });

    return this.riskProfileRepository.save(profile);
  }

  private async updateUserRiskProfile(userId: string, riskScore: number, amount: number): Promise<void> {
    const profile = await this.riskProfileRepository.findOne({
      where: { userId }
    });

    if (profile) {
      profile.overallRiskScore = Math.max(profile.overallRiskScore, riskScore);
      profile.lastTransactionCount += 1;
      profile.last24hTransactionCount += 1;
      
      // Update average transaction amount
      const newAvg = ((profile.avgTransactionAmount * profile.lastTransactionCount) + amount) / (profile.lastTransactionCount + 1);
      profile.avgTransactionAmount = newAvg;

      // Update risk level
      if (riskScore > 80) {
        profile.riskLevel = 'critical';
        profile.isFlagged = true;
      } else if (riskScore > 60) {
        profile.riskLevel = 'high';
      } else if (riskScore > 40) {
        profile.riskLevel = 'medium';
      } else {
        profile.riskLevel = 'low';
      }

      profile.updatedAt = new Date();
      await this.riskProfileRepository.save(profile);
    }
  }

  private async generateFraudAlert(
    userId: string, 
    transactionId: string, 
    riskScore: number, 
    riskFactors: string[], 
    amount: number, 
    currency: string
  ): Promise<FraudAlert> {
    const alert = this.alertRepository.create({
      userId,
      transactionId,
      alertType: riskScore > 90 ? 'high_risk' : 'suspicious_pattern',
      severity: riskScore > 90 ? 'critical' : riskScore > 80 ? 'high' : 'medium',
      confidenceScore: this.calculateConfidenceScore(riskScore),
      riskScore,
      description: `High-risk transaction detected: ${riskFactors.join(', ')}`,
      riskFactors: riskFactors, // Pass array directly, TypeORM handles JSONB serialization
      suggestedActions: ['review_transaction', 'contact_user'], // Pass array directly
      status: 'pending'
    });

    await this.alertRepository.save(alert);
    return alert;
  }

  async getFraudAlerts(userId?: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const query = this.alertRepository.createQueryBuilder('alert')
      .leftJoinAndSelect('alert.user', 'user')
      .orderBy('alert.createdAt', 'DESC');

    if (userId) {
      query.where('alert.userId = :userId', { userId });
    }

    const [alerts, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data: alerts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async resolveFraudAlert(alertId: string, status: string, adminId: string): Promise<any> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId }
    });

    if (!alert) {
      throw new BadRequestException('Fraud alert not found');
    }

    alert.status = status as any;
    alert.assignedTo = adminId;
    alert.resolvedAt = new Date();
    alert.updatedAt = new Date();

    return this.alertRepository.save(alert);
  }

  /**
   * Get fraud alerts with pagination and filtering (for admin controller)
   */
  async getAlerts(page: number = 1, limit: number = 10, filters: any = {}): Promise<{
    alerts: FraudAlert[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const whereConditions: any = {};

      // Apply filters
      if (filters.status) whereConditions.status = filters.status;
      if (filters.riskLevel) whereConditions.severity = filters.riskLevel;
      if (filters.alertType) whereConditions.alertType = filters.alertType;
      if (filters.userId) whereConditions.userId = filters.userId;

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
        relations: ['user'],
      });

      const totalPages = Math.ceil(total / limit);

      return {
        alerts,
        total,
        page,
        totalPages,
      };
    } catch (error: any) {
      throw new BadRequestException(`Error fetching fraud alerts: ${error.message}`);
    }
  }

  /**
   * Investigate a fraud alert
   */
  async investigateAlert(alertId: string, investigationNotes: string): Promise<any> {
    this.logger.log(`🔍 Investigating fraud alert: ${alertId}`);
    
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
      relations: ['user', 'transaction']
    });

    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    // Update alert with investigation details
    alert.status = 'investigating';
    alert.updatedAt = new Date();

    await this.alertRepository.save(alert);

    // Log investigation event
    await this.logInvestigationEvent(alertId, investigationNotes);

    this.logger.log(`✅ Fraud alert investigation started: ${alertId}`);

    return {
      success: true,
      alertId: alertId,
      status: 'investigating',
      message: 'Investigation initiated successfully'
    };
  }

  /**
   * Generate fraud analytics for a period
   */
  async generateAnalytics(period: 'daily' | 'weekly' | 'monthly'): Promise<any> {
    this.logger.log(`📊 Generating fraud analytics for period: ${period}`);
    
    const endDate = new Date();
    const startDate = new Date();
    
    // Calculate start date based on period
    switch (period) {
      case 'daily':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
    }

    // Get alerts for the period
    const alerts = await this.alertRepository.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      relations: ['user', 'transaction']
    });

    // Calculate metrics
    const totalAlerts = alerts.length;
    const highRiskAlerts = alerts.filter(a => a.riskScore >= 80).length;
    const mediumRiskAlerts = alerts.filter(a => a.riskScore >= 50 && a.riskScore < 80).length;
    const lowRiskAlerts = alerts.filter(a => a.riskScore < 50).length;
    
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
    const investigatingAlerts = alerts.filter(a => a.status === 'investigating').length;

    // Note: transaction amount calculation removed - property not available in current entity structure
    
    // Group by type
    const alertsByType = alerts.reduce((acc, alert) => {
      acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by day
    const alertsByDay = alerts.reduce((acc, alert) => {
      const day = alert.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        totalAlerts,
        resolvedAlerts,
        investigatingAlerts,
        highRiskAlerts,
        mediumRiskAlerts,
        lowRiskAlerts,
        totalVolume,
        averageRiskScore: totalAlerts > 0 
          ? alerts.reduce((sum, alert) => sum + alert.riskScore, 0) / totalAlerts 
          : 0
      },
      breakdown: {
        byType: alertsByType,
        byDay: alertsByDay,
        byRiskLevel: {
          high: highRiskAlerts,
          medium: mediumRiskAlerts,
          low: lowRiskAlerts
        }
      },
      trends: {
        alertTrend: Object.entries(alertsByDay).map(([date, count]) => ({
          date,
          alerts: count
        })),
        resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0
      }
    };
  }

  /**
   * Log investigation event
   */
  private async logInvestigationEvent(alertId: string, notes: string): Promise<void> {
    // This would typically log to an audit table or external logging service
    this.logger.log(`Investigation log - Alert: ${alertId}, Notes: ${notes}`);
  }

  /**
   * Bulk review multiple transactions for fraud
   */
  async bulkReviewTransactions(transactionIds: string[], action: string): Promise<any> {
    this.logger.log(`🔍 Bulk reviewing ${transactionIds.length} transactions with action: ${action}`);
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const transactionId of transactionIds) {
      try {
        // For bulk review, we'll create alerts for suspicious transactions
        // or mark them as reviewed based on the action
        
        let alertStatus: string;
        let reviewNotes: string;
        
        switch (action) {
          case 'approve':
            alertStatus = 'resolved';
            reviewNotes = 'Transaction reviewed and approved in bulk operation';
            break;
          case 'reject':
            alertStatus = 'escalated';
            reviewNotes = 'Transaction flagged for rejection in bulk operation';
            break;
          case 'investigate':
            alertStatus = 'investigating';
            reviewNotes = 'Bulk investigation initiated for transaction';
            break;
          case 'review':
            alertStatus = 'pending_review';
            reviewNotes = 'Transaction queued for detailed review';
            break;
          default:
            throw new Error(`Invalid action: ${action}`);
        }

        // Create or update fraud alert for this transaction
        const fraudAlert = await this.generateFraudAlert(
          'system', // userId - would need actual user ID
          transactionId, 
          50, // riskScore - medium risk
          ['bulk_review'], // riskFactors
          0, // amount - not available in bulk context
          'USD' // currency - default
        );

        // Update alert status
        await this.resolveFraudAlert(fraudAlert.id, alertStatus, 'admin');

        results.push({
          transactionId,
          success: true,
          alertId: fraudAlert.id,
          action: action,
          message: `Transaction ${transactionId} ${action}ed successfully`
        });
        successCount++;
      } catch (error: any) {
        results.push({
          transactionId,
          success: false,
          message: error.message
        });
        errorCount++;
      }
    }

    this.logger.log(`✅ Bulk transaction review completed: ${successCount} succeeded, ${errorCount} failed`);

    return {
      totalProcessed: transactionIds.length,
      successCount,
      errorCount,
      action,
      results,
      timestamp: new Date()
    };
  }
}