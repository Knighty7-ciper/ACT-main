/**
 * ARKHAM Phase 4: Automation Module
 * Integrates all automation services with the existing system
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { SystemAutomationService } from './services/system-automation.service';
import { PerformanceMonitorService } from './services/performance-monitor.service';
import { MaintenanceSchedulerService } from './services/maintenance-scheduler.service';
import { SelfHealingSystemService } from './services/self-healing-system.service';

import { AutomationController } from './automation.controller';

// Import entities for automation services
import { SystemHealthEntity } from '../../entities/system-health.entity';
import { PerformanceMetricEntity } from '../../entities/performance-metric.entity';
import { TransactionEntity } from '../transaction/entities/transaction.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemHealthEntity,
      PerformanceMetricEntity,
      TransactionEntity,
      UserEntity,
    ]),
    ScheduleModule.forRoot()
  ],
  controllers: [AutomationController],
  providers: [
    SystemAutomationService,
    PerformanceMonitorService,
    MaintenanceSchedulerService,
    SelfHealingSystemService
  ],
  exports: [
    SystemAutomationService,
    PerformanceMonitorService,
    MaintenanceSchedulerService,
    SelfHealingSystemService
  ]
})
export class AutomationModule {}