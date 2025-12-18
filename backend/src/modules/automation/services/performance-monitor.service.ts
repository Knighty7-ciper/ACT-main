import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceMetricEntity } from '../../../entities/performance-metric.entity';
import { SystemHealthEntity } from '../../../entities/system-health.entity';

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  current: number;
  status: 'good' | 'warning' | 'critical';
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceReport {
  period: string;
  averageResponseTime: number;
  peakResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  databasePerformance: number;
  uptime: number;
  totalRequests: number;
  errorRate: number;
}

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private alerts: PerformanceAlert[] = [];
  private thresholds: Map<string, { warning: number; critical: number }> = new Map();

  constructor(
    @InjectRepository(PerformanceMetricEntity)
    private performanceRepo: Repository<PerformanceMetricEntity>,
    @InjectRepository(SystemHealthEntity)
    private systemHealthRepo: Repository<SystemHealthEntity>,
  ) {
    this.initializeThresholds();
  }

  /**
   * Initialize performance thresholds
   */
  private initializeThresholds(): void {
    this.thresholds.set('responseTime', { warning: 1000, critical: 3000 });
    this.thresholds.set('memoryUsage', { warning: 70, critical: 90 });
    this.thresholds.set('cpuUsage', { warning: 60, critical: 85 });
    this.thresholds.set('databasePerformance', { warning: 500, critical: 1000 });
  }

  /**
   * Monitor current performance metrics
   */
  async monitorPerformance(): Promise<PerformanceThreshold[]> {
    try {
      const latestMetrics = await this.getLatestMetrics();
      if (!latestMetrics) {
        this.logger.warn('No performance metrics found');
        return [];
      }

      const thresholds = await Promise.all([
        this.checkResponseTimeThreshold(latestMetrics.responseTime),
        this.checkMemoryUsageThreshold(latestMetrics.memoryUsage),
        this.checkCPUUsageThreshold(latestMetrics.cpuUsage),
        this.checkDatabasePerformanceThreshold(latestMetrics.databasePerformance),
      ]);

      // Create alerts for threshold violations
      await this.createThresholdAlerts(thresholds);

      return thresholds;
    } catch (error) {
      this.logger.error('Performance monitoring failed:', error);
      throw error;
    }
  }

  /**
   * Get real-time performance dashboard data
   */
  async getRealTimeMetrics(): Promise<any> {
    try {
      const [
        latestMetrics,
        last5Minutes,
        last1Hour,
        last24Hours,
      ] = await Promise.all([
        this.getLatestMetrics(),
        this.getMetricsForPeriod(5), // 5 minutes
        this.getMetricsForPeriod(60), // 1 hour
        this.getMetricsForPeriod(1440), // 24 hours
      ]);

      return {
        current: latestMetrics,
        trends: {
          last5Minutes: this.calculateTrend(last5Minutes),
          last1Hour: this.calculateTrend(last1Hour),
          last24Hours: this.calculateTrend(last24Hours),
        },
        thresholds: this.getCurrentThresholds(),
        alerts: this.getActiveAlerts(),
      };
    } catch (error) {
      this.logger.error('Failed to get real-time metrics:', error);
      throw error;
    }
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(period: 'hour' | 'day' | 'week' | 'month'): Promise<PerformanceReport> {
    try {
      const startDate = this.getStartDateForPeriod(period);
      const endDate = new Date();

      const metrics = await this.performanceRepo.find({
        where: {
          timestamp: (date: any) => date >= startDate && date <= endDate,
        } as any,
        order: { timestamp: 'ASC' },
      });

      if (metrics.length === 0) {
        throw new Error('No performance data found for the specified period');
      }

      const report: PerformanceReport = {
        period,
        averageResponseTime: this.calculateAverage(metrics.map(m => m.responseTime)),
        peakResponseTime: Math.max(...metrics.map(m => m.responseTime)),
        memoryUsage: this.calculateAverage(metrics.map(m => m.memoryUsage)),
        cpuUsage: this.calculateAverage(metrics.map(m => m.cpuUsage)),
        databasePerformance: this.calculateAverage(metrics.map(m => m.databasePerformance)),
        uptime: this.calculateUptime(period),
        totalRequests: this.estimateTotalRequests(metrics),
        errorRate: this.calculateErrorRate(period),
      };

      return report;
    } catch (error) {
      this.logger.error('Failed to generate performance report:', error);
      throw error;
    }
  }

  /**
   * Set performance threshold for a metric
   */
  async setThreshold(metric: string, warning: number, critical: number): Promise<void> {
    this.thresholds.set(metric, { warning, critical });
    this.logger.log(`Threshold updated for ${metric}: warning=${warning}, critical=${critical}`);
  }

  /**
   * Get current thresholds
   */
  getCurrentThresholds(): any {
    const result: any = {};
    for (const [metric, threshold] of this.thresholds) {
      result[metric] = threshold;
    }
    return result;
  }

  /**
   * Get active performance alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve performance alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.logger.log(`Performance alert ${alertId} resolved: ${alert.metric}`);
    }
  }

  /**
   * Get performance history for charting
   */
  async getPerformanceHistory(
    metric: string,
    period: '1h' | '24h' | '7d' | '30d',
  ): Promise<{ timestamp: Date; value: number }[]> {
    try {
      const startDate = this.getStartDateForPeriod(period);
      
      let metrics: PerformanceMetricEntity[];
      if (metric === 'responseTime') {
        metrics = await this.performanceRepo.find({
          where: {
            timestamp: (date: any) => date >= startDate,
          } as any,
          order: { timestamp: 'ASC' },
        });
      } else if (metric === 'memoryUsage') {
        metrics = await this.performanceRepo.find({
          where: {
            timestamp: (date: any) => date >= startDate,
          } as any,
          order: { timestamp: 'ASC' },
        });
      } else if (metric === 'cpuUsage') {
        metrics = await this.performanceRepo.find({
          where: {
            timestamp: (date: any) => date >= startDate,
          } as any,
          order: { timestamp: 'ASC' },
        });
      } else if (metric === 'databasePerformance') {
        metrics = await this.performanceRepo.find({
          where: {
            timestamp: (date: any) => date >= startDate,
          } as any,
          order: { timestamp: 'ASC' },
        });
      } else {
        throw new Error(`Unknown metric: ${metric}`);
      }

      return metrics.map(m => ({
        timestamp: m.timestamp,
        value: this.getMetricValue(m, metric),
      }));
    } catch (error) {
      this.logger.error(`Failed to get performance history for ${metric}:`, error);
      throw error;
    }
  }

  /**
   * Check if system performance is healthy
   */
  async checkPerformanceHealth(): Promise<{ healthy: boolean; score: number; issues: string[] }> {
    try {
      const thresholds = await this.monitorPerformance();
      const issues: string[] = [];
      let totalScore = 0;

      for (const threshold of thresholds) {
        if (threshold.status === 'critical') {
          issues.push(`${threshold.metric} is critical (${threshold.current})`);
          totalScore += 20;
        } else if (threshold.status === 'warning') {
          issues.push(`${threshold.metric} is warning (${threshold.current})`);
          totalScore += 10;
        } else {
          totalScore += 5;
        }
      }

      const score = Math.min(100, (totalScore / (thresholds.length * 5)) * 100);
      const healthy = score >= 70 && issues.length === 0;

      return { healthy, score, issues };
    } catch (error) {
      this.logger.error('Performance health check failed:', error);
      return { healthy: false, score: 0, issues: ['Performance monitoring failed'] };
    }
  }

  // Private helper methods

  private async getLatestMetrics(): Promise<PerformanceMetricEntity | null> {
    return this.performanceRepo.findOne({
      order: { timestamp: 'DESC' },
    });
  }

  private async getMetricsForPeriod(minutes: number): Promise<PerformanceMetricEntity[]> {
    const startDate = new Date(Date.now() - minutes * 60 * 1000);
    return this.performanceRepo.find({
      where: {
        timestamp: (date: any) => date >= startDate,
      } as any,
      order: { timestamp: 'DESC' },
      take: 100, // Limit to prevent memory issues
    });
  }

  private calculateTrend(metrics: PerformanceMetricEntity[]): any {
    if (metrics.length < 2) return { direction: 'stable', change: 0 };

    const first = metrics[metrics.length - 1];
    const last = metrics[0];
    
    const responseTimeChange = last.responseTime - first.responseTime;
    const memoryChange = last.memoryUsage - first.memoryUsage;
    const cpuChange = last.cpuUsage - first.cpuUsage;

    return {
      responseTime: {
        direction: responseTimeChange > 0 ? 'increasing' : responseTimeChange < 0 ? 'decreasing' : 'stable',
        change: Math.abs(responseTimeChange),
      },
      memory: {
        direction: memoryChange > 0 ? 'increasing' : memoryChange < 0 ? 'decreasing' : 'stable',
        change: Math.abs(memoryChange),
      },
      cpu: {
        direction: cpuChange > 0 ? 'increasing' : cpuChange < 0 ? 'decreasing' : 'stable',
        change: Math.abs(cpuChange),
      },
    };
  }

  private async checkResponseTimeThreshold(value: number): Promise<PerformanceThreshold> {
    const threshold = this.thresholds.get('responseTime')!;
    let status: 'good' | 'warning' | 'critical' = 'good';

    if (value >= threshold.critical) status = 'critical';
    else if (value >= threshold.warning) status = 'warning';

    return {
      metric: 'responseTime',
      warning: threshold.warning,
      critical: threshold.critical,
      current: value,
      status,
    };
  }

  private async checkMemoryUsageThreshold(value: number): Promise<PerformanceThreshold> {
    const threshold = this.thresholds.get('memoryUsage')!;
    let status: 'good' | 'warning' | 'critical' = 'good';

    if (value >= threshold.critical) status = 'critical';
    else if (value >= threshold.warning) status = 'warning';

    return {
      metric: 'memoryUsage',
      warning: threshold.warning,
      critical: threshold.critical,
      current: value,
      status,
    };
  }

  private async checkCPUUsageThreshold(value: number): Promise<PerformanceThreshold> {
    const threshold = this.thresholds.get('cpuUsage')!;
    let status: 'good' | 'warning' | 'critical' = 'good';

    if (value >= threshold.critical) status = 'critical';
    else if (value >= threshold.warning) status = 'warning';

    return {
      metric: 'cpuUsage',
      warning: threshold.warning,
      critical: threshold.critical,
      current: value,
      status,
    };
  }

  private async checkDatabasePerformanceThreshold(value: number): Promise<PerformanceThreshold> {
    const threshold = this.thresholds.get('databasePerformance')!;
    let status: 'good' | 'warning' | 'critical' = 'good';

    if (value >= threshold.critical) status = 'critical';
    else if (value >= threshold.warning) status = 'warning';

    return {
      metric: 'databasePerformance',
      warning: threshold.warning,
      critical: threshold.critical,
      current: value,
      status,
    };
  }

  private async createThresholdAlerts(thresholds: PerformanceThreshold[]): Promise<void> {
    for (const threshold of thresholds) {
      if (threshold.status !== 'good') {
        await this.createAlert({
          metric: threshold.metric,
          value: threshold.current,
          threshold: threshold.status === 'critical' ? threshold.critical : threshold.warning,
          severity: threshold.status === 'critical' ? 'critical' : 'warning',
          message: `${threshold.metric} is ${threshold.status}: ${threshold.current}`,
          timestamp: new Date(),
          resolved: false,
        });
      }
    }
  }

  private async createAlert(alert: Omit<PerformanceAlert, 'id'>): Promise<void> {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: this.generateId(),
    };

    this.alerts.unshift(newAlert);

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000);
    }

    this.logger.warn(`Performance alert: ${alert.message}`);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateUptime(period: string): number {
    // Simplified uptime calculation
    return 99.9; // Placeholder
  }

  private estimateTotalRequests(metrics: PerformanceMetricEntity[]): number {
    // Estimate total requests based on performance metrics
    return metrics.length * 100; // Placeholder
  }

  private calculateErrorRate(period: string): number {
    // Simplified error rate calculation
    return 0.1; // Placeholder
  }

  private getStartDateForPeriod(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 60 * 60 * 1000);
    }
  }

  private getMetricValue(metric: PerformanceMetricEntity, metricName: string): number {
    switch (metricName) {
      case 'responseTime':
        return metric.responseTime;
      case 'memoryUsage':
        return metric.memoryUsage;
      case 'cpuUsage':
        return metric.cpuUsage;
      case 'databasePerformance':
        return metric.databasePerformance;
      default:
        return 0;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}