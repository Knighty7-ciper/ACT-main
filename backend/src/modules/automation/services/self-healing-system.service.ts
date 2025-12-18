import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { SystemHealthEntity } from '../../../entities/system-health.entity';

export interface HealingRule {
  id: string;
  name: string;
  description: string;
  condition: string; // JSON string defining the trigger condition
  action: string; // JSON string defining the healing action
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
  lastTriggered?: Date;
  triggerCount: number;
  successRate: number; // percentage
}

export interface HealingEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  condition: any;
  action: any;
  result: 'success' | 'failed' | 'partial';
  message: string;
  executionTime: number; // milliseconds
  metadata?: any;
}

export interface SystemIssue {
  id: string;
  type: 'performance' | 'error' | 'security' | 'compliance' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  autoResolved: boolean;
  resolvedAt?: Date;
  resolutionTime?: number; // milliseconds
  metadata?: any;
}

@Injectable()
export class SelfHealingSystemService {
  private readonly logger = new Logger(SelfHealingSystemService.name);
  private healingRules: HealingRule[] = [];
  private healingEvents: HealingEvent[] = [];
  private systemIssues: SystemIssue[] = [];

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(SystemHealthEntity)
    private systemHealthRepo: Repository<SystemHealthEntity>,
  ) {
    this.initializeDefaultHealingRules();
  }

  /**
   * Initialize default self-healing rules
   */
  private initializeDefaultHealingRules(): void {
    this.healingRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate Healing',
        description: 'Automatically restart services when error rate exceeds 10%',
        condition: JSON.stringify({
          metric: 'errorRate',
          operator: '>',
          value: 10,
          duration: 300, // 5 minutes
        }),
        action: JSON.stringify({
          type: 'restart',
          service: 'api-server',
          retryCount: 3,
        }),
        enabled: true,
        priority: 'high',
        cooldown: 10,
        triggerCount: 0,
        successRate: 95,
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Time Healing',
        description: 'Scale up resources when response time exceeds 5 seconds',
        condition: JSON.stringify({
          metric: 'responseTime',
          operator: '>',
          value: 5000,
          duration: 600, // 10 minutes
        }),
        action: JSON.stringify({
          type: 'scale',
          resource: 'api-instances',
          scaleFactor: 2,
        }),
        enabled: true,
        priority: 'medium',
        cooldown: 15,
        triggerCount: 0,
        successRate: 88,
      },
      {
        id: 'database-connection-issues',
        name: 'Database Connection Healing',
        description: 'Reconnect to database when connection issues detected',
        condition: JSON.stringify({
          metric: 'databaseConnections',
          operator: '<',
          value: 1,
          duration: 60, // 1 minute
        }),
        action: JSON.stringify({
          type: 'reconnect',
          service: 'database',
          maxRetries: 5,
        }),
        enabled: true,
        priority: 'critical',
        cooldown: 5,
        triggerCount: 0,
        successRate: 99,
      },
      {
        id: 'memory-leak-detection',
        name: 'Memory Leak Healing',
        description: 'Restart service when memory usage exceeds 90% for 15 minutes',
        condition: JSON.stringify({
          metric: 'memoryUsage',
          operator: '>',
          value: 90,
          duration: 900, // 15 minutes
        }),
        action: JSON.stringify({
          type: 'restart',
          service: 'application',
          gracePeriod: 30,
        }),
        enabled: true,
        priority: 'high',
        cooldown: 20,
        triggerCount: 0,
        successRate: 92,
      },
      {
        id: 'transaction-stuck',
        name: 'Stuck Transaction Healing',
        description: 'Automatically retry or cancel stuck transactions',
        condition: JSON.stringify({
          metric: 'stuckTransactions',
          operator: '>',
          value: 10,
          duration: 300, // 5 minutes
        }),
        action: JSON.stringify({
          type: 'retry',
          entity: 'transaction',
          retryAttempts: 3,
          timeout: 600, // 10 minutes
        }),
        enabled: true,
        priority: 'medium',
        cooldown: 30,
        triggerCount: 0,
        successRate: 85,
      },
    ];
  }

  /**
   * Monitor system health and trigger self-healing
   * Runs every 30 seconds
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async monitorAndHeal(): Promise<void> {
    try {
      const health = await this.assessSystemHealth();
      const issues = await this.detectSystemIssues(health);
      
      // Process detected issues
      for (const issue of issues) {
        await this.processSystemIssue(issue);
      }
      
      // Clean up old events and issues
      this.cleanupOldData();
      
    } catch (error: any) {
      this.logger.error('Self-healing monitoring failed:', error);
    }
  }

  /**
   * Assess overall system health
   */
  async assessSystemHealth(): Promise<any> {
    try {
      const [
        latestHealth,
        recentTransactions,
        activeUsers,
        errorMetrics,
      ] = await Promise.all([
        this.systemHealthRepo.findOne({
          order: { timestamp: 'DESC' },
        }),
        this.getRecentTransactionMetrics(),
        this.getActiveUserMetrics(),
        this.getErrorMetrics(),
      ]);

      return {
        overall: latestHealth?.overallScore || 100,
        database: latestHealth?.databaseHealth || 'healthy',
        transactions: {
          total: recentTransactions.total,
          successful: recentTransactions.successful,
          failed: recentTransactions.failed,
          stuck: recentTransactions.stuck,
          errorRate: recentTransactions.errorRate,
        },
        users: {
          active: activeUsers.active,
          total: activeUsers.total,
          new: activeUsers.new,
        },
        errors: errorMetrics,
        timestamp: new Date(),
      };
    } catch (error: any) {
      this.logger.error('Failed to assess system health:', error);
      return {
        overall: 0,
        database: 'unknown',
        transactions: { total: 0, successful: 0, failed: 0, stuck: 0, errorRate: 0 },
        users: { active: 0, total: 0, new: 0 },
        errors: { rate: 0, count: 0 },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Detect system issues based on health metrics
   */
  async detectSystemIssues(health: any): Promise<SystemIssue[]> {
    const issues: SystemIssue[] = [];
    const now = new Date();

    // Check for high error rate
    if (health.errors.rate > 10) {
      issues.push({
        id: this.generateId(),
        type: 'error',
        severity: health.errors.rate > 20 ? 'critical' : 'high',
        title: 'High Error Rate Detected',
        description: `System error rate is ${health.errors.rate}% (threshold: 10%)`,
        detectedAt: now,
        autoResolved: false,
        metadata: { errorRate: health.errors.rate, errorCount: health.errors.count },
      });
    }

    // Check for stuck transactions
    if (health.transactions.stuck > 5) {
      issues.push({
        id: this.generateId(),
        type: 'error',
        severity: health.transactions.stuck > 20 ? 'critical' : 'medium',
        title: 'Multiple Stuck Transactions',
        description: `${health.transactions.stuck} transactions are stuck (threshold: 5)`,
        detectedAt: now,
        autoResolved: false,
        metadata: { stuckTransactions: health.transactions.stuck },
      });
    }

    // Check for database issues
    if (health.database !== 'healthy') {
      issues.push({
        id: this.generateId(),
        type: 'error',
        severity: 'critical',
        title: 'Database Health Issue',
        description: `Database status: ${health.database}`,
        detectedAt: now,
        autoResolved: false,
        metadata: { databaseStatus: health.database },
      });
    }

    // Check for performance issues
    if (health.overall < 70) {
      issues.push({
        id: this.generateId(),
        type: 'performance',
        severity: health.overall < 50 ? 'critical' : 'high',
        title: 'System Performance Degraded',
        description: `Overall system health score: ${health.overall}%`,
        detectedAt: now,
        autoResolved: false,
        metadata: { healthScore: health.overall },
      });
    }

    return issues;
  }

  /**
   * Process detected system issue with self-healing
   */
  async processSystemIssue(issue: SystemIssue): Promise<void> {
    try {
      // Find applicable healing rules
      const applicableRules = this.healingRules.filter(rule => {
        if (!rule.enabled) return false;
        
        // Check cooldown period
        if (rule.lastTriggered) {
          const timeSinceLastTrigger = (Date.now() - rule.lastTriggered.getTime()) / (1000 * 60);
          if (timeSinceLastTrigger < rule.cooldown) return false;
        }
        
        // Check if rule conditions match the issue
        return this.isRuleApplicable(rule, issue);
      });

      // Sort by priority
      applicableRules.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // Execute the highest priority applicable rule
      for (const rule of applicableRules) {
        const healingResult = await this.executeHealingRule(rule, issue);
        
        if (healingResult.success) {
          issue.autoResolved = true;
          issue.resolvedAt = new Date();
          issue.resolutionTime = healingResult.executionTime;
          
          this.logger.log(`Self-healing successful for issue: ${issue.title} (${rule.name})`);
          break;
        }
      }

      // Record the healing event
      if (applicableRules.length > 0) {
        const executedRule = applicableRules[0];
        const result = await this.executeHealingRule(executedRule, issue);
        
        await this.recordHealingEvent(executedRule, issue, result);
      }

    } catch (error: any) {
      this.logger.error(`Failed to process system issue: ${issue.title}`, error);
    }
  }

  /**
   * Execute healing rule
   */
  async executeHealingRule(rule: HealingRule, issue: SystemIssue): Promise<{ success: boolean; message: string; executionTime: number }> {
    const startTime = Date.now();
    
    try {
      const condition = JSON.parse(rule.condition);
      const action = JSON.parse(rule.action);

      this.logger.log(`🔧 Executing healing rule: ${rule.name}`);

      let result: any;
      switch (action.type) {
        case 'restart':
          result = await this.performRestart(action, issue);
          break;
        case 'scale':
          result = await this.performScaling(action, issue);
          break;
        case 'reconnect':
          result = await this.performReconnection(action, issue);
          break;
        case 'retry':
          result = await this.performRetry(action, issue);
          break;
        case 'cleanup':
          result = await this.performCleanup(action, issue);
          break;
        default:
          throw new Error(`Unknown healing action type: ${action.type}`);
      }

      const executionTime = Date.now() - startTime;
      
      // Update rule statistics
      rule.lastTriggered = new Date();
      rule.triggerCount++;

      return {
        success: true,
        message: result.message || 'Healing action completed successfully',
        executionTime,
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      this.logger.error(`Healing rule execution failed: ${rule.name}`, error);
      
      return {
        success: false,
        message: `Healing failed: ${error.message}`,
        executionTime,
      };
    }
  }

  /**
   * Get healing events history
   */
  getHealingEvents(limit: number = 50): HealingEvent[] {
    return this.healingEvents
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get active system issues
   */
  getActiveIssues(): SystemIssue[] {
    return this.systemIssues
      .filter(issue => !issue.autoResolved)
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get healing rules
   */
  getHealingRules(): HealingRule[] {
    return this.healingRules;
  }

  /**
   * Create custom healing rule
   */
  async createHealingRule(rule: Omit<HealingRule, 'id' | 'triggerCount' | 'successRate'>): Promise<HealingRule> {
    const newRule: HealingRule = {
      ...rule,
      id: this.generateId(),
      triggerCount: 0,
      successRate: 100,
    };

    this.healingRules.push(newRule);
    this.logger.log(`📝 Created healing rule: ${rule.name}`);

    return newRule;
  }

  /**
   * Enable/disable healing rule
   */
  async toggleHealingRule(ruleId: string, enabled: boolean): Promise<void> {
    const rule = this.healingRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      this.logger.log(`${enabled ? 'SUCCESS' : 'ERROR'} Healing rule ${enabled ? 'enabled' : 'disabled'}: ${rule.name}`);
    }
  }

  /**
   * Get self-healing statistics
   */
  getHealingStatistics(): any {
    const totalEvents = this.healingEvents.length;
    const successfulEvents = this.healingEvents.filter(e => e.result === 'success').length;
    const failedEvents = this.healingEvents.filter(e => e.result === 'failed').length;
    
    const ruleStats = this.healingRules.map(rule => ({
      id: rule.id,
      name: rule.name,
      triggerCount: rule.triggerCount,
      successRate: rule.successRate,
      lastTriggered: rule.lastTriggered,
      enabled: rule.enabled,
    }));

    return {
      overall: {
        totalEvents,
        successfulEvents,
        failedEvents,
        successRate: totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0,
      },
      rules: ruleStats,
      issues: {
        active: this.getActiveIssues().length,
        resolved: this.systemIssues.filter(i => i.autoResolved).length,
      },
    };
  }

  // Private helper methods

  private async recordHealingEvent(rule: HealingRule, issue: SystemIssue, result: any): Promise<void> {
    const event: HealingEvent = {
      id: this.generateId(),
      ruleId: rule.id,
      ruleName: rule.name,
      triggeredAt: new Date(),
      condition: JSON.parse(rule.condition),
      action: JSON.parse(rule.action),
      result: result.success ? 'success' : 'failed',
      message: result.message,
      executionTime: result.executionTime,
      metadata: {
        issueType: issue.type,
        issueSeverity: issue.severity,
      },
    };

    this.healingEvents.unshift(event);

    // Keep only last 1000 events
    if (this.healingEvents.length > 1000) {
      this.healingEvents = this.healingEvents.slice(0, 1000);
    }
  }

  private isRuleApplicable(rule: HealingRule, issue: SystemIssue): boolean {
    // Simple rule applicability check
    const condition = JSON.parse(rule.condition);
    
    // Check if issue type matches condition
    if (condition.issueType && condition.issueType !== issue.type) {
      return false;
    }
    
    // Check if issue severity meets threshold
    if (condition.minSeverity) {
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      const issueLevel = severityOrder[issue.severity];
      const requiredLevel = severityOrder[condition.minSeverity];
      if (issueLevel < requiredLevel) return false;
    }
    
    return true;
  }

  private async performRestart(action: any, issue: SystemIssue): Promise<any> {
    this.logger.log(`Restarting service: ${action.service}`);
    
    // Simulate service restart
    await this.delay(5000); // 5 seconds
    
    return {
      service: action.service,
      action: 'restart',
      message: `Service ${action.service} restarted successfully`,
    };
  }

  private async performScaling(action: any, issue: SystemIssue): Promise<any> {
    this.logger.log(`Scaling resource: ${action.resource} by factor ${action.scaleFactor}`);
    
    // Simulate scaling
    await this.delay(10000); // 10 seconds
    
    return {
      resource: action.resource,
      scaleFactor: action.scaleFactor,
      message: `Resource ${action.resource} scaled by ${action.scaleFactor}x`,
    };
  }

  private async performReconnection(action: any, issue: SystemIssue): Promise<any> {
    this.logger.log(`Reconnecting to service: ${action.service}`);
    
    // Simulate reconnection
    await this.delay(3000); // 3 seconds
    
    return {
      service: action.service,
      action: 'reconnect',
      message: `Connection to ${action.service} reestablished`,
    };
  }

  private async performRetry(action: any, issue: SystemIssue): Promise<any> {
    this.logger.log(`Retrying ${action.entity} operations`);
    
    if (action.entity === 'transaction') {
      await this.retryStuckTransactions();
    }
    
    await this.delay(8000); // 8 seconds
    
    return {
      entity: action.entity,
      action: 'retry',
      message: `Retry operations for ${action.entity} completed`,
    };
  }

  private async performCleanup(action: any, issue: SystemIssue): Promise<any> {
    this.logger.log(`Performing cleanup: ${action.type}`);
    
    // Simulate cleanup
    await this.delay(6000); // 6 seconds
    
    return {
      type: action.type,
      action: 'cleanup',
      message: `Cleanup ${action.type} completed successfully`,
    };
  }

  private async retryStuckTransactions(): Promise<void> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const stuckTransactions = await this.transactionRepo.find({
      where: {
        status: 'pending',
        createdAt: LessThan(twoHoursAgo), // 2 hours old
      },
      take: 50, // Limit to prevent overwhelming the system
    });

    this.logger.log(`Found ${stuckTransactions.length} stuck transactions to retry`);

    for (const transaction of stuckTransactions) {
      try {
        // Here you would implement the actual retry logic
        // For now, we'll just mark them for manual review
        this.logger.log(`Marking transaction ${transaction.id} for retry`);
      } catch (error: any) {
        this.logger.error(`Failed to retry transaction ${transaction.id}:`, error);
      }
    }
  }

  private async getRecentTransactionMetrics(): Promise<any> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const [total, successful, failed, stuck] = await Promise.all([
      this.transactionRepo.count({
        where: { createdAt: MoreThan(oneHourAgo) },
      }),
      this.transactionRepo.count({
        where: { 
          status: 'completed',
          createdAt: MoreThan(oneHourAgo),
        },
      }),
      this.transactionRepo.count({
        where: { 
          status: 'failed',
          createdAt: MoreThan(oneHourAgo),
        },
      }),
      this.transactionRepo.count({
        where: { 
          status: 'pending',
          createdAt: LessThan(new Date(Date.now() - 2 * 60 * 60 * 1000)),
        },
      }),
    ]);

    return {
      total,
      successful,
      failed,
      stuck,
      errorRate: total > 0 ? (failed / total) * 100 : 0,
    };
  }

  private async getActiveUserMetrics(): Promise<any> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [active, total, newUsers] = await Promise.all([
      this.userRepo.count({
        where: { lastLoginAt: MoreThan(oneDayAgo) },
      }),
      this.userRepo.count(),
      this.userRepo.count({
        where: { createdAt: MoreThan(oneDayAgo) },
      }),
    ]);

    return { active, total, new: newUsers };
  }

  private async getErrorMetrics(): Promise<any> {
    // Simplified error metrics - in real implementation, you'd track actual errors
    return {
      rate: Math.random() * 20, // 0-20% error rate
      count: Math.floor(Math.random() * 100),
    };
  }

  private cleanupOldData(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Clean up old healing events
    this.healingEvents = this.healingEvents.filter(event => event.triggeredAt > oneWeekAgo);
    
    // Clean up resolved issues older than 1 day
    this.systemIssues = this.systemIssues.filter(issue => 
      issue.autoResolved ? issue.resolvedAt && issue.resolvedAt > oneDayAgo : true
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}