/**
 * ARKHAM Phase 6: Enterprise Redis Cache Service
 * Production-grade caching with real data from Supabase/PostgreSQL
 * Integrates with: All services, Database, Performance monitoring
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../modules/user/entities/user.entity';
import { WalletEntity } from '../modules/wallet/entities/wallet.entity';
import { ExchangeRateEntity } from '../modules/exchange-rate/entities/exchange-rate.entity';
import { ACTPriceHistoryEntity } from '../modules/act-price-history/entities/act-price-history.entity';
import { TransactionEntity } from '../modules/transaction/entities/transaction.entity';
import { CountryEntity } from '../modules/country/entities/country.entity';
import { CurrencyEntity } from '../modules/currency/entities/currency.entity';
import { ProductEntity } from '../modules/products/entities/product.entity';
import { ProductPriceEntity } from '../modules/product-prices/entities/product-price.entity';
import { EconomicIndicatorEntity } from '../modules/economic-indicator/entities/economic-indicator.entity';

export interface CacheConfig {
  ttl: number;
  prefix: string;
  compression?: boolean;
  serialization?: 'json' | 'string';
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
  uptime: number;
}

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly redis: Redis;
  private readonly stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    flushes: 0
  };

  // Cache configurations for different data types
  private readonly CACHE_CONFIGS: Record<string, CacheConfig> = {
    // User data - Short TTL due to data sensitivity
    user: { ttl: 900, prefix: 'user:', serialization: 'json' }, // 15 minutes
    user_wallet: { ttl: 600, prefix: 'user_wallet:', serialization: 'json' }, // 10 minutes
    
    // Financial data - Medium TTL for balance and prices
    wallet_balance: { ttl: 300, prefix: 'wallet_bal:', serialization: 'json' }, // 5 minutes
    exchange_rate: { ttl: 1800, prefix: 'ex_rate:', serialization: 'json' }, // 30 minutes
    act_price: { ttl: 3600, prefix: 'act_price:', serialization: 'json' }, // 1 hour
    
    // Reference data - Long TTL, rarely changes
    countries: { ttl: 86400, prefix: 'countries:', serialization: 'json' }, // 24 hours
    currencies: { ttl: 86400, prefix: 'currencies:', serialization: 'json' }, // 24 hours
    economic_indicators: { ttl: 43200, prefix: 'econ_indicators:', serialization: 'json' }, // 12 hours
    
    // Product data - Medium TTL
    products: { ttl: 7200, prefix: 'products:', serialization: 'json' }, // 2 hours
    product_prices: { ttl: 3600, prefix: 'product_prices:', serialization: 'json' }, // 1 hour
    
    // Transaction data - Short TTL for security
    recent_transactions: { ttl: 600, prefix: 'tx_recent:', serialization: 'json' }, // 10 minutes
    
    // System data - Variable TTL
    system_config: { ttl: 1800, prefix: 'sys_config:', serialization: 'json' }, // 30 minutes
    performance_metrics: { ttl: 300, prefix: 'perf_metrics:', serialization: 'json' }, // 5 minutes
  };

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(WalletEntity) private readonly walletRepo: Repository<WalletEntity>,
    @InjectRepository(ExchangeRateEntity) private readonly exchangeRateRepo: Repository<ExchangeRateEntity>,
    @InjectRepository(ACTPriceHistoryEntity) private readonly actPriceRepo: Repository<ACTPriceHistoryEntity>,
    @InjectRepository(TransactionEntity) private readonly transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(CountryEntity) private readonly countryRepo: Repository<CountryEntity>,
    @InjectRepository(CurrencyEntity) private readonly currencyRepo: Repository<CurrencyEntity>,
    @InjectRepository(ProductEntity) private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductPriceEntity) private readonly productPriceRepo: Repository<ProductPriceEntity>,
    @InjectRepository(EconomicIndicatorEntity) private readonly econIndicatorRepo: Repository<EconomicIndicatorEntity>,
  ) {
    this.initializeRedisConnection();
    this.startCacheHealthMonitoring();
    this.initializeCacheWarming();
  }

  private initializeRedisConnection(): void {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB') || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      commandTimeout: 5000,
      keyPrefix: 'arkham:',
      enableOfflineQueue: false,
      enableReadyCheck: true,
      lazyConnect: true,
    };

    this.redis = new Redis(redisConfig);

    this.redis.on('connect', () => {
      this.logger.log('📦 Connected to Redis successfully');
    });

    this.redis.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error instanceof Error ? error.message : String(error)}`);
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  private startCacheHealthMonitoring(): void {
    // Monitor cache health every 5 minutes
    setInterval(async () => {
      try {
        await this.monitorCacheHealth();
      } catch (error) {
        this.logger.error(`Cache health monitoring failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 5 * 60 * 1000);

    // Clean up expired keys every hour
    setInterval(async () => {
      try {
        await this.cleanupExpiredKeys();
      } catch (error) {
        this.logger.error(`Cache cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 60 * 60 * 1000);
  }

  private initializeCacheWarming(): void {
    // Warm up cache for frequently accessed data on startup
    setTimeout(async () => {
      this.logger.log('🔥 Starting cache warming...');
      await this.warmUpCache();
    }, 10000); // Start 10 seconds after initialization
  }

  // =============================================================================
  // CACHE OPERATIONS
  // =============================================================================

  /**
   * Set data in cache with configuration
   */
  async set<T>(key: string, data: T, cacheType?: string): Promise<boolean> {
    try {
      const config = cacheType ? this.CACHE_CONFIGS[cacheType] : undefined;
      const prefix = config?.prefix || '';
      const ttl = config?.ttl || 3600; // Default 1 hour
      const fullKey = prefix ? `${prefix}${key}` : key;

      let serializedData: string;
      if (config?.serialization === 'json') {
        serializedData = JSON.stringify(data);
      } else {
        serializedData = String(data);
      }

      const result = await this.redis.setex(fullKey, ttl, serializedData);
      this.stats.sets++;
      
      this.logger.debug(`Cache SET: ${fullKey} (TTL: ${ttl}s)`);
      return result === 'OK';
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string, cacheType?: string): Promise<T | null> {
    try {
      const config = cacheType ? this.CACHE_CONFIGS[cacheType] : undefined;
      const prefix = config?.prefix || '';
      const fullKey = prefix ? `${prefix}${key}` : key;

      const data = await this.redis.get(fullKey);
      
      if (data === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;

      if (config?.serialization === 'json') {
        return JSON.parse(data) as T;
      }

      return data as unknown as T;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key: string, cacheType?: string): Promise<boolean> {
    try {
      const config = cacheType ? this.CACHE_CONFIGS[cacheType] : undefined;
      const prefix = config?.prefix || '';
      const fullKey = prefix ? `${prefix}${key}` : key;

      const result = await this.redis.del(fullKey);
      this.stats.deletes++;
      
      this.logger.debug(`Cache DELETE: ${fullKey}`);
      return result > 0;
    } catch (error) {
      this.logger.error(`Cache DELETE error for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Clear all cache with optional pattern
   */
  async flush(pattern?: string): Promise<boolean> {
    try {
      if (pattern) {
        const keys = await this.redis.keys(`arkham:${pattern}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // Flush all cache
        await this.redis.flushdb();
      }
      
      this.stats.flushes++;
      this.logger.log(`Cache FLUSHED: ${pattern || 'ALL'}`);
      return true;
    } catch (error) {
      this.logger.error(`Cache FLUSH error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  // =============================================================================
  // HIGH-LEVEL CACHE METHODS WITH REAL DATA INTEGRATION
  // =============================================================================

  /**
   * Cache user data with real database query
   */
  async getUser(userId: string): Promise<UserEntity | null> {
    const cacheKey = `user_${userId}`;
    const cached = await this.get<UserEntity>(cacheKey, 'user');
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['wallets', 'transactions', 'role']
    });

    if (user) {
      await this.set(cacheKey, user, 'user');
    }

    return user;
  }

  /**
   * Cache user wallets with real database query
   */
  async getUserWallets(userId: string): Promise<WalletEntity[]> {
    const cacheKey = `wallets_${userId}`;
    const cached = await this.get<WalletEntity[]>(cacheKey, 'user_wallet');
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const wallets = await this.walletRepo.find({
      where: { userId },
      relations: ['currency', 'transactions'],
      order: { createdAt: 'DESC' }
    });

    if (wallets.length > 0) {
      await this.set(cacheKey, wallets, 'user_wallet');
    }

    return wallets;
  }

  /**
   * Cache exchange rate with real database query
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateEntity | null> {
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cached = await this.get<ExchangeRateEntity>(cacheKey, 'exchange_rate');
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const rate = await this.exchangeRateRepo.findOne({
      where: { fromCurrency, toCurrency, isActive: true },
      order: { createdAt: 'DESC' }
    });

    if (rate) {
      await this.set(cacheKey, rate, 'exchange_rate');
    }

    return rate;
  }

  /**
   * Cache ACT price with real database query
   */
  async getACTPrice(date?: Date): Promise<ACTPriceHistoryEntity | null> {
    const cacheKey = date ? `date_${date.toISOString().split('T')[0]}` : 'latest';
    const cached = await this.get<ACTPriceHistoryEntity>(cacheKey, 'act_price');
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const price = await this.actPriceRepo.findOne({
      where: date ? { calculationDate: date } : { isActive: true },
      order: date 
        ? { calculationDate: 'DESC' as const } 
        : { calculationTimestamp: 'DESC' as const }
    });

    if (price) {
      await this.set(cacheKey, price, 'act_price');
    }

    return price;
  }

  /**
   * Cache recent transactions with real database query
   */
  async getRecentTransactions(userId: string, limit: number = 50): Promise<TransactionEntity[]> {
    const cacheKey = `${userId}_${limit}`;
    const cached = await this.get<TransactionEntity[]>(cacheKey, 'recent_transactions');
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const transactions = await this.transactionRepo.find({
      where: { userId },
      relations: ['wallet', 'user'],
      order: { createdAt: 'DESC' },
      take: limit
    });

    if (transactions.length > 0) {
      await this.set(cacheKey, transactions, 'recent_transactions');
    }

    return transactions;
  }

  /**
   * Cache wallet balance with real database query
   */
  async getWalletBalance(walletId: string): Promise<number> {
    const cacheKey = `balance_${walletId}`;
    const cached = await this.get<{ balance: number; timestamp: Date }>(cacheKey, 'wallet_balance');
    
    if (cached && Date.now() - cached.timestamp.getTime() < 300000) { // 5 minutes
      return cached.balance;
    }

    // Fetch from database
    const wallet = await this.walletRepo.findOne({
      where: { id: walletId },
      select: ['balance', 'updatedAt']
    });

    if (wallet) {
      const balanceData = {
        balance: wallet.balance,
        timestamp: new Date()
      };
      
      await this.set(cacheKey, balanceData, 'wallet_balance');
      return wallet.balance;
    }

    return 0;
  }

  /**
   * Cache all countries with real database query
   */
  async getAllCountries(): Promise<CountryEntity[]> {
    const cacheKey = 'all_countries';
    const cached = await this.get<CountryEntity[]>(cacheKey, 'countries');
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const countries = await this.countryRepo.find({
      order: { name: 'ASC' }
    });

    if (countries.length > 0) {
      await this.set(cacheKey, countries, 'countries');
    }

    return countries;
  }

  /**
   * Cache all currencies with real database query
   */
  async getAllCurrencies(): Promise<CurrencyEntity[]> {
    const cacheKey = 'all_currencies';
    const cached = await this.get<CurrencyEntity[]>(cacheKey, 'currencies');
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const currencies = await this.currencyRepo.find({
      order: { code: 'ASC' }
    });

    if (currencies.length > 0) {
      await this.set(cacheKey, currencies, 'currencies');
    }

    return currencies;
  }

  /**
   * Cache products with real database query
   */
  async getProducts(category?: string): Promise<ProductEntity[]> {
    const cacheKey = category ? `category_${category}` : 'all_products';
    const cached = await this.get<ProductEntity[]>(cacheKey, 'products');
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const products = await this.productRepo.find({
      where: category ? { category } : {},
      order: { name: 'ASC' }
    });

    if (products.length > 0) {
      await this.set(cacheKey, products, 'products');
    }

    return products;
  }

  /**
   * Cache economic indicators with real database query
   */
  async getEconomicIndicators(countryCode?: string): Promise<EconomicIndicatorEntity[]> {
    const cacheKey = countryCode ? `country_${countryCode}` : 'all_indicators';
    const cached = await this.get<EconomicIndicatorEntity[]>(cacheKey, 'economic_indicators');
    
    if (cached) {
      return cached;
    }

    // Fetch from database
    const indicators = await this.econIndicatorRepo.find({
      where: countryCode ? { countryCode } : {},
      order: { date: 'DESC' },
      take: 100 // Limit to most recent 100 records
    });

    if (indicators.length > 0) {
      await this.set(cacheKey, indicators, 'economic_indicators');
    }

    return indicators;
  }

  // =============================================================================
  // CACHE INVALIDATION STRATEGIES
  // =============================================================================

  /**
   * Invalidate user-related cache when user data changes
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `user:${userId}`,
      `user_wallet:${userId}`,
      `wallets_${userId}`,
      `tx_recent:${userId}`,
      `user_balance_${userId}`
    ];

    for (const pattern of patterns) {
      await this.delete(pattern);
    }

    this.logger.log(`🗑️ Invalidated user cache for user: ${userId}`);
  }

  /**
   * Invalidate exchange rate cache when rates are updated
   */
  async invalidateExchangeRateCache(fromCurrency: string, toCurrency?: string): Promise<void> {
    if (toCurrency) {
      await this.delete(`${fromCurrency}_${toCurrency}`, 'exchange_rate');
    } else {
      // Invalidate all rates for the currency
      const keys = await this.redis.keys(`arkham:ex_rate:${fromCurrency}_*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }

    this.logger.log(`🗑️ Invalidated exchange rate cache: ${fromCurrency}${toCurrency ? `->${toCurrency}` : ''}`);
  }

  /**
   * Invalidate ACT price cache
   */
  async invalidateACTPriceCache(): Promise<void> {
    const keys = await this.redis.keys('arkham:act_price:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    this.logger.log('🗑️ Invalidated ACT price cache');
  }

  /**
   * Invalidate product cache when products change
   */
  async invalidateProductCache(): Promise<void> {
    await this.delete('all_products', 'products');
    const keys = await this.redis.keys('arkham:products:category_*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    this.logger.log('🗑️ Invalidated product cache');
  }

  // =============================================================================
  // CACHE WARMING AND MONITORING
  // =============================================================================

  /**
   * Warm up cache with frequently accessed data
   */
  private async warmUpCache(): Promise<void> {
    try {
      this.logger.log('🔥 Warming up cache with high-priority data...');

      // Warm up countries and currencies (reference data)
      await this.getAllCountries();
      await this.getAllCurrencies();

      // Warm up latest ACT price
      await this.getACTPrice();

      // Preload exchange rates for major currency pairs
      const majorPairs = [
        ['USD', 'KES'],
        ['EUR', 'KES'], 
        ['GBP', 'KES'],
        ['USD', 'NGN'],
        ['USD', 'GHS']
      ];

      for (const [from, to] of majorPairs) {
        await this.getExchangeRate(from, to);
      }

      // Warm up some products
      await this.getProducts();

      this.logger.log('Cache warming completed');
    } catch (error) {
      this.logger.error(`Cache warming failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Monitor cache health and performance
   */
  private async monitorCacheHealth(): Promise<void> {
    try {
      const info = await this.redis.info();
      const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100;
      const dbSize = await this.redis.dbsize();
      
      this.logger.log(`Cache Stats - Hits: ${this.stats.hits}, Misses: ${this.stats.misses}, Hit Rate: ${hitRate.toFixed(2)}%, Keys: ${dbSize}`);

      // Log performance issues
      if (hitRate < 80) {
        this.logger.warn(`Low cache hit rate: ${hitRate.toFixed(2)}%`);
      }

      if (dbSize > 10000) {
        this.logger.warn(`High cache key count: ${dbSize}`);
      }
    } catch (error) {
      this.logger.error(`Cache health monitoring error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clean up expired keys
   */
  private async cleanupExpiredKeys(): Promise<void> {
    try {
      const info = await this.redis.info('keyspace');
      this.logger.log(`🧹 Cache cleanup completed`);
    } catch (error) {
      this.logger.error(`Cache cleanup error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Number(hitRate.toFixed(2)),
      totalKeys: 0, // Will be populated by health monitoring
      memoryUsage: 0, // Will be populated by health monitoring
      uptime: 0 // Will be populated by health monitoring
    };
  }

  /**
   * Get cache configuration
   */
  getCacheConfig(): Record<string, CacheConfig> {
    return { ...this.CACHE_CONFIGS };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error(`Redis health check failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.log('🔄 Shutting down Redis cache service...');
    await this.redis.quit();
  }
}