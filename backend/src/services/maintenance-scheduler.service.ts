/**
 * ARKHAM Phase 4: Maintenance Scheduler Service
 * Automated scheduling and coordination of maintenance tasks
 * Integrates with: SystemAutomationService, PerformanceMonitorService, Database
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { WebSocketService } from './websocket.service';

interface MaintenanceTask {
  id: string;
  name: string;
  type: 'backup' | 'optimization' | 'cleanup' | 'update' | 'monitoring' | 'security';
  schedule: string; // Cron expression
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'skipped';
  duration?: number; // milliseconds
  result?: any;
  error?: string;
  dependencies: string[]; // Task IDs that must complete first
  maintenanceWindow?: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  notificationSettings: {
    onStart: boolean;
    onComplete: boolean;
    onFailure: boolean;
    recipients: string[];
  };
}

interface MaintenanceWindow {
  id: string;
  name: string;
  start: Date;
  end: Date;
  timezone: string;
  affectedServices: string[];
  maintenanceType: 'planned' | 'emergency' | 'automated';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  notificationSent: boolean;
}

interface ScheduledMaintenance {
  taskId: string;
  windowId: string;
  scheduledAt: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  executionId: string;
}

@Injectable()
export class MaintenanceSchedulerService {
  private readonly logger = new Logger(MaintenanceSchedulerService.name);
  private tasks: Map<string, MaintenanceTask> = new Map();
  private maintenanceWindows: Map<string, MaintenanceWindow> = new Map();
  private scheduledTasks: Map<string, ScheduledMaintenance> = new Map();
  private executionHistory: Map<string, any> = new Map();
  private isMaintenanceMode = false;
  private activeMaintenanceWindow: MaintenanceWindow | null = null;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly websocketService: WebSocketService,
  ) {
    this.initializeMaintenanceScheduler();
  }

  private initializeMaintenanceScheduler(): void {
    this.logger.log('🔧 Initializing ARKHAM Maintenance Scheduler...');
    
    // Initialize default maintenance tasks
    this.initializeDefaultTasks();
    
    // Initialize default maintenance windows
    this.initializeDefaultWindows();
    
    // Start maintenance monitoring
    this.startMaintenanceMonitoring();
    
    this.logger.log('✅ ARKHAM Maintenance Scheduler initialized');
  }

  private initializeDefaultTasks(): void {
    // Critical: Database backup
    this.addMaintenanceTask({
      id: 'db_backup_daily',
      name: 'Daily Database Backup',
      type: 'backup',
      schedule: '0 2 * * *', // 2 AM daily
      enabled: true,
      priority: 'critical',
      description: 'Complete database backup with compression',
      dependencies: [],
      maintenanceWindow: {
        start: '01:30',
        end: '03:00',
        timezone: 'UTC'
      },
      notificationSettings: {
        onStart: true,
        onComplete: true,
        onFailure: true,
        recipients: [process.env.AUTO_ADMIN_EMAIL || 'bknglabs.dev@gmail.com']
      }
    });

    // High: Weekly database optimization
    this.addMaintenanceTask({
      id: 'db_optimize_weekly',
      name: 'Weekly Database Optimization',
      type: 'optimization',
      schedule: '0 3 * * 0', // 3 AM Sunday
      enabled: true,
      priority: 'high',
      description: 'Comprehensive database optimization including analyze, vacuum, reindex',
      dependencies: ['db_backup_daily'],
      maintenanceWindow: {
        start: '02:30',
        end: '05:00',
        timezone: 'UTC'
      },
      notificationSettings: {
        onStart: true,
        onComplete: true,
        onFailure: true,
        recipients: [process.env.AUTO_ADMIN_EMAIL || 'bknglabs.dev@gmail.com', 'dba@arkham.com']
      }
    });

    // Medium: Cache cleanup
    this.addMaintenanceTask({
      id: 'cache_cleanup_daily',
      name: 'Daily Cache Cleanup',
      type: 'cleanup',
      schedule: '0 4 * * *', // 4 AM daily
      enabled: true,
      priority: 'medium',
      description: 'Clean expired cache entries and optimize memory usage',
      dependencies: [],
      maintenanceWindow: {
        start: '03:30',
        end: '05:00',
        timezone: 'UTC'
      },
      notificationSettings: {
        onStart: false,
        onComplete: true,
        onFailure: true,
        recipients: [process.env.AUTO_ADMIN_EMAIL || 'bknglabs.dev@gmail.com']
      }
    });

    // Medium: Log rotation
    this.addMaintenanceTask({
      id: 'log_rotation_weekly',
      name: 'Weekly Log Rotation',
      type: 'cleanup',
      schedule: '0 5 * * 1', // 5 AM Monday
      enabled: true,
      priority: 'medium',
      description: 'Rotate and compress old log files',
      dependencies: [],
      maintenanceWindow: {
        start: '04:00',
        end: '06:00',
        timezone: 'UTC'
      },
      notificationSettings: {
        onStart: false,
        onComplete: true,
        onFailure: false,
        recipients: [process.env.AUTO_ADMIN_EMAIL || 'bknglabs.dev@gmail.com']
      }
    });

    // High: Security updates
    this.addMaintenanceTask({
      id: 'security_updates_daily',
      name: 'Daily Security Updates Check',
      type: 'security',
      schedule: '30 6 * * *', // 6:30 AM daily
      enabled: true,
      priority: 'high',
      description: 'Check for and apply security updates',
      dependencies: ['db_backup_daily'],
      maintenanceWindow: {
        start: '05:30',
        end: '07:30',
        timezone: 'UTC'
      },
      notificationSettings: {
        onStart: true,
        onComplete: true,
        onFailure: true,
        recipients: ['security@arkham.com', process.env.AUTO_ADMIN_EMAIL || 'bknglabs.dev@gmail.com']
      }
    });

    // Low: Analytics data cleanup
    this.addMaintenanceTask({
      id: 'analytics_cleanup_monthly',
      name: 'Monthly Analytics Data Cleanup',
      type: 'cleanup',
      schedule: '0 7 1 * *', // 7 AM on 1st of month
      enabled: true,
      priority: 'low',
      description: 'Archive or delete old analytics data',
      dependencies: [],
      maintenanceWindow: {
        start: '06:00',
        end: '08:00',
        timezone: 'UTC'
      },
      notificationSettings: {
        onStart: false,
        onComplete: true,
        onFailure: false,
        recipients: [process.env.AUTO_ADMIN_EMAIL || 'bknglabs.dev@gmail.com']
      }
    });

    // High: System health deep scan
    this.addMaintenanceTask({
      id: 'health_scan_weekly',
      name: 'Weekly System Health Deep Scan',
      type: 'monitoring',
      schedule: '0 8 * * 6', // 8 AM Saturday
      enabled: true,
      priority: 'high',
      description: 'Comprehensive system health analysis and optimization recommendations',
      dependencies: [],
      maintenanceWindow: {
        start: '07:00',
        end: '10:00',
        timezone: 'UTC'
      },
      notificationSettings: {
        onStart: true,
        onComplete: true,
        onFailure: true,
        recipients: [process.env.AUTO_ADMIN_EMAIL || 'bknglabs.dev@gmail.com', 'ops@arkham.com']
      }
    });
  }

  private initializeDefaultWindows(): void {
    // Daily maintenance window (2-6 AM UTC)
    this.addMaintenanceWindow({
      id: 'daily_window',
      name: 'Daily Maintenance Window',
      start: this.getNextDailyWindow(2, 0),
      end: this.getNextDailyWindow(6, 0),
      timezone: 'UTC',
      affectedServices: ['database', 'cache', 'logs', 'backup'],
      maintenanceType: 'automated',
      status: 'scheduled',
      notificationSent: false
    });

    // Weekly extended window (Sunday 2-8 AM UTC)
    this.addMaintenanceWindow({
      id: 'weekly_window',
      name: 'Weekly Extended Maintenance Window',
      start: this.getNextWeeklyWindow(0, 2, 0), // Sunday 2 AM
      end: this.getNextWeeklyWindow(0, 8, 0),   // Sunday 8 AM
      timezone: 'UTC',
      affectedServices: ['database', 'cache', 'logs', 'backup', 'security', 'analytics'],
      maintenanceType: 'planned',
      status: 'scheduled',
      notificationSent: false
    });

    // Monthly security maintenance window
    this.addMaintenanceWindow({
      id: 'monthly_security_window',
      name: 'Monthly Security Maintenance Window',
      start: this.getNextMonthlyWindow(1, 1, 0), // 1st of month 1 AM
      end: this.getNextMonthlyWindow(1, 5, 0),   // 1st of month 5 AM
      timezone: 'UTC',
      affectedServices: ['security', 'updates', 'patches'],
      maintenanceType: 'planned',
      status: 'scheduled',
      notificationSent: false
    });
  }

  private startMaintenanceMonitoring(): void {
    // Monitor maintenance windows
    setInterval(() => {
      this.monitorMaintenanceWindows();
    }, 60000); // Every minute

    // Check for tasks ready to execute
    setInterval(() => {
      this.checkPendingTasks();
    }, 30000); // Every 30 seconds

    // Generate maintenance reports
    setInterval(() => {
      this.generateMaintenanceReport();
    }, 60 * 60 * 1000); // Hourly
  }

  // Add maintenance task
  private addMaintenanceTask(task: Omit<MaintenanceTask, 'status'>): void {
    const fullTask: MaintenanceTask = {
      ...task,
      status: 'idle'
    };
    
    this.tasks.set(task.id, fullTask);
    
    // Register cron job if enabled
    if (task.enabled) {
      this.registerCronJob(task);
    }
    
    this.logger.log(`📋 Added maintenance task: ${task.name} (${task.schedule})`);
  }

  // Add maintenance window
  private addMaintenanceWindow(window: Omit<MaintenanceWindow, 'notificationSent'>): void {
    const fullWindow: MaintenanceWindow = {
      ...window,
      notificationSent: false
    };
    
    this.maintenanceWindows.set(window.id, fullWindow);
    this.logger.log(`🕐 Added maintenance window: ${window.name}`);
  }

  // Register cron job for task
  private registerCronJob(task: MaintenanceTask): void {
    try {
      const cronJob = new Cron(task.schedule, {
        name: task.id,
        timeZone: task.maintenanceWindow?.timezone || 'UTC'
      });

      cronJob.addCallback(() => {
        this.executeMaintenanceTask(task.id);
      });

      this.schedulerRegistry.addCronJob(task.id, cronJob);
      cronJob.start();
      
      this.logger.log(`⏰ Registered cron job: ${task.id} (${task.schedule})`);
      
    } catch (error) {
      this.logger.error(`Failed to register cron job for ${task.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Execute maintenance task
  private async executeMaintenanceTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'running') {
      return;
    }

    // Check dependencies
    const dependenciesReady = await this.checkTaskDependencies(task);
    if (!dependenciesReady) {
      task.status = 'skipped';
      this.logger.log(`⏭️ Skipped task ${taskId} - dependencies not ready`);
      return;
    }

    // Check maintenance window
    const window = this.getActiveMaintenanceWindow();
    if (!this.isWithinMaintenanceWindow(task)) {
      task.status = 'skipped';
      this.logger.log(`⏭️ Skipped task ${taskId} - outside maintenance window`);
      return;
    }

    // Execute task
    task.status = 'running';
    task.lastRun = new Date();
    
    const executionId = `${taskId}_${Date.now()}`;
    this.scheduledTasks.set(executionId, {
      taskId,
      windowId: window?.id || 'no_window',
      scheduledAt: new Date(),
      status: 'executing',
      executionId
    });

    this.logger.log(`🔧 Executing maintenance task: ${task.name}`);

    try {
      // Send start notification
      if (task.notificationSettings.onStart) {
        await this.sendNotification('start', task);
      }

      // Execute task logic
      const startTime = Date.now();
      const result = await this.executeTaskLogic(task);
      const duration = Date.now() - startTime;

      task.status = 'completed';
      task.duration = duration;
      task.result = result;

      // Update execution record
      const execution = this.scheduledTasks.get(executionId);
      if (execution) {
        execution.status = 'completed';
      }

      // Store execution history
      this.executionHistory.set(executionId, {
        taskId,
        windowId: window?.id,
        startTime: task.lastRun,
        endTime: new Date(),
        duration,
        result,
        status: 'success'
      });

      // Send completion notification
      if (task.notificationSettings.onComplete) {
        await this.sendNotification('complete', task);
      }

      this.logger.log(`✅ Completed maintenance task: ${task.name} (${duration}ms)`);

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      
      // Update execution record
      const execution = this.scheduledTasks.get(executionId);
      if (execution) {
        execution.status = 'failed';
      }

      // Store failure history
      this.executionHistory.set(executionId, {
        taskId,
        windowId: window?.id,
        startTime: task.lastRun,
        endTime: new Date(),
        error: error instanceof Error ? error.message : String(error),
        status: 'failed'
      });

      // Send failure notification
      if (task.notificationSettings.onFailure) {
        await this.sendNotification('failure', task);
      }

      this.logger.error(`❌ Failed maintenance task: ${task.name} - ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Execute task-specific logic
  private async executeTaskLogic(task: MaintenanceTask): Promise<any> {
    switch (task.type) {
      case 'backup':
        return await this.executeBackupTask(task);
      case 'optimization':
        return await this.executeOptimizationTask(task);
      case 'cleanup':
        return await this.executeCleanupTask(task);
      case 'security':
        return await this.executeSecurityTask(task);
      case 'monitoring':
        return await this.executeMonitoringTask(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  // Backup task execution
  private async executeBackupTask(task: MaintenanceTask): Promise<any> {
    this.logger.log(`💾 Executing backup: ${task.name}`);
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return {
      type: 'database_backup',
      size: Math.floor(Math.random() * 500) + 100, // 100-600MB
      location: `/backups/backup_${Date.now()}.sql.gz`,
      compressed: true,
      checksum: `sha256_${Math.random().toString(36).substr(2, 16)}`
    };
  }

  // Optimization task execution
  private async executeOptimizationTask(task: MaintenanceTask): Promise<any> {
    this.logger.log(`⚡ Executing optimization: ${task.name}`);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const optimizations = [
      'Database analyze completed',
      'Vacuum operation finished',
      'Reindexing successful',
      'Statistics updated',
      'Query plan cache cleared'
    ];
    
    return {
      type: 'database_optimization',
      optimizations,
      performance_gain: Math.floor(Math.random() * 20) + 5, // 5-25% improvement
      duration: 10000
    };
  }

  // Cleanup task execution
  private async executeCleanupTask(task: MaintenanceTask): Promise<any> {
    this.logger.log(`🧹 Executing cleanup: ${task.name}`);
    
    // Simulate cleanup process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      type: 'cleanup',
      itemsProcessed: Math.floor(Math.random() * 10000) + 1000,
      spaceFreed: Math.floor(Math.random() * 100) + 10, // MB
      duration: 3000
    };
  }

  // Security task execution
  private async executeSecurityTask(task: MaintenanceTask): Promise<any> {
    this.logger.log(`🛡️ Executing security task: ${task.name}`);
    
    // Simulate security update process
    await new Promise(resolve => setTimeout(resolve, 7000));
    
    return {
      type: 'security_update',
      updatesApplied: Math.floor(Math.random() * 5) + 1,
      vulnerabilitiesFixed: Math.floor(Math.random() * 3),
      duration: 7000
    };
  }

  // Monitoring task execution
  private async executeMonitoringTask(task: MaintenanceTask): Promise<any> {
    this.logger.log(`📊 Executing monitoring task: ${task.name}`);
    
    // Simulate health scan
    await new Promise(resolve => setTimeout(resolve, 12000));
    
    return {
      type: 'health_scan',
      systemStatus: 'healthy',
      issuesFound: Math.floor(Math.random() * 3),
      recommendations: 5,
      performance_score: Math.floor(Math.random() * 20) + 80, // 80-100
      duration: 12000
    };
  }

  // Check task dependencies
  private async checkTaskDependencies(task: MaintenanceTask): Promise<boolean> {
    if (task.dependencies.length === 0) return true;

    for (const dependencyId of task.dependencies) {
      const dependency = this.tasks.get(dependencyId);
      if (!dependency) {
        this.logger.warn(`⚠️ Dependency ${dependencyId} not found for task ${task.id}`);
        return false;
      }

      // Check if dependency completed recently (within 24 hours)
      if (!dependency.lastRun || 
          (Date.now() - dependency.lastRun.getTime()) > 24 * 60 * 60 * 1000) {
        this.logger.log(`⏳ Waiting for dependency ${dependencyId} completion`);
        return false;
      }

      if (dependency.status !== 'completed') {
        this.logger.log(`⏳ Waiting for dependency ${dependencyId} status: ${dependency.status}`);
        return false;
      }
    }

    return true;
  }

  // Check if task is within maintenance window
  private isWithinMaintenanceWindow(task: MaintenanceTask): boolean {
    if (!task.maintenanceWindow) return true;

    const window = this.getActiveMaintenanceWindow();
    if (!window) return false;

    return window.status === 'active' || window.status === 'scheduled';
  }

  // Get active maintenance window
  private getActiveMaintenanceWindow(): MaintenanceWindow | null {
    const now = new Date();
    
    for (const window of this.maintenanceWindows.values()) {
      if (now >= window.start && now <= window.end) {
        return window;
      }
    }
    
    return null;
  }

  // Monitor maintenance windows
  private async monitorMaintenanceWindows(): Promise<void> {
    const now = new Date();
    
    for (const window of this.maintenanceWindows.values()) {
      // Activate window if time reached
      if (now >= window.start && now <= window.end && window.status === 'scheduled') {
        window.status = 'active';
        this.activeMaintenanceWindow = window;
        
        this.isMaintenanceMode = true;
        
        // Send window activation notification
        await this.websocketService.sendToAdmins('maintenance:window_activated', {
          windowId: window.id,
          name: window.name,
          start: window.start,
          end: window.end,
          affectedServices: window.affectedServices,
          timestamp: now
        });
        
        this.logger.log(`🔧 Maintenance window activated: ${window.name}`);
      }
      
      // Deactivate window if time passed
      if (now > window.end && window.status === 'active') {
        window.status = 'completed';
        this.activeMaintenanceWindow = null;
        
        this.isMaintenanceMode = false;
        
        // Send window completion notification
        await this.websocketService.sendToAdmins('maintenance:window_completed', {
          windowId: window.id,
          name: window.name,
          end: window.end,
          duration: window.end.getTime() - window.start.getTime(),
          timestamp: now
        });
        
        this.logger.log(`✅ Maintenance window completed: ${window.name}`);
        
        // Schedule next occurrence if recurring
        this.scheduleNextWindow(window);
      }
    }
  }

  // Schedule next window occurrence
  private scheduleNextWindow(window: MaintenanceWindow): void {
    // For daily windows, schedule next day
    if (window.id === 'daily_window') {
      window.start = this.getNextDailyWindow(2, 0);
      window.end = this.getNextDailyWindow(6, 0);
    }
    // For weekly windows, schedule next week
    else if (window.id === 'weekly_window') {
      window.start = this.getNextWeeklyWindow(0, 2, 0);
      window.end = this.getNextWeeklyWindow(0, 8, 0);
    }
    // For monthly windows, schedule next month
    else if (window.id === 'monthly_security_window') {
      window.start = this.getNextMonthlyWindow(1, 1, 0);
      window.end = this.getNextMonthlyWindow(1, 5, 0);
    }
    
    window.status = 'scheduled';
    window.notificationSent = false;
    
    this.logger.log(`📅 Scheduled next maintenance window: ${window.name}`);
  }

  // Check pending tasks
  private async checkPendingTasks(): Promise<void> {
    const window = this.getActiveMaintenanceWindow();
    if (!window || window.status !== 'active') return;

    for (const task of this.tasks.values()) {
      if (task.enabled && task.status === 'idle') {
        // Check if task should run during this window
        if (this.shouldTaskRunNow(task, window)) {
          await this.executeMaintenanceTask(task.id);
        }
      }
    }
  }

  // Check if task should run now
  private shouldTaskRunNow(task: MaintenanceTask, window: MaintenanceWindow): boolean {
    if (!task.maintenanceWindow) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const taskStart = this.parseTime(task.maintenanceWindow.start);
    const taskEnd = this.parseTime(task.maintenanceWindow.end);

    return currentHour >= taskStart && currentHour < taskEnd;
  }

  // Parse HH:MM time format
  private parseTime(timeStr: string): number {
    const [hours] = timeStr.split(':').map(Number);
    return hours;
  }

  // Send notifications
  private async sendNotification(event: 'start' | 'complete' | 'failure', task: MaintenanceTask): Promise<void> {
    const message = this.getNotificationMessage(event, task);
    
    await this.websocketService.sendToAdmins(`maintenance:${event}`, {
      taskId: task.id,
      taskName: task.name,
      type: task.type,
      priority: task.priority,
      message,
      timestamp: new Date()
    });

    this.logger.log(`📧 Sent ${event} notification for task: ${task.name}`);
  }

  // Get notification message
  private getNotificationMessage(event: 'start' | 'complete' | 'failure', task: MaintenanceTask): string {
    switch (event) {
      case 'start':
        return `Started maintenance task: ${task.name}`;
      case 'complete':
        return `Completed maintenance task: ${task.name} (${task.duration}ms)`;
      case 'failure':
        return `Failed maintenance task: ${task.name} - ${task.error}`;
    }
  }

  // Generate maintenance report
  private async generateMaintenanceReport(): Promise<void> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get tasks executed in last 24 hours
    const recentExecutions = Array.from(this.executionHistory.values())
      .filter(exec => exec.startTime >= last24Hours);

    const report = {
      period: {
        start: last24Hours,
        end: now
      },
      summary: {
        totalTasks: this.tasks.size,
        enabledTasks: Array.from(this.tasks.values()).filter(t => t.enabled).length,
        tasksExecuted: recentExecutions.length,
        successfulTasks: recentExecutions.filter(e => e.status === 'success').length,
        failedTasks: recentExecutions.filter(e => e.status === 'failed').length,
        averageDuration: this.calculateAverageDuration(recentExecutions),
        totalMaintenanceTime: this.calculateTotalMaintenanceTime(recentExecutions)
      },
      activeMaintenance: this.isMaintenanceMode,
      nextScheduledTask: this.getNextScheduledTask(),
      maintenanceWindows: {
        active: this.maintenanceWindows.get(this.activeMaintenanceWindow?.id || ''),
        upcoming: this.getUpcomingWindows()
      },
      timestamp: now
    };

    // Send report to admins
    await this.websocketService.sendToAdmins('maintenance:hourly_report', report);
    
    this.logger.log('📊 Generated maintenance report');
  }

  // Utility methods
  private calculateAverageDuration(executions: any[]): number {
    const successfulExecutions = executions.filter(e => e.status === 'success' && e.duration);
    if (successfulExecutions.length === 0) return 0;
    
    const totalDuration = successfulExecutions.reduce((sum, e) => sum + e.duration, 0);
    return totalDuration / successfulExecutions.length;
  }

  private calculateTotalMaintenanceTime(executions: any[]): number {
    return executions.reduce((sum, e) => sum + (e.duration || 0), 0);
  }

  private getNextScheduledTask(): any {
    const now = new Date();
    const upcoming = Array.from(this.tasks.values())
      .filter(t => t.enabled && t.status === 'idle')
      .sort((a, b) => {
        const nextA = this.calculateNextRun(a.schedule, now);
        const nextB = this.calculateNextRun(b.schedule, now);
        return nextA.getTime() - nextB.getTime();
      })[0];

    if (upcoming) {
      return {
        taskId: upcoming.id,
        taskName: upcoming.name,
        nextRun: this.calculateNextRun(upcoming.schedule, now)
      };
    }

    return null;
  }

  private calculateNextRun(cronExpression: string, fromDate: Date): Date {
    // Simplified next run calculation - in real implementation, use cron-parser
    const next = new Date(fromDate.getTime() + 60 * 60 * 1000); // +1 hour placeholder
    return next;
  }

  private getUpcomingWindows(): MaintenanceWindow[] {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return Array.from(this.maintenanceWindows.values())
      .filter(w => w.start >= now && w.start <= next24Hours)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  // Date calculation helpers
  private getNextDailyWindow(hour: number, minute: number): Date {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  }

  private getNextWeeklyWindow(dayOfWeek: number, hour: number, minute: number): Date {
    const now = new Date();
    const next = new Date();
    next.setDate(now.getDate() + ((7 + dayOfWeek - now.getDay()) % 7));
    next.setHours(hour, minute, 0, 0);
    
    return next;
  }

  private getNextMonthlyWindow(dayOfMonth: number, hour: number, minute: number): Date {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth, hour, minute, 0, 0);
    
    return next;
  }

  // Public methods for external access
  public getMaintenanceTasks(): MaintenanceTask[] {
    return Array.from(this.tasks.values());
  }

  public createMaintenanceTask(taskData: any): MaintenanceTask {
    const task: MaintenanceTask = {
      id: this.generateTaskId(),
      ...taskData,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);
    
    this.logger.log(`Maintenance task created: ${task.id} - ${task.name}`);
    return task;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getMaintenanceWindows(): MaintenanceWindow[] {
    return Array.from(this.maintenanceWindows.values());
  }

  public getExecutionHistory(limit: number = 50): any[] {
    return Array.from(this.executionHistory.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  public isInMaintenanceMode(): boolean {
    return this.isMaintenanceMode;
  }

  public async enableTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = true;
      this.registerCronJob(task);
      this.logger.log(`✅ Enabled maintenance task: ${task.name}`);
    }
  }

  public async disableTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = false;
      
      try {
        const cronJob = this.schedulerRegistry.getCronJob(taskId);
        if (cronJob) {
          cronJob.stop();
          this.schedulerRegistry.deleteCronJob(taskId);
        }
      } catch (error) {
        this.logger.warn(`Failed to stop cron job for ${taskId}: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      this.logger.log(`⏸️ Disabled maintenance task: ${task.name}`);
    }
  }

  public async triggerTask(taskId: string): Promise<void> {
    await this.executeMaintenanceTask(taskId);
  }

  public getMaintenanceStatus(): any {
    return {
      isMaintenanceMode: this.isMaintenanceMode,
      activeWindow: this.activeMaintenanceWindow,
      totalTasks: this.tasks.size,
      enabledTasks: Array.from(this.tasks.values()).filter(t => t.enabled).length,
      runningTasks: Array.from(this.tasks.values()).filter(t => t.status === 'running').length,
      failedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'failed').length,
      timestamp: new Date()
    };
  }

  /**
   * Execute maintenance task manually (alias for triggerTask)
   * Used by admin controller for manual task execution
   */
  public async executeTask(taskId: string): Promise<void> {
    this.logger.log(`🔧 Manual task execution requested for task: ${taskId}`);
    await this.triggerTask(taskId);
  }
}