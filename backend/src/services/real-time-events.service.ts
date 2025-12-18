import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketService, TransactionEvent } from './websocket.service';
import { ConfigService } from '@nestjs/config';

/**
 * ARKHAM Phase 1: Real-Time Madness
 * Real-Time Events Service - Integrates WebSocket with business logic
 * 
 * Responsibilities:
 * - Stream transaction events from existing services
 * - Send admin notifications for critical events
 * - Update dashboards with real-time data
 * - Handle user-specific notifications
 * - Monitor system health and send alerts
 * - Broadcast market data and exchange rates
 */

@Injectable()
export class RealTimeEventsService implements OnModuleInit {
  private readonly logger = new Logger(RealTimeEventsService.name);

  constructor(
    private websocketService: WebSocketService,
    private configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('🚀 Real-Time Events Service Initializing...');
    
    // Set up event listeners for business logic
    this.setupBusinessEventListeners();
    
    // Start periodic broadcasts
    this.startPeriodicBroadcasts();
    
    // Monitor system health
    this.startSystemHealthMonitoring();
    
    this.logger.log('✅ Real-Time Events Service Ready');
    this.logger.log('📡 Broadcasting to: admins, users, public channels');
  }

  // ========================================
  // TRANSACTION EVENT STREAMING
  // ========================================

