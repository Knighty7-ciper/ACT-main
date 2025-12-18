/**
 * ARKHAM Phase 6: Performance Controller
 * Admin-only API endpoints for performance monitoring and optimization
 */

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RedisCacheService, CacheStats } from '../../services/redis-cache.service';
import { DatabaseOptimizationService } from '../../services/database-optimization.service';
import { PerformanceOptimizationService } from '../../services/performance-optimization.service';
import { PerformanceMonitorService } from '../../services/performance-monitor.service';

@Controller('performance')
export class PerformanceController {
  constructor(
    private readonly redisCache: RedisCacheService,
    private readonly dbOptimization: DatabaseOptimizationService,
    private readonly performanceOptimization: PerformanceOptimizationService,
    private readonly performanceMonitor: PerformanceMonitorService,
  ) {}

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================

  /**
   * Get cache statistics and health
   */
  @Get('cache/stats')
  async getCacheStats(): Promise<{
    stats: CacheStats;
    config: Record<string, any>;
    health: boolean;
  }> {
    const stats = this.redisCache.getStats();
    const config = this.redisCache.getCacheConfig();
    const health = await this.redisCache.healthCheck();

    return {
      stats,
      config,
      health
    };
  }

  /**
   * Get cached data for specific key
   */
  @Get('cache/key/:key')
  async getCacheKey(@Param('key') key: string, @Query('type') cacheType?: string): Promise<{
    key: string;
    value: any;
    cached: boolean;
    timestamp: Date;
  }> {
    const value = await this.redisCache.get(key, cacheType);
    
    return {
      key,
      value,
      cached: value !== null,
      timestamp: new Date()
    };
  }

  /**
   * Set cache value manually
   */
  @Post('cache/key')
  async setCacheKey(@Body() data: { key: string; value: any; type?: string; ttl?: number }): Promise<{
    success: boolean;
    key: string;
    message: string;
  }> {
    const success = await this.redisCache.set(data.key, data.value, data.type);
    
    return {
      success,
      key: data.key,
      message: success ? 'Cache value set successfully' : 'Failed to set cache value'
    };
  }

  /**
   * Delete cache key
   */
  @Delete('cache/key/:key')
  async deleteCacheKey(@Param('key') key: string, @Query('type') cacheType?: string): Promise<{
    success: boolean;
    key: string;
    message: string;
  }> {
    const success = await this.redisCache.delete(key, cacheType);
    
    return {
      success,
      key,
      message: success ? 'Cache key deleted successfully' : 'Cache key not found or deletion failed'
    };
  }

  /**
   * Flush cache
   */
  @Post('cache/flush')
  async flushCache(@Body() data: { pattern?: string }): Promise<{
    success: boolean;
    pattern?: string;
    message: string;
  }> {
    const success = await this.redisCache.flush(data.pattern);
    
    return {
      success,
      pattern: data.pattern,
      message: success ? 'Cache flushed successfully' : 'Cache flush failed'
    };
  }

  /**
   * Warm up cache
   */
  @Post('cache/warm-up')
  async warmUpCache(): Promise<{
    success: boolean;
    message: string;
    warmed: string[];
  }> {
    // Manually trigger cache warming by accessing high-priority data
    try {
      await this.redisCache.getAllCountries();
      await this.redisCache.getAllCurrencies();
      await this.redisCache.getACTPrice();
      
      const warmed = ['countries', 'currencies', 'act_price'];
      
      return {
        success: true,
        message: 'Cache warming completed',
        warmed
      };
    } catch (error) {
      return {
        success: false,
        message: `Cache warming failed: ${error.message}`,
        warmed: []
      };
    }
  }

  // =============================================================================
  // DATABASE OPTIMIZATION
  // =============================================================================

  /**
   * Get database health metrics
   */
  @Get('database/health')
  async getDatabaseHealth(): Promise<{
    health: any;
    timestamp: Date;
  }> {
    const health = await this.dbOptimization.getDatabaseHealth();
    
    return {
      health,
      timestamp: new Date()
    };
  }

  /**
   * Analyze specific query
   */
  @Post('database/analyze-query')
  async analyzeQuery(@Body() data: { query: string; parameters?: any[] }): Promise<{
    analysis: any;
    timestamp: Date;
  }> {
    const analysis = await this.dbOptimization.analyzeQuery(data.query, data.parameters);
    
    return {
      analysis,
      timestamp: new Date()
    };
  }

