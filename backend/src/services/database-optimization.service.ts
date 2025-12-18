/**
 * ARKHAM Phase 6: Database Optimization Service
 * Real PostgreSQL query analysis and performance optimization
 * Uses EXPLAIN, pg_stat_statements, and query performance metrics
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../modules/user/entities/user.entity';
import { WalletEntity } from '../modules/wallet/entities/wallet.entity';
import { TransactionEntity } from '../modules/transaction/entities/transaction.entity';
import { ExchangeRateEntity } from '../modules/exchange-rate/entities/exchange-rate.entity';

export interface QueryAnalysis {
  query: string;
  executionTime: number;
  planningTime: number;
  rowsReturned: number;
  sharedHitBlocks: number;
  sharedReadBlocks: number;
  localHitBlocks: number;
  localReadBlocks: number;
  tempReadBlocks: number;
  tempWrittenBlocks: number;
  plans: QueryPlanNode[];
  recommendations: OptimizationRecommendation[];
  indexUsage: IndexUsageInfo[];
  tableStats: TableStatistics[];
}

export interface QueryPlanNode {
  nodeType: string;
  planRows: number;
  planWidth: number;
  actualRows: number;
  actualLoops: number;
  startupCost: number;
  totalCost: number;
  parent?: string;
  children: QueryPlanNode[];
}

export interface OptimizationRecommendation {
  id: string;
  type: 'index' | 'query' | 'statistics' | 'partition' | 'connection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: number;
  sql?: string;
  table?: string;
  index?: string;
  parameters: Record<string, any>;
  timestamp: Date;
}

export interface IndexUsageInfo {
  indexName: string;
  tableName: string;
  indexSize: string;
  indexUsage: number;
  scans: number;
  tuplesRead: number;
  tuplesFetched: number;
}

export interface TableStatistics {
  tableName: string;
  tableSize: string;
  indexSize: string;
  totalSize: string;
  tupleCount: number;
  deadTupleCount: number;
  lastVacuum: Date | null;
  lastAnalyze: Date | null;
  nLiveTup: number;
  nDeadTup: number;
}

export interface DatabaseHealthMetrics {
  connectionCount: number;
  activeConnections: number;
  idleConnections: number;
  blockedQueries: number;
  cacheHitRatio: number;
  bufferHitRatio: number;
  checkpointSyncTime: number;
  checkpointAsyncTime: number;
  lockCount: number;
  deadLockCount: number;
}

export interface SlowQueryInfo {
  query: string;
  calls: number;
  totalTime: number;
  meanTime: number;
  minTime: number;
  maxTime: number;
  stddevTime: number;
  rows: number;
  sharedHitBlocks: number;
  sharedReadBlocks: number;
  localHitBlocks: number;
  localReadBlocks: number;
}

@Injectable()
export class DatabaseOptimizationService {
  private readonly logger = new Logger(DatabaseOptimizationService.name);
  private readonly queryRunner: QueryRunner;

  // Performance thresholds
  private readonly THRESHOLDS = {
    slowQuery: 1000, // milliseconds
    connectionUsage: 80, // percentage
    cacheHitRatio: 90, // percentage
    bufferHitRatio: 95, // percentage
    indexUsage: 80, // percentage
    tableSize: 1024 * 1024 * 1024 // 1GB in bytes
  };

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(WalletEntity) private readonly walletRepo: Repository<WalletEntity>,
    @InjectRepository(TransactionEntity) private readonly transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(ExchangeRateEntity) private readonly exchangeRateRepo: Repository<ExchangeRateEntity>,
  ) {
    this.queryRunner = new QueryRunner();
    this.initializeDatabaseOptimization();
  }

  private async initializeDatabaseOptimization(): Promise<void> {
    try {
      await this.queryRunner.connect();
      this.logger.log('✅ Database optimization service initialized');
      
      // Enable pg_stat_statements extension if not exists
      await this.enablePgStatStatements();
      
      // Start periodic optimization monitoring
      this.startOptimizationMonitoring();
      
    } catch (error: any) {
      this.logger.error(`Failed to initialize database optimization: ${error.message}`);
    }
  }

  private async enablePgStatStatements(): Promise<void> {
    try {
      // Check if extension exists
      const extensionExists = await this.queryRunner.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_extension 
          WHERE extname = 'pg_stat_statements'
        )
      `);

      if (!extensionExists[0].exists) {
        this.logger.log('Enabling pg_stat_statements extension...');
        await this.queryRunner.query('CREATE EXTENSION IF NOT EXISTS pg_stat_statements');
      }
    } catch (error: any) {
      this.logger.warn(`pg_stat_statements extension not available: ${error.message}`);
    }
  }

  private startOptimizationMonitoring(): void {
    // Monitor every 10 minutes
    setInterval(async () => {
      try {
        await this.monitorDatabaseHealth();
        await this.identifySlowQueries();
        await this.analyzeIndexUsage();
      } catch (error: any) {
        this.logger.error(`Optimization monitoring failed: ${error.message}`);
      }
    }, 10 * 60 * 1000);

    // Generate optimization report every hour
    setInterval(async () => {
      try {
        await this.generateOptimizationReport();
      } catch (error: any) {
        this.logger.error(`Optimization report generation failed: ${error.message}`);
      }
    }, 60 * 60 * 1000);
  }

  // =============================================================================
  // QUERY ANALYSIS
  // =============================================================================

  /**
   * Analyze query performance using EXPLAIN ANALYZE
   */
  async analyzeQuery(query: string, parameters?: any[]): Promise<QueryAnalysis> {
    try {
      this.logger.debug(`Analyzing query: ${query.substring(0, 100)}...`);

      // Enable timing and buffers for detailed analysis
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      
      const result = await this.queryRunner.query(explainQuery, parameters);
      const explainResult = result[0]['QUERY PLAN'][0];

      const plan = explainResult['Plan'];
      const totalTime = parseFloat(plan['Total Cost']);
      const planningTime = explainResult['Planning Time'];
      const executionTime = explainResult['Execution Time'];
      
      // Parse the query plan tree
      const plans = this.parseQueryPlan(plan);

      // Calculate recommendations based on plan analysis
      const recommendations = this.generateQueryRecommendations(plan, plans);

      // Get index usage information
      const indexUsage = await this.getIndexUsageForQuery(query);

      // Get table statistics
      const tableStats = await this.getTableStatistics(query);

      return {
        query: query.substring(0, 500), // Limit for logging
        executionTime,
        planningTime,
        rowsReturned: plan['Actual Rows'] || 0,
        sharedHitBlocks: plan['Shared Hit Blocks'] || 0,
        sharedReadBlocks: plan['Shared Read Blocks'] || 0,
        localHitBlocks: plan['Local Hit Blocks'] || 0,
        localReadBlocks: plan['Local Read Blocks'] || 0,
        tempReadBlocks: plan['Temp Read Blocks'] || 0,
        tempWrittenBlocks: plan['Temp Written Blocks'] || 0,
        plans,
        recommendations,
        indexUsage,
        tableStats
      };
    } catch (error: any) {
      this.logger.error(`Query analysis failed: ${error.message}`);
      throw new Error(`Failed to analyze query: ${error.message}`);
    }
  }

  /**
   * Analyze our actual service queries for optimization
   */
  async analyzeServiceQueries(): Promise<Record<string, QueryAnalysis>> {
    const analyses: Record<string, QueryAnalysis> = {};

    try {
      // User queries
      const userQuery = `
        SELECT u.*, w.*, t.* 
        FROM users u 
        LEFT JOIN wallets w ON u.id = w.user_id 
        LEFT JOIN transactions t ON u.id = t.user_id 
        WHERE u.id = $1
        ORDER BY t.created_at DESC
        LIMIT 10
      `;
      analyses.user_loading = await this.analyzeQuery(userQuery, ['550e8400-e29b-41d4-a716-446655440000']);

      // Exchange rate queries
      const exchangeQuery = `
        SELECT * FROM exchange_rates 
        WHERE from_currency = $1 AND to_currency = $2 
        AND is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      analyses.exchange_rate = await this.analyzeQuery(exchangeQuery, ['USD', 'KES']);

      // Wallet balance queries
      const walletQuery = `
        SELECT w.*, u.email, c.name as currency_name
        FROM wallets w
        JOIN users u ON w.user_id = u.id
        JOIN currencies c ON w.currency_code = c.code
        WHERE w.user_id = $1 AND w.is_active = true
        ORDER BY w.created_at DESC
      `;
      analyses.wallet_balances = await this.analyzeQuery(walletQuery, ['550e8400-e29b-41d4-a716-446655440000']);

      // Transaction history queries
      const transactionQuery = `
        SELECT t.*, w.address, u.email
        FROM transactions t
        JOIN wallets w ON t.wallet_id = w.id
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = $1
        ORDER BY t.created_at DESC
        LIMIT 50
      `;
      analyses.transaction_history = await this.analyzeQuery(transactionQuery, ['550e8400-e29b-41d4-a716-446655440000']);

      // ACT price history queries
      const actPriceQuery = `
        SELECT * FROM act_price_history 
        WHERE is_active = true 
        ORDER BY calculation_timestamp DESC 
        LIMIT 10
      `;
      analyses.act_price_history = await this.analyzeQuery(actPriceQuery);

      this.logger.log(`📊 Analyzed ${Object.keys(analyses).length} service queries`);
      return analyses;

    } catch (error: any) {
      this.logger.error(`Service query analysis failed: ${error.message}`);
      return analyses;
    }
  }

  /**
   * Parse PostgreSQL query plan tree
   */
  private parseQueryPlan(plan: any, parent?: string): QueryPlanNode[] {
    const node: QueryPlanNode = {
      nodeType: plan['Node Type'],
      planRows: plan['Plan Rows'],
      planWidth: plan['Plan Width'],
      actualRows: plan['Actual Rows'] || 0,
      actualLoops: plan['Actual Loops'] || 0,
      startupCost: plan['Startup Cost'],
      totalCost: plan['Total Cost'],
      parent,
      children: []
    };

    // Recursively parse child plans
    if (plan['Plans']) {
      node.children = plan['Plans'].flatMap((child: any) => 
        this.parseQueryPlan(child, node.nodeType)
      );
    }

    return [node];
  }

  // =============================================================================
  // RECOMMENDATIONS ENGINE
  // =============================================================================

  /**
   * Generate query optimization recommendations
   */
  private generateQueryRecommendations(plan: any, plans: QueryPlanNode[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Check for sequential scans
    const sequentialScans = plans.filter(p => p.nodeType === 'Seq Scan');
    if (sequentialScans.length > 0) {
      for (const scan of sequentialScans) {
        recommendations.push({
          id: `seq_scan_${Date.now()}`,
          type: 'index',
          priority: scan.actualRows > 1000 ? 'high' : 'medium',
          description: `Sequential scan detected returning ${scan.actualRows} rows`,
          impact: 'High cost sequential table scans can be optimized with indexes',
          effort: 'low',
          estimatedImprovement: 80,
          table: scan.parent || 'unknown',
          parameters: { nodeType: scan.nodeType, rows: scan.actualRows },
          timestamp: new Date()
        });
      }
    }

    // Check for hash joins
    const hashJoins = plans.filter(p => p.nodeType === 'Hash Join');
    if (hashJoins.length > 0) {
      for (const join of hashJoins) {
        if (join.actualRows > 10000) {
          recommendations.push({
            id: `hash_join_${Date.now()}`,
            type: 'query',
            priority: 'medium',
            description: `Hash join processing ${join.actualRows} rows`,
            impact: 'Consider nested loop or merge join for large datasets',
            effort: 'medium',
            estimatedImprovement: 30,
            parameters: { nodeType: join.nodeType, rows: join.actualRows },
            timestamp: new Date()
          });
        }
      }
    }

    // Check for large sorts
    const sortNodes = plans.filter(p => p.nodeType === 'Sort');
    for (const sort of sortNodes) {
      if (sort.actualRows > 50000) {
        recommendations.push({
          id: `large_sort_${Date.now()}`,
          type: 'query',
          priority: 'high',
          description: `Sort operation on ${sort.actualRows} rows`,
          impact: 'Large sorts can be optimized with indexes or reducing result set',
          effort: 'low',
          estimatedImprovement: 50,
          parameters: { nodeType: sort.nodeType, rows: sort.actualRows },
          timestamp: new Date()
        });
      }
    }

    return recommendations;
  }

  // =============================================================================
  // INDEX ANALYSIS
  // =============================================================================

  /**
   * Get index usage statistics
   */
  async getIndexUsageStatistics(): Promise<IndexUsageInfo[]> {
    try {
      const query = `
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch,
          pg_size_pretty(pg_relation_size(indexrelname::regclass)) as index_size,
          CASE 
            WHEN idx_scan = 0 THEN 0
            ELSE (idx_tup_fetch * 100.0 / idx_scan)
          END as usage_percentage
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
        LIMIT 50
      `;

      const results = await this.queryRunner.query(query);
      
      return results.map((row: any) => ({
        indexName: row.indexname,
        tableName: row.tablename,
        indexSize: row.index_size,
        indexUsage: Math.round(row.usage_percentage || 0),
        scans: row.idx_scan,
        tuplesRead: row.idx_tup_read,
        tuplesFetched: row.idx_tup_fetch
      }));
    } catch (error: any) {
      this.logger.error(`Failed to get index usage: ${error.message}`);
      return [];
    }
  }

  /**
   * Get index usage for specific query
   */
  private async getIndexUsageForQuery(query: string): Promise<IndexUsageInfo[]> {
    try {
      // Extract table names from query (simplified parsing)
      const tableMatches = query.match(/FROM\s+(\w+)/gi);
      if (!tableMatches) return [];

      const tables = tableMatches.map(match => 
        match.replace(/FROM\s+/gi, '').toLowerCase()
      );

      const queryString = `
        SELECT 
          indexname,
          tablename,
          pg_size_pretty(pg_relation_size(indexrelname::regclass)) as index_size,
          CASE 
            WHEN idx_scan = 0 THEN 0
            ELSE (idx_tup_fetch * 100.0 / idx_scan)
          END as usage_percentage
        FROM pg_stat_user_indexes
        WHERE tablename = ANY($1)
        ORDER BY idx_scan DESC
      `;

      const results = await this.queryRunner.query(queryString, [tables]);
      
      return results.map((row: any) => ({
        indexName: row.indexname,
        tableName: row.tablename,
        indexSize: row.index_size,
        indexUsage: Math.round(row.usage_percentage || 0),
        scans: row.idx_scan,
        tuplesRead: row.idx_tup_read,
        tuplesFetched: row.idx_tup_fetch
      }));
    } catch (error: any) {
      this.logger.error(`Failed to get query index usage: ${error.message}`);
      return [];
    }
  }

  /**
   * Identify missing indexes
   */
  async identifyMissingIndexes(): Promise<OptimizationRecommendation[]> {
    try {
      // Find columns that are frequently filtered but don't have indexes
      const query = `
        SELECT 
          schemaname,
          tablename,
          attname as column_name,
          n_distinct,
          correlation,
          most_common_vals,
          n_tup_ins,
          n_tup_upd,
          n_tup_del
        FROM pg_stats
        WHERE schemaname = 'public'
        AND n_tup_ins > 1000  -- Only consider tables with significant data
        AND n_distinct > 10   -- Columns with good cardinality
        AND correlation < 0.5 -- Low correlation indicates random access patterns
        LIMIT 50
      `;

      const results = await this.queryRunner.query(query);
      const recommendations: OptimizationRecommendation[] = [];

      for (const stat of results) {
        if (stat.most_common_vals) {
          recommendations.push({
            id: `missing_index_${stat.tablename}_${stat.column_name}`,
            type: 'index',
            priority: 'medium',
            description: `Consider indexing ${stat.tablename}.${stat.column_name}`,
            impact: 'Will speed up WHERE clause filtering and JOIN operations',
            effort: 'low',
            estimatedImprovement: 40,
            table: stat.tablename,
            sql: `CREATE INDEX idx_${stat.tablename}_${stat.column_name} ON ${stat.tablename} (${stat.column_name});`,
            parameters: {
              columnName: stat.column_name,
              nDistinct: stat.n_distinct,
              correlation: stat.correlation
            },
            timestamp: new Date()
          });
        }
      }

      return recommendations;
    } catch (error: any) {
      this.logger.error(`Failed to identify missing indexes: ${error.message}`);
      return [];
    }
  }

  // =============================================================================
  // TABLE STATISTICS
  // =============================================================================

  /**
   * Get table statistics and sizes
   */
  async getTableStatistics(query?: string): Promise<TableStatistics[]> {
    try {
      let tableFilter = '';
      let parameters = [];

      if (query) {
        // Extract table names from query
        const tableMatches = query.match(/FROM\s+(\w+)/gi);
        if (tableMatches) {
          const tables = tableMatches.map(match => 
            match.replace(/FROM\s+/gi, '').toLowerCase()
          );
          tableFilter = `AND schemaname = 'public' AND relname = ANY($1)`;
          parameters = [tables];
        }
      }

      const queryString = `
        SELECT 
          schemaname,
          relname as table_name,
          n_live_tup as tuple_count,
          n_dead_tup as dead_tuple_count,
          last_vacuum,
          last_analyze,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) as total_size,
          pg_size_pretty(pg_relation_size(schemaname||'.'||relname)) as table_size,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname) - pg_relation_size(schemaname||'.'||relname)) as index_size
        FROM pg_stat_user_tables
        WHERE schemaname = 'public' ${tableFilter}
        ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC
        LIMIT 20
      `;

      const results = await this.queryRunner.query(queryString, parameters);
      
      return results.map((row: any) => ({
        tableName: row.table_name,
        tableSize: row.table_size,
        indexSize: row.index_size,
        totalSize: row.total_size,
        tupleCount: row.tuple_count,
        deadTupleCount: row.dead_tuple_count,
        lastVacuum: row.last_vacuum,
        lastAnalyze: row.last_analyze,
        nLiveTup: row.n_live_tup,
        nDeadTup: row.n_dead_tup
      }));
    } catch (error: any) {
      this.logger.error(`Failed to get table statistics: ${error.message}`);
      return [];
    }
  }

  // =============================================================================
  // HEALTH MONITORING
  // =============================================================================

  /**
   * Monitor database health metrics
   */
  async getDatabaseHealth(): Promise<DatabaseHealthMetrics> {
    try {
      const query = `
        SELECT 
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
          (SELECT count(*) FROM pg_stat_activity) as total_connections,
          (SELECT count(*) FROM pg_locks) as lock_count,
          (SELECT count(*) FROM pg_stat_activity WHERE waiting = true) as blocked_queries,
          (SELECT sum(CASE WHEN blks_hit > 0 THEN (blks_hit * 100.0 / (blks_hit + blks_read)) ELSE 0 END) / count(*) 
           FROM pg_stat_database) as cache_hit_ratio,
          (SELECT sum(blks_hit * 100.0 / (blks_hit + blks_read)) / count(*) 
           FROM pg_stat_database WHERE datname = current_database()) as buffer_hit_ratio,
          (SELECT checkpoint_sync_time FROM pg_stat_bgwriter) as checkpoint_sync_time,
          (SELECT checkpoint_write_time FROM pg_stat_bgwriter) as checkpoint_async_time,
          (SELECT conflicts FROM pg_stat_database) as dead_lock_count
      `;

      const result = await this.queryRunner.query(query);
      const row = result[0];

      return {
        connectionCount: row.total_connections,
        activeConnections: row.active_connections,
        idleConnections: row.idle_connections,
        blockedQueries: row.blocked_queries,
        cacheHitRatio: Math.round(row.cache_hit_ratio || 0),
        bufferHitRatio: Math.round(row.buffer_hit_ratio || 0),
        checkpointSyncTime: row.checkpoint_sync_time || 0,
        checkpointAsyncTime: row.checkpoint_async_time || 0,
        lockCount: row.lock_count,
        deadLockCount: row.dead_lock_count || 0
      };
    } catch (error: any) {
      this.logger.error(`Failed to get database health: ${error.message}`);
      return {
        connectionCount: 0,
        activeConnections: 0,
        idleConnections: 0,
        blockedQueries: 0,
        cacheHitRatio: 0,
        bufferHitRatio: 0,
        checkpointSyncTime: 0,
        checkpointAsyncTime: 0,
        lockCount: 0,
        deadLockCount: 0
      };
    }
  }

  /**
   * Identify slow queries from pg_stat_statements
   */
  async identifySlowQueries(): Promise<SlowQueryInfo[]> {
    try {
      const query = `
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          min_time,
          max_time,
          stddev_time,
          rows,
          shared_hit_blocks,
          shared_read_blocks,
          local_hit_blocks,
          local_read_blocks
        FROM pg_stat_statements
        WHERE mean_time > $1
        ORDER BY mean_time DESC
        LIMIT 20
      `;

      const results = await this.queryRunner.query(query, [this.THRESHOLDS.slowQuery / 1000]);
      
      return results.map((row: any) => ({
        query: row.query.substring(0, 200), // Limit for display
        calls: row.calls,
        totalTime: Math.round(row.total_time),
        meanTime: Math.round(row.mean_time * 100) / 100,
        minTime: Math.round(row.min_time * 100) / 100,
        maxTime: Math.round(row.max_time * 100) / 100,
        stddevTime: Math.round(row.stddev_time * 100) / 100,
        rows: row.rows,
        sharedHitBlocks: row.shared_hit_blocks,
        sharedReadBlocks: row.shared_read_blocks,
        localHitBlocks: row.local_hit_blocks,
        localReadBlocks: row.local_read_blocks
      }));
    } catch (error: any) {
      this.logger.error(`Failed to identify slow queries: ${error.message}`);
      return [];
    }
  }

  // =============================================================================
  // MONITORING AND REPORTING
  // =============================================================================

  private async monitorDatabaseHealth(): Promise<void> {
    try {
      const health = await this.getDatabaseHealth();
      
      // Log health metrics
      this.logger.log(`📊 DB Health - Connections: ${health.activeConnections}/${health.connectionCount}, Cache Hit: ${health.cacheHitRatio}%, Buffer Hit: ${health.bufferHitRatio}%`);

      // Generate alerts for health issues
      if (health.cacheHitRatio < this.THRESHOLDS.cacheHitRatio) {
        this.logger.warn(`⚠️ Low cache hit ratio: ${health.cacheHitRatio}%`);
      }

      if (health.blockedQueries > 0) {
        this.logger.warn(`⚠️ Blocked queries detected: ${health.blockedQueries}`);
      }

      if (health.lockCount > 100) {
        this.logger.warn(`⚠️ High lock count: ${health.lockCount}`);
      }
    } catch (error: any) {
      this.logger.error(`Database health monitoring failed: ${error.message}`);
    }
  }

  private async analyzeIndexUsage(): Promise<void> {
    try {
      const indexUsage = await this.getIndexUsageStatistics();
      const unusedIndexes = indexUsage.filter(idx => idx.scans === 0);
      
      if (unusedIndexes.length > 0) {
        this.logger.warn(`⚠️ Found ${unusedIndexes.length} unused indexes that could be removed`);
      }

      const lowUsageIndexes = indexUsage.filter(idx => idx.indexUsage < this.THRESHOLDS.indexUsage);
      if (lowUsageIndexes.length > 0) {
        this.logger.log(`📊 Found ${lowUsageIndexes.length} low-usage indexes`);
      }
    } catch (error: any) {
      this.logger.error(`Index usage analysis failed: ${error.message}`);
    }
  }

  private async generateOptimizationReport(): Promise<void> {
    try {
      this.logger.log('📈 Generating database optimization report...');

      // Get health metrics
      const health = await this.getDatabaseHealth();
      
      // Get slow queries
      const slowQueries = await this.identifySlowQueries();
      
      // Get index statistics
      const indexUsage = await this.getIndexUsageStatistics();
      
      // Get missing index recommendations
      const missingIndexes = await this.identifyMissingIndexes();

      // Generate summary
      const report = {
        timestamp: new Date(),
        health: health,
        slowQueries: slowQueries.length,
        unusedIndexes: indexUsage.filter(idx => idx.scans === 0).length,
        missingIndexes: missingIndexes.length,
        recommendations: [
          ...slowQueries.map(q => ({
            type: 'query',
            priority: q.meanTime > 2000 ? 'high' : 'medium',
            description: `Slow query (${q.meanTime}ms avg)`,
            impact: 'Query performance improvement',
            effort: 'medium',
            estimatedImprovement: 60
          })),
          ...missingIndexes
        ]
      };

      this.logger.log(`📊 Optimization Report - Health: ${health.cacheHitRatio}% cache hit, ${slowQueries.length} slow queries, ${missingIndexes.length} missing indexes`);
    } catch (error: any) {
      this.logger.error(`Optimization report generation failed: ${error.message}`);
    }
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get comprehensive optimization analysis
   */
  async getOptimizationAnalysis(): Promise<{
    health: DatabaseHealthMetrics;
    slowQueries: SlowQueryInfo[];
    indexUsage: IndexUsageInfo[];
    tableStats: TableStatistics[];
    recommendations: OptimizationRecommendation[];
    missingIndexes: OptimizationRecommendation[];
  }> {
    const [health, slowQueries, indexUsage, tableStats, missingIndexes] = await Promise.all([
      this.getDatabaseHealth(),
      this.identifySlowQueries(),
      this.getIndexUsageStatistics(),
      this.getTableStatistics(),
      this.identifyMissingIndexes()
    ]);

    return {
      health,
      slowQueries,
      indexUsage,
      tableStats,
      recommendations: [],
      missingIndexes
    };
  }

  /**
   * Analyze and optimize specific queries
   */
  async optimizeQueries(queries: string[]): Promise<QueryAnalysis[]> {
    const analyses: QueryAnalysis[] = [];
    
    for (const query of queries) {
      try {
        const analysis = await this.analyzeQuery(query);
        analyses.push(analysis);
      } catch (error: any) {
        this.logger.error(`Failed to optimize query: ${error.message}`);
      }
    }

    return analyses;
  }

  /**
   * Execute optimization recommendations
   */
  async executeRecommendation(recommendation: OptimizationRecommendation): Promise<boolean> {
    try {
      if (recommendation.sql) {
        await this.queryRunner.query(recommendation.sql);
        this.logger.log(`✅ Executed optimization: ${recommendation.description}`);
        return true;
      }
      return false;
    } catch (error: any) {
      this.logger.error(`Failed to execute recommendation: ${error.message}`);
      return false;
    }
  }

  /**
   * Shutdown optimization service
   */
  async shutdown(): Promise<void> {
    this.logger.log('🔄 Shutting down database optimization service...');
    await this.queryRunner.release();
  }
}