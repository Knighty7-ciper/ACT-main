/**
 * ARKHAM Phase 6: Performance Module
 * Integrates Redis Cache, Database Optimization, Performance Monitor, and Optimization services
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheService } from '../../services/redis-cache.service';
import { DatabaseOptimizationService } from '../../services/database-optimization.service';
import { PerformanceOptimizationService } from '../../services/performance-optimization.service';
import { PerformanceController } from './performance.controller';
import { UserEntity } from '../user/entities/user.entity';
import { WalletEntity } from '../wallet/entities/wallet.entity';
import { TransactionEntity } from '../transaction/entities/transaction.entity';
import { ExchangeRateEntity } from '../exchange-rate/entities/exchange-rate.entity';
import { ACTPriceHistoryEntity } from '../act-price-history/entities/act-price-history.entity';
import { CountryEntity } from '../country/entities/country.entity';
import { CurrencyEntity } from '../currency/entities/currency.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { ProductPriceEntity } from '../product-prices/entities/product-price.entity';
import { EconomicIndicatorEntity } from '../economic-indicator/entities/economic-indicator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      WalletEntity,
      TransactionEntity,
      ExchangeRateEntity,
      ACTPriceHistoryEntity,
      CountryEntity,
      CurrencyEntity,
      ProductEntity,
      ProductPriceEntity,
      EconomicIndicatorEntity,
    ]),
  ],
  controllers: [PerformanceController],
  providers: [
    RedisCacheService,
    DatabaseOptimizationService,
    PerformanceOptimizationService,
  ],
  exports: [
    RedisCacheService,
    DatabaseOptimizationService,
    PerformanceOptimizationService,
  ],
})
export class PerformanceModule {}