import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { SystemHealthEntity } from '../../../entities/system-health.entity';
import { PerformanceMetricEntity } from '../../../entities/performance-metric.entity';

export interface SystemAlert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: any;
}

export interface AutomationSchedule {
  id: string;
  name: string;
  type: 'maintenance' | 'backup' | 'cleanup' | 'report';
  schedule: string; // cron expression
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

@Injectable()
export class SystemAutomationService {
  private readonly logger = new Logger(SystemAutomationService.name);
  private alerts: SystemAlert[] = [];
  private schedules: AutomationSchedule[] = [];

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(SystemHealthEntity)
    private systemHealthRepo: Repository<SystemHealthEntity>,
    @InjectRepository(PerformanceMetricEntity)
    private performanceRepo: Repository<PerformanceMetricEntity>,
  ) {
    this.initializeDefaultSchedules();
  }

  /**
   * System Health Monitoring - runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorSystemHealth(): Promise<void> {
    try {
      this.logger.log('🔍 Starting system health monitoring...');
      
      // Check database connectivity
      const dbHealth = await this.checkDatabaseHealth();
      
      // Check API response times
      const apiHealth = await this.checkAPIHealth();
      
      // Check transaction processing
      const transactionHealth = await this.checkTransactionHealth();
      
      // Check user activity
      const userHealth = await this.checkUserHealth();
      
      // Calculate overall system health
      const overallHealth = this.calculateOverallHealth({
        database: dbHealth,
        api: apiHealth,
        transactions: transactionHealth,
        users: userHealth,
      });
      
      // Save health metrics
      await this.saveSystemHealthMetrics({
        overall: overallHealth,
        database: dbHealth,
        api: apiHealth,
        transactions: transactionHealth,
        users: userHealth,
        timestamp: new Date(),
      });
      
      // Create alerts for unhealthy systems
      await this.createHealthAlerts(overallHealth);
      
      this.logger.log(`System health monitoring completed. Overall health: ${overallHealth.score}%`);
    } catch (error: any) {
      this.logger.error('System health monitoring failed:', error);
      await this.createAlert({
        type: 'error',
        severity: 'high',
        title: 'System Health Monitoring Failed',
        message: `Health monitoring error: ${error.message}`,
        timestamp: new Date(),
        resolved: false,
        metadata: { error: error.message },
      });
    }
  }

  /**
   * Automated Maintenance Tasks - runs daily at 2 AM
   */
  @Cron('0 2 * * *')
  async performAutomatedMaintenance(): Promise<void> {
    try {
      this.logger.log('🔧 Starting automated maintenance tasks...');
      
      await this.updateScheduleStatus('maintenance', 'running');
      
      // Clean up old logs
      await this.cleanupOldLogs();
      
      // Optimize database
      await this.optimizeDatabase();
      
      // Clean up temporary files
      await this.cleanupTempFiles();
      
      // Generate daily reports
      await this.generateDailyReports();
      
      await this.updateScheduleStatus('maintenance', 'completed');
      this.logger.log('Automated maintenance completed successfully');
    } catch (error: any) {
      this.logger.error('Automated maintenance failed:', error);
      await this.updateScheduleStatus('maintenance', 'failed');
    }
  }

  /**
   * Performance Monitoring - runs every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async monitorPerformance(): Promise<void> {
    try {
      // Check response times
      const responseTime = await this.measureResponseTime();
      
      // Check memory usage
      const memoryUsage = await this.getMemoryUsage();
      
      // Check CPU usage
      const cpuUsage = await this.getCPUUsage();
      
      // Check database performance
      const dbPerformance = await this.getDatabasePerformance();
      
      // Save performance metrics
      await this.savePerformanceMetrics({
        responseTime,
        memoryUsage,
        cpuUsage,
        databasePerformance: dbPerformance,
        timestamp: new Date(),
      });
      
      // Check for performance issues
      await this.checkPerformanceThresholds({
        responseTime,
        memoryUsage,
        cpuUsage,
        dbPerformance,
      });
      
    } catch (error: any) {
      this.logger.error('Performance monitoring failed:', error);
    }
  }

  /**
   * Automated Backup - runs daily at 3 AM
   */
  @Cron('0 3 * * *')
  async performAutomatedBackup(): Promise<void> {
    try {
      this.logger.log('💾 Starting automated backup...');
      
      await this.updateScheduleStatus('backup', 'running');
      
      // Backup database
      const backupResult = await this.createDatabaseBackup();
      
      // Backup configuration files
      await this.backupConfiguration();
      
      // Verify backup integrity
      await this.verifyBackupIntegrity(backupResult);
      
      // Cleanup old backups
      await this.cleanupOldBackups();
      
      await this.updateScheduleStatus('backup', 'completed');
      this.logger.log('Automated backup completed successfully');
    } catch (error: any) {
      this.logger.error('Automated backup failed:', error);
      await this.updateScheduleStatus('backup', 'failed');
    }
  }

