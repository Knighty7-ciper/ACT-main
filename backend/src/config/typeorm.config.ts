import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { WalletEntity } from '../../modules/wallet/entities/wallet.entity';
import { TransactionEntity } from '../../modules/transaction/entities/transaction.entity';
import { CurrencyEntity } from '../../modules/currency/entities/currency.entity';
import { CountryEntity } from '../../modules/country/entities/country.entity';
import { ExchangeRateEntity } from '../../modules/exchange-rate/entities/exchange-rate.entity';
import { NewsEntity } from '../../modules/news/entities/news.entity';
import { EconomicIndicatorEntity } from '../../modules/economic-indicator/entities/economic-indicator.entity';
import { AdminEntity } from '../../modules/admin/entities/admin.entity';
import { RoleEntity } from '../../modules/role/entities/role.entity';
import { NewsCategoryEntity } from '../../modules/news-category/entities/news-category.entity';

// ARKHAM Phase 7: Compliance Madness - Entities
import { ComplianceAlertEntity } from '../entities/compliance-alert.entity';
import { ComplianceEventEntity } from '../entities/compliance-event.entity';
import { KYCDocumentEntity } from '../entities/kyc-document.entity';
import { ComplianceReportEntity } from '../entities/compliance-report.entity';

// ARKHAM Phase 8: Admin Enhancement - User Request Entity
import { UserRequestEntity } from '../entities/user-request.entity';

// ARKHAM Phase 4: Automation Madness - System Entities
import { SystemHealthEntity } from '../entities/system-health.entity';
import { PerformanceMetricEntity } from '../entities/performance-metric.entity';

// ARKHAM Phase 9: Creative Admin Access - Admin Access Entity
import { AdminAccess } from '../entities/admin-access.entity';

export const typeormConfig = (
  configService?: ConfigService,
): TypeOrmModuleOptions => {
  const getConfig = (key: string, defaultValue?: string): string | undefined => 
    configService?.get(key) || process.env[key] || defaultValue;
  const entities = [
    UserEntity,
    WalletEntity,
    TransactionEntity,
    CurrencyEntity,
    CountryEntity,
    ExchangeRateEntity,
    NewsEntity,
    EconomicIndicatorEntity,
    AdminEntity,
    RoleEntity,
    NewsCategoryEntity,
    // ARKHAM Phase 7: Compliance Entities
    ComplianceAlertEntity,
    ComplianceEventEntity,
    KYCDocumentEntity,
    ComplianceReportEntity,
    // ARKHAM Phase 8: Admin Enhancement - User Request
    UserRequestEntity,
    // ARKHAM Phase 4: Automation Madness - System Entities
    SystemHealthEntity,
    PerformanceMetricEntity,
    // ARKHAM Phase 9: Creative Admin Access - Admin Access Entity
    AdminAccess,
  ];
  const common = {
    entities,
    synchronize: getConfig('NODE_ENV') === 'development',
    logging: getConfig('NODE_ENV') === 'development',
    dropSchema: false,
    ssl:
      getConfig('NODE_ENV') === 'production'
        ? { rejectUnauthorized: false }
        : false,
  } as Partial<TypeOrmModuleOptions>;

  const url =
    getConfig('DATABASE_URL') ||
    process.env.DATABASE_URL ||
    getConfig('POSTGRES_URL') ||
    process.env.POSTGRES_URL ||
    getConfig('POSTGRES_URL_NON_POOLING') ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (url) {
    try {
      const parsed = new URL(url);
      return {
        type: 'postgres',
        host: parsed.hostname,
        port: parsed.port ? Number(parsed.port) : 5432,
        username: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, ''),
        ssl: { rejectUnauthorized: false },
        extra: { ssl: { rejectUnauthorized: false } },
        ...common,
      } as TypeOrmModuleOptions;
    } catch {
      return {
        type: 'postgres',
        url,
        ssl: { rejectUnauthorized: false },
        extra: { ssl: { rejectUnauthorized: false } },
        ...common,
      } as TypeOrmModuleOptions;
    }
  }

  return {
    type: 'postgres',
    host: getConfig('DATABASE_HOST', 'localhost'),
    port: parseInt(getConfig('DATABASE_PORT', '5432') || '5432'),
    username: getConfig('DATABASE_USER', 'postgres'),
    password: getConfig('DATABASE_PASSWORD', 'postgres'),
    database: getConfig('DATABASE_NAME', 'african_currency'),
    ...common,
  } as TypeOrmModuleOptions;
};