  /**
   * Stream transaction created event
   */
  streamTransactionCreated(transactionData: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    metadata?: any;
  }): void {
    const event: TransactionEvent = {
      id: transactionData.id,
      userId: transactionData.userId,
      type: 'created',
      amount: transactionData.amount,
      currency: transactionData.currency,
      status: transactionData.status,
      metadata: {
        ...transactionData.metadata,
        type: transactionData.type,
        eventSource: 'transaction_service'
      },
      timestamp: new Date(),
    };

    this.websocketService.streamTransactionEvent(event);

    // Additional admin notifications
    this.websocketService.sendToAdmins('transaction:created', {
      ...event,
      urgency: this.calculateTransactionUrgency(event),
    }, 'normal');

    this.logger.log(`💰 Transaction created: ${transactionData.id} - $${transactionData.amount} ${transactionData.currency}`);
  }

  /**
   * Stream transaction completed event
   */
  streamTransactionCompleted(transactionData: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    type: string;
    processingTime?: number;
    fees?: number;
    metadata?: any;
  }): void {
    const event: TransactionEvent = {
      id: transactionData.id,
      userId: transactionData.userId,
      type: 'completed',
      amount: transactionData.amount,
      currency: transactionData.currency,
      status: 'completed',
      metadata: {
        ...transactionData.metadata,
        type: transactionData.type,
        processingTime: transactionData.processingTime,
        fees: transactionData.fees,
        eventSource: 'transaction_service'
      },
      timestamp: new Date(),
    };

    this.websocketService.streamTransactionEvent(event);

    // Success celebration for users
    this.websocketService.sendToUsersWithUserId(transactionData.userId, 'transaction:success', {
      transactionId: transactionData.id,
      amount: transactionData.amount,
      currency: transactionData.currency,
      message: `Transaction completed successfully!`,
      timestamp: new Date(),
    });

    this.logger.log(`✅ Transaction completed: ${transactionData.id} - $${transactionData.amount} ${transactionData.currency}`);
  }

  /**
   * Stream transaction failed event
   */
  streamTransactionFailed(transactionData: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    type: string;
    error: string;
    metadata?: any;
  }): void {
    const event: TransactionEvent = {
      id: transactionData.id,
      userId: transactionData.userId,
      type: 'failed',
      amount: transactionData.amount,
      currency: transactionData.currency,
      status: 'failed',
      metadata: {
        ...transactionData.metadata,
        type: transactionData.type,
        error: transactionData.error,
        eventSource: 'transaction_service'
      },
      timestamp: new Date(),
    };

    this.websocketService.streamTransactionEvent(event);

    // High priority alert to admins
    this.websocketService.sendToAdmins('transaction:failed', {
      ...event,
      urgency: 'urgent',
      requiresAttention: true,
    }, 'urgent');

    // Notify user about failure
    this.websocketService.sendToUsersWithUserId(transactionData.userId, 'transaction:failed', {
      transactionId: transactionData.id,
      amount: transactionData.amount,
      currency: transactionData.currency,
      error: transactionData.error,
      message: `Transaction failed: ${transactionData.error}`,
      timestamp: new Date(),
    });

    this.logger.error(`❌ Transaction failed: ${transactionData.id} - $${transactionData.amount} ${transactionData.currency} - ${transactionData.error}`);
  }

  /**
   * Stream large transaction alert (for compliance)
   */
  streamLargeTransactionAlert(transactionData: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    type: string;
    threshold: number;
    metadata?: any;
  }): void {
    this.websocketService.sendToAdmins('compliance:large_transaction', {
      transactionId: transactionData.id,
      userId: transactionData.userId,
      amount: transactionData.amount,
      currency: transactionData.currency,
      threshold: transactionData.threshold,
      type: transactionData.type,
      timestamp: new Date(),
      requiresReview: true,
      priority: 'high',
    }, 'urgent');

    this.logger.warn(`🚨 Large transaction alert: ${transactionData.id} - $${transactionData.amount} ${transactionData.currency} (threshold: $${transactionData.threshold})`);
  }

  // ========================================
  // USER EVENT STREAMING
  // ========================================

  /**
   * Stream user registration event
   */
  streamUserRegistered(userData: {
    id: string;
    email: string;
    country: string;
    kycStatus: 'pending' | 'verified' | 'rejected';
    metadata?: any;
  }): void {
    this.websocketService.sendToAdmins('user:registered', {
      userId: userData.id,
      email: userData.email,
      country: userData.country,
      kycStatus: userData.kycStatus,
      registrationTime: new Date(),
      metadata: userData.metadata,
      urgency: userData.kycStatus === 'rejected' ? 'high' : 'normal',
    }, userData.kycStatus === 'rejected' ? 'high' : 'normal');

    // Welcome message to user
    this.websocketService.sendToUsersWithUserId(userData.id, 'welcome', {
      message: 'Welcome to ARKHAM African Currency Platform!',
      features: [
        'Real-time exchange rates',
        'Secure transactions',
        'Mobile money support',
        'Multi-currency wallet'
      ],
      nextSteps: userData.kycStatus === 'pending' ? 'Complete KYC verification' : 'Start trading',
      timestamp: new Date(),
    });

    this.logger.log(`👤 New user registered: ${userData.email} (${userData.country})`);
  }

  /**
   * Stream KYC status update
   */
  streamKycUpdate(userData: {
    userId: string;
    email: string;
    previousStatus: string;
    newStatus: 'pending' | 'verified' | 'rejected';
    reason?: string;
    reviewedBy?: string;
  }): void {
    this.websocketService.sendToAdmins('user:kyc_updated', {
      userId: userData.userId,
      email: userData.email,
      previousStatus: userData.previousStatus,
      newStatus: userData.newStatus,
      reason: userData.reason,
      reviewedBy: userData.reviewedBy,
      timestamp: new Date(),
    }, userData.newStatus === 'rejected' ? 'high' : 'normal');

    // Notify user
    const userMessage = userData.newStatus === 'verified' 
      ? 'KYC verification completed successfully!'
      : userData.newStatus === 'rejected'
      ? `KYC verification failed: ${userData.reason}`
      : 'KYC verification is pending review';

    this.websocketService.sendToUsersWithUserId(userData.userId, 'kyc_status', {
      status: userData.newStatus,
      message: userMessage,
      reason: userData.reason,
      timestamp: new Date(),
    });

    this.logger.log(`🔍 KYC updated for ${userData.email}: ${userData.previousStatus} → ${userData.newStatus}`);
  }

  // ========================================
  // MARKET DATA STREAMING
  // ========================================

  /**
   * Stream exchange rate updates
   */
  streamExchangeRateUpdate(rateData: {
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    change24h: number;
    volume24h: number;
    source: string;
  }): void {
    // Broadcast to all users
    this.websocketService.broadcastToChannel('exchange-rates', {
      type: 'rate_update',
      data: {
        pair: `${rateData.baseCurrency}/${rateData.targetCurrency}`,
        rate: rateData.rate,
        change24h: rateData.change24h,
        volume24h: rateData.volume24h,
        source: rateData.source,
        timestamp: new Date(),
      }
    }, 'system', 'normal');

    // Critical rate changes for admins
    if (Math.abs(rateData.change24h) > 5) {
      this.websocketService.sendToAdmins('market:significant_change', {
        pair: `${rateData.baseCurrency}/${rateData.targetCurrency}`,
        rate: rateData.rate,
        change24h: rateData.change24h,
        significance: Math.abs(rateData.change24h) > 10 ? 'high' : 'medium',
        timestamp: new Date(),
      }, 'high');
    }

    this.logger.debug(`📈 Exchange rate updated: ${rateData.baseCurrency}/${rateData.targetCurrency} = ${rateData.rate}`);
  }

  /**
   * Stream ACT token price updates
   */
  streamActPriceUpdate(priceData: {
    price: number;
    change24h: number;
    marketCap: number;
    volume24h: number;
    circulatingSupply: number;
  }): void {
    // Broadcast to ACT token channel
    this.websocketService.broadcastToChannel('act-token', {
      type: 'price_update',
      data: {
        price: priceData.price,
        change24h: priceData.change24h,
        marketCap: priceData.marketCap,
        volume24h: priceData.volume24h,
        circulatingSupply: priceData.circulatingSupply,
        timestamp: new Date(),
      }
    }, 'system', 'normal');

    this.logger.debug(`🪙 ACT token price: $${priceData.price} (${priceData.change24h > 0 ? '+' : ''}${priceData.change24h}%)`);
  }

  // ========================================
  // SYSTEM MONITORING & ALERTS
  // ========================================

  /**
   * Send system performance alert
   */
  sendSystemAlert(type: 'warning' | 'error' | 'info', message: string, metadata?: any): void {
    this.websocketService.sendSystemAlert(type, message, metadata);
  }

  /**
   * Stream database health update
   */
  streamDatabaseHealth(healthData: {
    status: 'healthy' | 'degraded' | 'critical';
    responseTime: number;
    activeConnections: number;
    maxConnections: number;
    errors: number;
  }): void {
    this.websocketService.sendToAdmins('system:database_health', {
      ...healthData,
      timestamp: new Date(),
      requiresAction: healthData.status === 'critical',
    }, healthData.status === 'critical' ? 'urgent' : 'high');

    if (healthData.status === 'critical') {
      this.websocketService.sendSystemAlert('error', 'Database health critical', healthData);
    }

    this.logger.warn(`🗄️ Database health: ${healthData.status} (${healthData.responseTime}ms)`);
  }

  /**
   * Stream API performance metrics
   */
  streamApiPerformance(metrics: {
    endpoint: string;
    responseTime: number;
    statusCode: number;
    errorRate: number;
    requestCount: number;
  }): void {
    // Only send if performance is degraded
    if (metrics.responseTime > 2000 || metrics.errorRate > 0.05) {
      this.websocketService.sendToAdmins('system:api_performance', {
        ...metrics,
        severity: metrics.responseTime > 5000 ? 'critical' : 'warning',
        timestamp: new Date(),
      }, metrics.responseTime > 5000 ? 'urgent' : 'high');
    }

    this.logger.debug(`⚡ API Performance: ${metrics.endpoint} - ${metrics.responseTime}ms (${metrics.errorRate * 100}% error rate)`);
  }

  // ========================================
  // ADMIN DASHBOARD UPDATES
  // ========================================

  /**
   * Update admin dashboard with latest metrics
   */
  updateAdminDashboard(metrics: {
    totalUsers: number;
    activeUsers24h: number;
    totalTransactions: number;
    transactionVolume24h: number;
    systemUptime: number;
    revenue24h: number;
    topCountries: Array<{ country: string; count: number }>;
    recentTransactions: Array<any>;
  }): void {
    this.websocketService.updateAdminDashboard({
      ...metrics,
      timestamp: new Date(),
      period: '24h',
    });
  }

  /**
   * Stream real-time transaction for dashboard
   */
  streamRealTimeTransaction(transaction: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    country: string;
  }): void {
    this.websocketService.broadcastToChannel('admin:dashboard:realtime', {
      type: 'transaction',
      data: transaction,
      timestamp: new Date(),
    }, 'system', 'normal');
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private setupBusinessEventListeners(): void {
    // These would be connected to actual business logic events
    // For now, we'll simulate periodic events
    
    this.logger.log('🔗 Business event listeners configured');
  }

  private startPeriodicBroadcasts(): void {
    // Broadcast exchange rates every 30 seconds
    setInterval(() => {
      // This would fetch from actual exchange rate service
      this.streamExchangeRateUpdate({
        baseCurrency: 'USD',
        targetCurrency: 'KES',
        rate: 132.50 + (Math.random() - 0.5) * 2, // Simulated rate
        change24h: (Math.random() - 0.5) * 4, // Simulated change
        volume24h: 1000000 + Math.random() * 500000, // Simulated volume
        source: 'exchange_rate_service'
      });
    }, 30000);

    // Broadcast ACT price every minute
    setInterval(() => {
      this.streamActPriceUpdate({
        price: 1.24 + (Math.random() - 0.5) * 0.1, // Simulated price
        change24h: (Math.random() - 0.5) * 10, // Simulated change
        marketCap: 50000000 + Math.random() * 10000000, // Simulated market cap
        volume24h: 100000 + Math.random() * 50000, // Simulated volume
        circulatingSupply: 40000000 + Math.random() * 1000000, // Simulated supply
      });
    }, 60000);

    this.logger.log('⏰ Periodic broadcasts started (rates: 30s, ACT: 60s)');
  }

  private startSystemHealthMonitoring(): void {
    // Monitor system resources every 15 seconds
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      if (memUsage.heapUsed / 1024 / 1024 > 400) { // 400MB threshold
        this.sendSystemAlert('warning', 'High memory usage detected', {
          heapUsed: memUsage.heapUsed / 1024 / 1024,
          heapTotal: memUsage.heapTotal / 1024 / 1024,
          external: memUsage.external / 1024 / 1024,
        });
      }

      // Check response time (simulated)
      const responseTime = Math.random() * 1000;
      if (responseTime > 500) {
        this.sendSystemAlert('info', 'Slower response times detected', {
          responseTime,
          threshold: 500,
        });
      }
    }, 15000);

    this.logger.log('🏥 System health monitoring started (15s interval)');
  }

  private calculateTransactionUrgency(event: TransactionEvent): 'low' | 'normal' | 'high' | 'urgent' {
    // Calculate urgency based on transaction characteristics
    if (event.amount > 10000) return 'urgent';
    if (event.amount > 1000) return 'high';
    if (event.status === 'failed') return 'urgent';
    if (event.status === 'cancelled') return 'high';
    return 'normal';
  }
}