  /**
   * Transaction Monitoring and Cleanup - runs every hour
   */
  @Cron('0 * * * *')
  async monitorAndCleanupTransactions(): Promise<void> {
    try {
      // Find stuck transactions
      const stuckTransactions = await this.findStuckTransactions();
      
      // Process failed transactions
      const failedTransactions = await this.processFailedTransactions();
      
      // Update transaction statistics
      await this.updateTransactionStatistics();
      
      // Clean up old transaction logs
      await this.cleanupOldTransactions();
      
      // Create alerts for problematic transactions
      await this.createTransactionAlerts(stuckTransactions, failedTransactions);
      
    } catch (error: any) {
      this.logger.error('Transaction monitoring failed:', error);
    }
  }

  /**
   * Get system alerts
   */
  getSystemAlerts(): SystemAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve system alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.logger.log(`Alert ${alertId} resolved: ${alert.title}`);
    }
  }

  /**
   * Get automation schedules
   */
  getAutomationSchedules(): AutomationSchedule[] {
    return this.schedules;
  }

  /**
   * Create custom automation schedule
   */
  async createAutomationSchedule(schedule: Omit<AutomationSchedule, 'id' | 'status' | 'nextRun'>): Promise<AutomationSchedule> {
    const newSchedule: AutomationSchedule = {
      ...schedule,
      id: this.generateId(),
      status: 'pending',
      nextRun: this.calculateNextRun(schedule.schedule),
    };
    
    this.schedules.push(newSchedule);
    this.logger.log(`📅 Created automation schedule: ${schedule.name}`);
    
    return newSchedule;
  }

  /**
   * Execute manual system maintenance
   */
  async executeMaintenance(task: string): Promise<any> {
    this.logger.log(`🔧 Executing manual maintenance task: ${task}`);
    
    switch (task) {
      case 'optimize-database':
        return await this.optimizeDatabase();
      case 'cleanup-logs':
        return await this.cleanupOldLogs();
      case 'generate-reports':
        return await this.generateDailyReports();
      case 'backup':
        return await this.createDatabaseBackup();
      default:
        throw new Error(`Unknown maintenance task: ${task}`);
    }
  }

  // Private helper methods

  private async checkDatabaseHealth(): Promise<{ status: string; responseTime: number }> {
    const start = Date.now();
    try {
      await this.transactionRepo.query('SELECT 1');
      return {
        status: 'healthy',
        responseTime: Date.now() - start,
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
      };
    }
  }

  private async checkAPIHealth(): Promise<{ status: string; responseTime: number }> {
    const start = Date.now();
    try {
      // Test internal API endpoint
      const transactionCount = await this.transactionRepo.count();
      return {
        status: 'healthy',
        responseTime: Date.now() - start,
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - start,
      };
    }
  }

  private async checkTransactionHealth(): Promise<{ pending: number; failed: number; successRate: number }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const [pending, failed, total] = await Promise.all([
      this.transactionRepo.count({
        where: { status: 'pending', createdAt: MoreThan(oneHourAgo) },
      }),
      this.transactionRepo.count({
        where: { status: 'failed', createdAt: MoreThan(oneHourAgo) },
      }),
      this.transactionRepo.count({
        where: { createdAt: MoreThan(oneHourAgo) },
      }),
    ]);
    
    const successRate = total > 0 ? ((total - pending - failed) / total) * 100 : 100;
    
    return { pending, failed, successRate };
  }

  private async checkUserHealth(): Promise<{ active: number; new: number; total: number }> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const [active, newUsers, total] = await Promise.all([
      this.userRepo.count({
        where: { lastLoginAt: MoreThan(oneDayAgo) },
      }),
      this.userRepo.count({
        where: { createdAt: MoreThan(oneDayAgo) },
      }),
      this.userRepo.count(),
    ]);
    
    return { active, new: newUsers, total };
  }

  private calculateOverallHealth(health: any): { score: number; status: string } {
    const weights = {
      database: 0.3,
      api: 0.3,
      transactions: 0.2,
      users: 0.2,
    };
    
    let score = 0;
    
    // Database health
    score += health.database.status === 'healthy' ? weights.database * 100 : 0;
    
    // API health  
    score += health.api.status === 'healthy' ? weights.api * 100 : 0;
    
    // Transaction health
    score += health.transactions.successRate * weights.transactions;
    
    // User health (based on active percentage)
    const userHealthPercent = (health.users.active / Math.max(health.users.total, 1)) * 100;
    score += userHealthPercent * weights.users;
    
    const status = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'poor';
    
    return { score: Math.round(score), status };
  }

  private async saveSystemHealthMetrics(metrics: any): Promise<void> {
    const healthEntity = this.systemHealthRepo.create({
      timestamp: metrics.timestamp,
      overallScore: metrics.overall.score,
      databaseHealth: metrics.database.status,
      apiHealth: metrics.api.status,
      transactionSuccessRate: metrics.transactions.successRate,
      activeUsers: metrics.users.active,
      metadata: metrics,
    });
    
    await this.systemHealthRepo.save(healthEntity);
  }

  private async createHealthAlerts(health: any): Promise<void> {
    if (health.score < 75) {
      await this.createAlert({
        type: 'performance',
        severity: health.score < 50 ? 'critical' : 'high',
        title: 'System Health Degraded',
        message: `Overall system health is ${health.status} (${health.score}%)`,
        timestamp: new Date(),
        resolved: false,
        metadata: { healthScore: health.score, status: health.status },
      });
    }
  }

  private async createAlert(alert: Omit<SystemAlert, 'id'>): Promise<void> {
    const newAlert: SystemAlert = {
      ...alert,
      id: this.generateId(),
    };
    
    this.alerts.unshift(newAlert);
    
    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000);
    }
    
    this.logger.warn(`New alert: ${alert.title} - ${alert.message}`);
  }

  private async createTransactionAlerts(stuck: number, failed: number): Promise<void> {
    if (stuck > 10) {
      await this.createAlert({
        type: 'error',
        severity: 'high',
        title: 'Multiple Stuck Transactions',
        message: `${stuck} transactions appear to be stuck`,
        timestamp: new Date(),
        resolved: false,
        metadata: { stuckTransactions: stuck },
      });
    }
    
    if (failed > 5) {
      await this.createAlert({
        type: 'error',
        severity: 'medium',
        title: 'High Transaction Failure Rate',
        message: `${failed} transactions failed in the last hour`,
        timestamp: new Date(),
        resolved: false,
        metadata: { failedTransactions: failed },
      });
    }
  }

  private async savePerformanceMetrics(metrics: any): Promise<void> {
    const metricEntity = this.performanceRepo.create({
      timestamp: metrics.timestamp,
      responseTime: metrics.responseTime,
      memoryUsage: metrics.memoryUsage,
      cpuUsage: metrics.cpuUsage,
      databasePerformance: metrics.databasePerformance,
    });
    
    await this.performanceRepo.save(metricEntity);
  }

  private initializeDefaultSchedules(): void {
    this.schedules = [
      {
        id: 'maintenance',
        name: 'Daily Maintenance',
        type: 'maintenance',
        schedule: '0 2 * * *',
        enabled: true,
        status: 'pending',
        nextRun: this.calculateNextRun('0 2 * * *'),
      },
      {
        id: 'backup',
        name: 'Daily Backup',
        type: 'backup',
        schedule: '0 3 * * *',
        enabled: true,
        status: 'pending',
        nextRun: this.calculateNextRun('0 3 * * *'),
      },
      {
        id: 'cleanup',
        name: 'Weekly Cleanup',
        type: 'cleanup',
        schedule: '0 4 * * 0',
        enabled: true,
        status: 'pending',
        nextRun: this.calculateNextRun('0 4 * * 0'),
      },
    ];
  }

  private calculateNextRun(cronExpression: string): Date {
    // Simplified next run calculation
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(now.getHours() + 1);
    return nextRun;
  }

  private async updateScheduleStatus(scheduleId: string, status: AutomationSchedule['status']): Promise<void> {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.status = status;
      schedule.lastRun = new Date();
      schedule.nextRun = this.calculateNextRun(schedule.schedule);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Placeholder methods for actual implementation
  private async checkPerformanceThresholds(metrics: any): Promise<void> {
    // Implementation for performance threshold checking
  }

  private async measureResponseTime(): Promise<number> {
    // Implementation for response time measurement
    return Math.random() * 1000; // Placeholder
  }

  private async getMemoryUsage(): Promise<number> {
    // Implementation for memory usage measurement
    return Math.random() * 100; // Placeholder
  }

  private async getCPUUsage(): Promise<number> {
    // Implementation for CPU usage measurement
    return Math.random() * 100; // Placeholder
  }

  private async getDatabasePerformance(): Promise<number> {
    // Implementation for database performance measurement
    return Math.random() * 100; // Placeholder
  }

  private async findStuckTransactions(): Promise<number> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    return this.transactionRepo.count({
      where: { 
        status: 'pending',
        createdAt: LessThan(twoHoursAgo)
      }
    });
  }

  private async processFailedTransactions(): Promise<number> {
    // Implementation for processing failed transactions
    return 0;
  }

  private async updateTransactionStatistics(): Promise<void> {
    // Implementation for updating transaction statistics
  }

  private async cleanupOldTransactions(): Promise<void> {
    // Implementation for cleaning up old transactions
  }

  private async optimizeDatabase(): Promise<void> {
    // Implementation for database optimization
  }

  private async cleanupOldLogs(): Promise<void> {
    // Implementation for cleaning up old logs
  }

  private async cleanupTempFiles(): Promise<void> {
    // Implementation for cleaning up temporary files
  }

  private async generateDailyReports(): Promise<void> {
    // Implementation for generating daily reports
  }

  private async createDatabaseBackup(): Promise<any> {
    // Implementation for database backup
    return { success: true, timestamp: new Date() };
  }

  private async backupConfiguration(): Promise<void> {
    // Implementation for configuration backup
  }

  private async verifyBackupIntegrity(backup: any): Promise<void> {
    // Implementation for backup verification
  }

  private async cleanupOldBackups(): Promise<void> {
    // Implementation for cleaning up old backups
  }
}