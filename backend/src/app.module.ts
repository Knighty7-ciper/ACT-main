import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeormConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { CountryModule } from './modules/country/country.module';
import { ExchangeRateModule } from './modules/exchange-rate/exchange-rate.module';
import { NewsModule } from './modules/news/news.module';
import { EconomicIndicatorModule } from './modules/economic-indicator/economic-indicator.module';
import { AdminModule } from './modules/admin/admin.module';
import { RoleModule } from './modules/role/role.module';
import { NewsCategoryModule } from './modules/news-category/news-category.module';

// PPP Calculation modules
import { PPPCalculationModule } from './modules/ppp-calculation/ppp-calculation.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductPricesModule } from './modules/product-prices/product-prices.module';
import { CountryWeightsModule } from './modules/country-weights/country-weights.module';
import { CategoryWeightsModule } from './modules/category-weights/category-weights.module';
import { ActPriceHistoryModule } from './modules/act-price-history/act-price-history.module';
import { ProductParityResultsModule } from './modules/product-parity-results/product-parity-results.module';
import { ACTStellarModule } from './modules/act-stellar/act-stellar.module';

// ARKHAM Phase 1: Real-Time Madness - WebSocket Module
import { WebSocketModule } from './modules/websocket/websocket.module';

// ARKHAM Phase 3: Analytics Madness - Fraud Detection Module
import { FraudDetectionModule } from './modules/fraud-detection/fraud-detection.module';

// ARKHAM Phase 4: Automation Madness - Automation Module
import { AutomationModule } from './modules/automation/automation.module';

// ARKHAM Phase 5: Security Madness - Security Module
import { SecurityModule } from './modules/security/security.module';

// ARKHAM Phase 6: Performance Madness - Performance Module
import { PerformanceModule } from './modules/performance/performance.module';

// ARKHAM Phase 7: Compliance Madness - Compliance Module
import { ComplianceModule } from './modules/compliance/compliance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '../.env', '../.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeormConfig,
    }),
    AuthModule,
    UserModule,
    WalletModule,
    TransactionModule,
    CurrencyModule,
    CountryModule,
    ExchangeRateModule,
    NewsModule,
    EconomicIndicatorModule,
    AdminModule,
    RoleModule,
    NewsCategoryModule,
    // PPP Calculation modules
    PPPCalculationModule,
    ProductsModule,
    ProductPricesModule,
    CountryWeightsModule,
    CategoryWeightsModule,
    ActPriceHistoryModule,
    ProductParityResultsModule,
    
    // ARKHAM Phase 1: Real-Time WebSocket Infrastructure
    WebSocketModule,
    ACTStellarModule,
    
    // ARKHAM Phase 3: Real Fraud Detection System
    FraudDetectionModule,
    
    // ARKHAM Phase 4: Automation Infrastructure
    AutomationModule,
    
    // ARKHAM Phase 5: Security Infrastructure
    SecurityModule,
    
    // ARKHAM Phase 6: Performance Infrastructure
    PerformanceModule,
    
    // ARKHAM Phase 7: Compliance Infrastructure
    ComplianceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