  /**
   * Get slow queries
   */
  @Get('database/slow-queries')
  async getSlowQueries(): Promise<{
    slowQueries: any[];
    timestamp: Date;
  }> {
    const slowQueries = await this.dbOptimization.identifySlowQueries();
    
    return {
      slowQueries,
      timestamp: new Date()
    };
  }

  /**
   * Get index usage statistics
   */
  @Get('database/index-usage')
  async getIndexUsage(): Promise<{
    indexUsage: any[];
    timestamp: Date;
  }> {
    const indexUsage = await this.dbOptimization.getIndexUsageStatistics();
    
    return {
      indexUsage,
      timestamp: new Date()
    };
  }

  /**
   * Identify missing indexes
   */
  @Get('database/missing-indexes')
  async getMissingIndexes(): Promise<{
    recommendations: any[];
    timestamp: Date;
  }> {
    const recommendations = await this.dbOptimization.identifyMissingIndexes();
    
    return {
      recommendations,
      timestamp: new Date()
    };
  }

  /**
   * Get comprehensive optimization analysis
   */
  @Get('database/optimization-analysis')
  async getOptimizationAnalysis(): Promise<{
    analysis: any;
    timestamp: Date;
  }> {
    const analysis = await this.dbOptimization.getOptimizationAnalysis();
    
    return {
      analysis,
      timestamp: new Date()
    };
  }

  /**
   * Execute optimization recommendation
   */
  @Post('database/execute-optimization')
  async executeOptimization(@Body() data: { recommendation: any }): Promise<{
    success: boolean;
    message: string;
    recommendation: any;
  }> {
    const success = await this.dbOptimization.executeRecommendation(data.recommendation);
    
    return {
      success,
      message: success ? 'Optimization executed successfully' : 'Failed to execute optimization',
      recommendation: data.recommendation
    };
  }

  // =============================================================================
  // PERFORMANCE OPTIMIZATION
  // =============================================================================

  /**
   * Get performance status
   */
  @Get('status')
  async getPerformanceStatus(): Promise<{
    status: any;
    timestamp: Date;
  }> {
    const status = await this.performanceOptimization.getPerformanceStatus();
    
    return {
      status,
      timestamp: new Date()
    };
  }

  /**
   * Run comprehensive optimization
   */
  @Post('optimize/comprehensive')
  async runComprehensiveOptimization(): Promise<{
    result: any;
    timestamp: Date;
  }> {
    const result = await this.performanceOptimization.runComprehensiveOptimization();
    
    return {
      result,
      timestamp: new Date()
    };
  }

  /**
   * Execute specific optimization plan
   */
  @Post('optimize/plan/:planId')
  async executeOptimizationPlan(@Param('planId') planId: string): Promise<{
    success: boolean;
    planId: string;
    message: string;
    timestamp: Date;
  }> {
    const success = await this.performanceOptimization.executeOptimizationPlan(planId);
    
    return {
      success,
      planId,
      message: success ? 'Optimization plan executed successfully' : 'Failed to execute optimization plan',
      timestamp: new Date()
    };
  }

  /**
   * Get optimization plans
   */
  @Get('optimization/plans')
  async getOptimizationPlans(): Promise<{
    plans: any[];
    timestamp: Date;
  }> {
    const plans = this.performanceOptimization.getOptimizationRecommendations();
    
    return {
      plans,
      timestamp: new Date()
    };
  }

  /**
   * Get performance benchmarks
   */
  @Get('benchmarks')
  async getPerformanceBenchmarks(@Query('limit') limit?: number): Promise<{
    benchmarks: any[];
    timestamp: Date;
  }> {
    const benchmarkLimit = limit ? Math.min(limit, 100) : 10;
    const benchmarks = this.performanceOptimization.getPerformanceBenchmarks(benchmarkLimit);
    
    return {
      benchmarks,
      timestamp: new Date()
    };
  }

  // =============================================================================
  // PERFORMANCE MONITORING
  // =============================================================================

  /**
   * Get current performance metrics
   */
  @Get('metrics/current')
  async getCurrentMetrics(): Promise<{
    metrics: any;
    timestamp: Date;
  }> {
    const metrics = this.performanceMonitor.getCurrentMetrics();
    
    return {
      metrics,
      timestamp: new Date()
    };
  }

