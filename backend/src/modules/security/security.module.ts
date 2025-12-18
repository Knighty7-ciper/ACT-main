import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { EnterpriseSecurityService } from '../services/enterprise-security.service';
import { WafConfigService } from '../services/waf-config.service';
import { SecurityMonitoringService } from '../services/security-monitoring.service';
import { SecurityController } from './security.controller';
import { WebSocketModule } from '../websocket/websocket.module';

// Import entities
import { SecurityEventEntity } from '../../entities/security-event.entity';
import { ComplianceReportEntity } from '../../entities/compliance-report.entity';
import { UserEntity } from '../user/entities/user.entity';
import { TransactionEntity } from '../transaction/entities/transaction.entity';
import { SystemHealthEntity } from '../../entities/system-health.entity';
import { PerformanceMetricEntity } from '../../entities/performance-metric.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SecurityEventEntity,
      ComplianceReportEntity,
      UserEntity,
      TransactionEntity,
      SystemHealthEntity,
      PerformanceMetricEntity,
    ]),
    ScheduleModule.forRoot(),
    WebSocketModule
  ],
  providers: [
    EnterpriseSecurityService,
    WafConfigService,
    SecurityMonitoringService
  ],
  controllers: [SecurityController],
  exports: [
    EnterpriseSecurityService,
    WafConfigService,
    SecurityMonitoringService
  ]
})
export class SecurityModule {}