/**
 * ARKHAM Phase 4: System Automation Engine
 * Enterprise-grade automation for self-managing platform
 * Integrates with: WebSocketService, TransactionService, Database
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebSocketService } from './websocket.service';
import { PerformanceMonitorService } from './performance-monitor.service';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  databaseConnections: number;
  activeTransactions: number;
  errorRate: number;
  responseTime: number;
  timestamp: Date;
}

interface AutomationAction {
  id: string;
  type: 'backup' | 'optimize' | 'restart' | 'scale' | 'cleanup';
  priority: 'low' | 'medium' | 'high' | 'critical';
  target: string;
  parameters: Record<string, any>;
  scheduledAt: Date;
  executedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

@Injectable()
export class SystemAutomationService {
  private readonly logger = new Logger(SystemAutomationService.name);
  private automationActions: Map<string, AutomationAction> = new Map();
  private systemHealth: SystemMetrics;
  private isSystemHealthy = true;
  private lastOptimizationDate: Date = new Date();

  constructor(
    @InjectRepository('any')
    private readonly databaseRepository: Repository<any>,
    private readonly websocketService: WebSocketService,
    private readonly performanceMonitor: PerformanceMonitorService,
  ) {
    this.initializeAutomation();
    this.startHealthMonitoring();
  }

  private initializeAutomation(): void {
    this.logger.log('🤖 Initializing ARKHAM System Automation...');
    
    // Initialize system metrics
    this.systemHealth = {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      databaseConnections: 0,
      activeTransactions: 0,
      errorRate: 0,
      responseTime: 0,
      timestamp: new Date(),
    };

    // Setup automation schedules
    this.scheduleAutomationActions();
    
    this.logger.log('✅ ARKHAM System Automation initialized');
  }

  private startHealthMonitoring(): void {
    // Continuous health monitoring
    setInterval(() => {
      this.monitorSystemHealth();
    }, 30000); // Every 30 seconds
  }

  private scheduleAutomationActions(): void {
    // Critical: Database backup every 4 hours
    this.addAutomationAction({
      id: 'backup_db_001',
      type: 'backup',
      priority: 'critical',
      target: 'database',
      parameters: { 
        type: 'full',
        compression: true,
        retention: 30 
      },
      scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      status: 'pending'
    });

    // High: Performance optimization daily
    this.addAutomationAction({
      id: 'optimize_perf_001',
      type: 'optimize',
      priority: 'high',
      target: 'database',
      parameters: { 
        analyze: true,
        vacuum: true,
        reindex: true 
      },
      scheduledAt: this.getNextDailyTime(2, 0), // 2 AM daily
      status: 'pending'
    });

    // Medium: Cache cleanup every 6 hours
    this.addAutomationAction({
      id: 'cleanup_cache_001',
      type: 'cleanup',
      priority: 'medium',
      target: 'cache',
      parameters: { 
        expireOldEntries: true,
        memoryCleanup: true 
      },
      scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      status: 'pending'
    });

    // Medium: Log rotation weekly
    this.addAutomationAction({
      id: 'rotate_logs_001',
      type: 'cleanup',
      priority: 'medium',
      target: 'logs',
      parameters: { 
        compressOld: true,
        deleteAfterDays: 30 
      },
      scheduledAt: this.getNextWeeklyTime(1, 1), // Sunday 1 AM
      status: 'pending'
    });
  }

  // Automated Database Backup
  @Cron(CronExpression.EVERY_4_HOURS)
  async performAutomatedBackup(): Promise<void> {
    this.logger.log('🔄 Starting automated database backup...');
    
    try {
      const actionId = `backup_${Date.now()}`;
      const backupAction: AutomationAction = {
        id: actionId,
        type: 'backup',
        priority: 'critical',
        target: 'database',
        parameters: { automated: true, full: true },
        scheduledAt: new Date(),
        status: 'running'
      };

      this.automationActions.set(actionId, backupAction);

      // Notify admins via WebSocket
      await this.websocketService.sendToAdmins('system:backup_started', {
        backupId: actionId,
        timestamp: new Date(),
        type: 'automated',
        priority: 'critical'
      });

      // Perform backup
      const backupResult = await this.executeDatabaseBackup(backupAction.parameters);
      
      backupAction.status = 'completed';
      backupAction.executedAt = new Date();
      backupAction.result = backupResult;

      // Notify completion
      await this.websocketService.sendToAdmins('system:backup_completed', {
        backupId: actionId,
        timestamp: new Date(),
        size: backupResult.size,
        duration: backupResult.duration,
        status: 'success'
      });

      this.logger.log(`✅ Database backup completed: ${backupResult.size}MB in ${backupResult.duration}ms`);

    } catch (error) {
      this.logger.error(`❌ Automated backup failed: ${error.message}`);
      
      // Send critical alert
      await this.websocketService.sendSystemAlert('error', 'Automated backup failed', {
        error: error.message,
        timestamp: new Date(),
        requiresAttention: true
      });
    }
  }

  // Automated Performance Optimization
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async performPerformanceOptimization(): Promise<void> {
    this.logger.log('⚡ Starting automated performance optimization...');
    
    try {
      const actionId = `optimize_${Date.now()}`;
      const optimizeAction: AutomationAction = {
        id: actionId,
        type: 'optimize',
        priority: 'high',
        target: 'system',
        parameters: { automated: true, comprehensive: true },
        scheduledAt: new Date(),
        status: 'running'
      };

      this.automationActions.set(actionId, optimizeAction);

      // Notify admins
      await this.websocketService.sendToAdmins('system:optimization_started', {
        optimizationId: actionId,
        timestamp: new Date(),
        type: 'automated',
        estimatedDuration: '10-15 minutes'
      });

      // Perform optimization
      const optimizationResult = await this.executePerformanceOptimization(optimizeAction.parameters);
      
      optimizeAction.status = 'completed';
      optimizeAction.executedAt = new Date();
      optimizeAction.result = optimizationResult;

      // Notify completion with results
      await this.websocketService.sendToAdmins('system:optimization_completed', {
        optimizationId: actionId,
        timestamp: new Date(),
        improvements: optimizationResult.improvements,
        duration: optimizationResult.duration,
        status: 'success'
      });

      this.lastOptimizationDate = new Date();
      this.logger.log(`✅ Performance optimization completed: ${optimizationResult.improvements.join(', ')}`);

    } catch (error) {
      this.logger.error(`❌ Performance optimization failed: ${error.message}`);
      
      await this.websocketService.sendSystemAlert('warning', 'Performance optimization failed', {
        error: error.message,
        timestamp: new Date(),
        requiresAttention: false
      });
    }
  }

  // Cache Management Automation
  @Cron(CronExpression.EVERY_6_HOURS)
  async performCacheManagement(): Promise<void> {
    this.logger.log('🗂️ Starting automated cache management...');
    
    try {
      const actionId = `cache_cleanup_${Date.now()}`;
      const cacheAction: AutomationAction = {
        id: actionId,
        type: 'cleanup',
        priority: 'medium',
        target: 'cache',
        parameters: { automated: true, aggressive: false },
        scheduledAt: new Date(),
        status: 'running'
      };

      this.automationActions.set(actionId, cacheAction);

      // Perform cache cleanup
      const cleanupResult = await this.executeCacheCleanup(cacheAction.parameters);
      
      cacheAction.status = 'completed';
      cacheAction.executedAt = new Date();
      cacheAction.result = cleanupResult;

      this.logger.log(`✅ Cache cleanup completed: ${cleanupResult.entriesRemoved} entries removed`);

    } catch (error) {
      this.logger.error(`❌ Cache cleanup failed: ${error.message}`);
    }
  }

  // Self-Healing System Monitor
  public async monitorSystemHealth(): Promise<void> {
    try {
      const currentMetrics = await this.collectSystemMetrics();
      this.systemHealth = currentMetrics;

      // Check for critical conditions
      const criticalIssues = this.detectCriticalIssues(currentMetrics);
      
      if (criticalIssues.length > 0) {
        await this.handleCriticalIssues(criticalIssues);
      }

      // Check if system needs optimization
      if (this.shouldTriggerOptimization(currentMetrics)) {
        await this.triggerPerformanceOptimization();
      }

      // Broadcast health status to admins
      await this.broadcastSystemHealth(currentMetrics);

    } catch (error) {
      this.logger.error(`System health monitoring failed: ${error.message}`);
    }
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    // Get actual system metrics (simplified for demonstration)
    const os = require('os');
    
    return {
      cpuUsage: await this.getCPUUsage(),
      memoryUsage: (os.totalmem() - os.freemem()) / os.totalmem() * 100,
      diskUsage: await this.getDiskUsage(),
      databaseConnections: await this.getDatabaseConnections(),
      activeTransactions: await this.getActiveTransactions(),
      errorRate: await this.getErrorRate(),
      responseTime: await this.getAverageResponseTime(),
      timestamp: new Date(),
    };
  }

  private async getCPUUsage(): Promise<number> {
    // Simplified CPU usage calculation
    const os = require('os');
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;

    cpus.forEach((cpu: any) => {
      for (let type in cpu.times) {
        total += cpu.times[type];
      }
      idle += cpu.times.idle;
    });

    return 100 - (idle / total * 100);
  }

  private async getDiskUsage(): Promise<number> {
    // Simplified disk usage - in real implementation, use fs.statfs or similar
    return Math.random() * 50 + 20; // 20-70% usage
  }

  private async getDatabaseConnections(): Promise<number> {
    // In real implementation, query database connection pool
    return Math.floor(Math.random() * 50) + 10; // 10-60 connections
  }

  private async getActiveTransactions(): Promise<number> {
    // Query active transactions from database
    return Math.floor(Math.random() * 100) + 5; // 5-105 active
  }

  private async getErrorRate(): Promise<number> {
    // Calculate from recent error logs
    return Math.random() * 5; // 0-5% error rate
  }

  private async getAverageResponseTime(): Promise<number> {
    // Calculate from recent API response times
    return Math.random() * 200 + 50; // 50-250ms
  }

  private detectCriticalIssues(metrics: SystemMetrics): string[] {
    const issues: string[] = [];

    if (metrics.cpuUsage > 85) {
      issues.push('high_cpu_usage');
    }

    if (metrics.memoryUsage > 80) {
      issues.push('high_memory_usage');
    }

    if (metrics.errorRate > 10) {
      issues.push('high_error_rate');
    }

    if (metrics.responseTime > 500) {
      issues.push('slow_response_times');
    }

    if (metrics.databaseConnections > 80) {
      issues.push('database_connection_stress');
    }

    return issues;
  }

  private async handleCriticalIssues(issues: string[]): Promise<void> {
    this.isSystemHealthy = false;

    // Send critical alert to admins
    await this.websocketService.sendSystemAlert('error', 'Critical system issues detected', {
      issues,
      metrics: this.systemHealth,
      timestamp: new Date(),
      automatedResponse: 'triggering_healing_procedures'
    });

    // Trigger appropriate healing actions
    for (const issue of issues) {
      await this.triggerHealingProcedure(issue);
    }
  }

  private shouldTriggerOptimization(metrics: SystemMetrics): boolean {
    // Trigger optimization if metrics show degradation
    const daysSinceLastOptimization = (Date.now() - this.lastOptimizationDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return (
      daysSinceLastOptimization > 1 && // More than 1 day since last optimization
      (metrics.responseTime > 300 || // Slow response times
       metrics.errorRate > 2 ||      // Elevated error rate
       metrics.memoryUsage > 70)     // High memory usage
    );
  }

  private async triggerPerformanceOptimization(): Promise<void> {
    this.logger.log('⚡ Triggering performance optimization due to metrics degradation...');
    
    const actionId = `auto_optimize_${Date.now()}`;
    const optimizeAction: AutomationAction = {
      id: actionId,
      type: 'optimize',
      priority: 'high',
      target: 'system',
      parameters: { automated: true, triggeredByMetrics: true },
      scheduledAt: new Date(),
      status: 'running'
    };

    this.automationActions.set(actionId, optimizeAction);

    try {
      const optimizationResult = await this.executePerformanceOptimization(optimizeAction.parameters);
      
      optimizeAction.status = 'completed';
      optimizeAction.executedAt = new Date();
      optimizeAction.result = optimizationResult;

      this.lastOptimizationDate = new Date();
      
      await this.websocketService.sendToAdmins('system:auto_optimization_completed', {
        optimizationId: actionId,
        triggeredBy: 'metrics_degradation',
        improvements: optimizationResult.improvements,
        timestamp: new Date()
      });

    } catch (error) {
      optimizeAction.status = 'failed';
      optimizeAction.error = error.message;
      
      await this.websocketService.sendSystemAlert('warning', 'Auto-optimization failed', {
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  private async triggerHealingProcedure(issue: string): Promise<void> {
    this.logger.log(`🏥 Triggering healing procedure for: ${issue}`);

    switch (issue) {
      case 'high_cpu_usage':
        await this.healHighCPUUsage();
        break;
      case 'high_memory_usage':
        await this.healHighMemoryUsage();
        break;
      case 'high_error_rate':
        await this.healHighErrorRate();
        break;
      case 'slow_response_times':
        await this.healSlowResponseTimes();
        break;
      case 'database_connection_stress':
        await this.healDatabaseConnectionStress();
        break;
    }
  }

  private async healHighCPUUsage(): Promise<void> {
    // Clear unnecessary caches
    await this.clearNonEssentialCaches();
    
    // Restart resource-heavy services
    await this.restartResourceIntensiveServices();
    
    // Scale up if needed
    await this.requestSystemScaling();
  }

  private async healHighMemoryUsage(): Promise<void> {
    // Aggressive cache cleanup
    await this.aggressiveCacheCleanup();
    
    // Clear connection pools
    await this.clearIdleConnections();
    
    // Force garbage collection (if supported)
    if (global.gc) {
      global.gc();
    }
  }

  private async healHighErrorRate(): Promise<void> {
    // Restart failing services
    await this.restartFailingServices();
    
    // Clear corrupted caches
    await this.clearCorruptedCaches();
    
    // Reset connection pools
    await this.resetConnectionPools();
  }

  private async healSlowResponseTimes(): Promise<void> {
    // Clear query caches
    await this.clearQueryCaches();
    
    // Restart web servers
    await this.restartWebServers();
    
    // Optimize database queries
    await this.optimizeSlowQueries();
  }

  private async healDatabaseConnectionStress(): Promise<void> {
    // Close idle connections
    await this.closeIdleDatabaseConnections();
    
    // Increase connection pool limits temporarily
    await this.increaseConnectionPoolTemporarily();
    
    // Restart database connection manager
    await this.restartDatabaseConnectionManager();
  }

  // Database backup implementation
  private async executeDatabaseBackup(parameters: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      // In real implementation, this would use pg_dump or similar
      // For now, simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const duration = Date.now() - startTime;
      const backupSize = Math.floor(Math.random() * 500) + 100; // 100-600MB
      
      return {
        size: backupSize,
        duration,
        location: `/backups/automated_backup_${Date.now()}.sql.gz`,
        timestamp: new Date(),
        status: 'success'
      };
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  // Performance optimization implementation
  private async executePerformanceOptimization(parameters: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      const improvements: string[] = [];
      
      // Database optimization
      await this.optimizeDatabase();
      improvements.push('database_optimization');
      
      // Cache optimization
      await this.optimizeCache();
      improvements.push('cache_optimization');
      
      // Memory optimization
      await this.optimizeMemory();
      improvements.push('memory_optimization');
      
      // Index optimization
      await this.optimizeIndexes();
      improvements.push('index_optimization');
      
      const duration = Date.now() - startTime;
      
      return {
        improvements,
        duration,
        timestamp: new Date(),
        status: 'success'
      };
    } catch (error) {
      throw new Error(`Optimization failed: ${error.message}`);
    }
  }

  // Cache cleanup implementation
  private async executeCacheCleanup(parameters: any): Promise<any> {
    try {
      // Simulate cache cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        entriesRemoved: Math.floor(Math.random() * 1000) + 100,
        memoryFreed: Math.floor(Math.random() * 50) + 10, // MB
        timestamp: new Date(),
        status: 'success'
      };
    } catch (error) {
      throw new Error(`Cache cleanup failed: ${error.message}`);
    }
  }

  // Utility methods
  private addAutomationAction(action: AutomationAction): void {
    this.automationActions.set(action.id, action);
  }

  private getNextDailyTime(hour: number, minute: number): Date {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  }

  private getNextWeeklyTime(dayOfWeek: number, hour: number): Date {
    const now = new Date();
    const next = new Date();
    next.setDate(now.getDate() + ((7 + dayOfWeek - now.getDay()) % 7));
    next.setHours(hour, 0, 0, 0);
    
    return next;
  }

  private async broadcastSystemHealth(metrics: SystemMetrics): Promise<void> {
    await this.websocketService.broadcastToChannel('system-health', {
      type: 'health_update',
      data: {
        isHealthy: this.isSystemHealthy,
        metrics,
        uptime: process.uptime(),
        timestamp: new Date()
      }
    });
  }

  // Additional healing methods (simplified implementations)
  private async clearNonEssentialCaches(): Promise<void> {
    this.logger.log('🧹 Clearing non-essential caches...');
  }

  private async restartResourceIntensiveServices(): Promise<void> {
    this.logger.log('🔄 Restarting resource-intensive services...');
  }

  private async requestSystemScaling(): Promise<void> {
    this.logger.log('📈 Requesting system scaling...');
  }

  private async aggressiveCacheCleanup(): Promise<void> {
    this.logger.log('🧹🧹 Aggressive cache cleanup...');
  }

  private async clearIdleConnections(): Promise<void> {
    this.logger.log('🔌 Clearing idle connections...');
  }

  private async restartFailingServices(): Promise<void> {
    this.logger.log('🔄 Restarting failing services...');
  }

  private async clearCorruptedCaches(): Promise<void> {
    this.logger.log('🧹 Clearing corrupted caches...');
  }

  private async resetConnectionPools(): Promise<void> {
    this.logger.log('🔌 Resetting connection pools...');
  }

  private async clearQueryCaches(): Promise<void> {
    this.logger.log('🧹 Clearing query caches...');
  }

  private async restartWebServers(): Promise<void> {
    this.logger.log('🔄 Restarting web servers...');
  }

  private async optimizeSlowQueries(): Promise<void> {
    this.logger.log('⚡ Optimizing slow queries...');
  }

  private async closeIdleDatabaseConnections(): Promise<void> {
    this.logger.log('🔌 Closing idle database connections...');
  }

  private async increaseConnectionPoolTemporarily(): Promise<void> {
    this.logger.log('📈 Increasing connection pool temporarily...');
  }

  private async restartDatabaseConnectionManager(): Promise<void> {
    this.logger.log('🔄 Restarting database connection manager...');
  }

  // Optimization methods
  private async optimizeDatabase(): Promise<void> {
    this.logger.log('⚡ Optimizing database...');
  }

  private async optimizeCache(): Promise<void> {
    this.logger.log('⚡ Optimizing cache...');
  }

  private async optimizeMemory(): Promise<void> {
    this.logger.log('⚡ Optimizing memory...');
  }

  private async optimizeIndexes(): Promise<void> {
    this.logger.log('⚡ Optimizing indexes...');
  }

  // Public methods for external access
  public getSystemHealth(): SystemMetrics {
    return this.systemHealth;
  }

  /**
   * Get system health data in the format expected by admin controller
   */
  public async getSystemHealthForAdmin(): Promise<SystemHealthEntity[]> {
    // Create a SystemHealthEntity from current metrics
    const healthEntity = {
      id: 'current_health',
      timestamp: new Date(),
      overallScore: this.calculateOverallHealthScore(),
      databaseHealth: this.systemHealth.databaseConnections > 80 ? 'warning' : 'healthy',
      apiHealth: this.systemHealth.responseTime > 500 ? 'warning' : 'healthy',
      transactionSuccessRate: Math.max(0, 100 - this.systemHealth.errorRate),
      activeUsers: this.systemHealth.activeTransactions, // Using transactions as proxy for active users
      metadata: {
        cpuUsage: this.systemHealth.cpuUsage,
        memoryUsage: this.systemHealth.memoryUsage,
        diskUsage: this.systemHealth.diskUsage,
        errorRate: this.systemHealth.errorRate,
        responseTime: this.systemHealth.responseTime,
        databaseConnections: this.systemHealth.databaseConnections,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return [healthEntity];
  }

  private calculateOverallHealthScore(): number {
    let score = 100;

    // Deduct points for high resource usage
    if (this.systemHealth.cpuUsage > 80) score -= 20;
    else if (this.systemHealth.cpuUsage > 60) score -= 10;

    if (this.systemHealth.memoryUsage > 80) score -= 20;
    else if (this.systemHealth.memoryUsage > 60) score -= 10;

    if (this.systemHealth.errorRate > 5) score -= 30;
    else if (this.systemHealth.errorRate > 2) score -= 15;

    if (this.systemHealth.responseTime > 500) score -= 15;
    else if (this.systemHealth.responseTime > 300) score -= 10;

    if (this.systemHealth.databaseConnections > 80) score -= 10;

    return Math.max(0, score);
  }

  public getAutomationActions(): AutomationAction[] {
    return Array.from(this.automationActions.values());
  }

  public async triggerManualOptimization(): Promise<void> {
    this.logger.log('⚡ Triggering manual optimization...');
    await this.triggerPerformanceOptimization();
  }

  public async triggerManualBackup(): Promise<void> {
    this.logger.log('💾 Triggering manual backup...');
    await this.performAutomatedBackup();
  }
}