  /**
   * Get active performance alerts
   */
  @Get('alerts')
  async getActiveAlerts(): Promise<{
    alerts: any[];
    timestamp: Date;
  }> {
    const alerts = this.performanceMonitor.getActiveAlerts();
    
    return {
      alerts,
      timestamp: new Date()
    };
  }

  /**
   * Get optimization recommendations from monitor
   */
  @Get('recommendations')
  async getOptimizationRecommendations(): Promise<{
    recommendations: any[];
    timestamp: Date;
  }> {
    const recommendations = this.performanceMonitor.getOptimizationRecommendations();
    
    return {
      recommendations,
      timestamp: new Date()
    };
  }

  /**
   * Resolve performance alert
   */
  @Put('alerts/:alertId/resolve')
  async resolveAlert(@Param('alertId') alertId: string): Promise<{
    success: boolean;
    alertId: string;
    message: string;
    timestamp: Date;
  }> {
    await this.performanceMonitor.resolveAlert(alertId);
    
    return {
      success: true,
      alertId,
      message: 'Alert resolved successfully',
      timestamp: new Date()
    };
  }

  /**
   * Start/stop performance monitoring
   */
  @Put('monitoring/:action')
  async toggleMonitoring(@Param('action') action: 'start' | 'stop'): Promise<{
    success: boolean;
    action: string;
    message: string;
    timestamp: Date;
  }> {
    if (action === 'start') {
      this.performanceMonitor.startMonitoring();
    } else if (action === 'stop') {
      this.performanceMonitor.stopMonitoring();
    } else {
      return {
        success: false,
        action,
        message: 'Invalid action. Use "start" or "stop"',
        timestamp: new Date()
      };
    }
    
    return {
      success: true,
      action,
      message: `Performance monitoring ${action}ed successfully`,
      timestamp: new Date()
    };
  }

  // =============================================================================
  // INTEGRATION ENDPOINTS
  // =============================================================================

  /**
   * Get complete performance overview
   */
  @Get('overview')
  async getPerformanceOverview(): Promise<{
    cache: any;
    database: any;
    optimization: any;
    monitoring: any;
    timestamp: Date;
  }> {
    const [cacheStats, dbHealth, optimizationStatus, currentMetrics] = await Promise.all([
      this.redisCache.getStats(),
      this.dbOptimization.getDatabaseHealth(),
      this.performanceOptimization.getPerformanceStatus(),
      this.performanceMonitor.getCurrentMetrics()
    ]);

    return {
      cache: {
        stats: cacheStats,
        health: await this.redisCache.healthCheck()
      },
      database: {
        health: dbHealth,
        slowQueries: await this.dbOptimization.identifySlowQueries(),
        indexUsage: await this.dbOptimization.getIndexUsageStatistics()
      },
      optimization: {
        status: optimizationStatus,
        plans: this.performanceOptimization.getOptimizationRecommendations()
      },
      monitoring: {
        metrics: currentMetrics,
        alerts: this.performanceMonitor.getActiveAlerts(),
        recommendations: this.performanceMonitor.getOptimizationRecommendations()
      },
      timestamp: new Date()
    };
  }

  /**
   * Run full performance analysis
   */
  @Post('analyze/full')
  async runFullAnalysis(): Promise<{
    analysis: any;
    recommendations: string[];
    timestamp: Date;
  }> {
    const [comprehensiveOptimization, dbAnalysis, cacheAnalysis] = await Promise.all([
      this.performanceOptimization.runComprehensiveOptimization(),
      this.dbOptimization.getOptimizationAnalysis(),
      Promise.resolve({
        hitRate: this.redisCache.getStats().hitRate,
        totalKeys: 'unknown',
        memoryUsage: 'unknown'
      })
    ]);

    const recommendations = [
      ...comprehensiveOptimization.recommendations,
      `Database cache hit ratio: ${dbAnalysis.health.cacheHitRatio}%`,
      `Redis cache hit ratio: ${cacheAnalysis.hitRate}%`,
      ...(dbAnalysis.slowQueries.length > 0 ? [`Found ${dbAnalysis.slowQueries.length} slow queries`] : [])
    ];

    return {
      analysis: {
        optimization: comprehensiveOptimization,
        database: dbAnalysis,
        cache: cacheAnalysis
      },
      recommendations,
      timestamp: new Date()
    };
  }
}