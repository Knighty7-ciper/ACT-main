import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Core Services
import { AMLTransactionMonitorService } from '../../services/aml-transaction-monitor.service';
import { RegulatoryReportingService } from '../../services/regulatory-reporting.service';
import { KYCVerificationService } from '../../services/kyc-verification.service';
import { ComplianceAuditService } from '../../services/compliance-audit.service';

// Controllers
import { ComplianceController } from './compliance.controller';

// Entities
import { UserEntity } from '../user/entities/user.entity';
import { WalletEntity } from '../wallet/entities/wallet.entity';
import { TransactionEntity } from '../transaction/entities/transaction.entity';
import { ComplianceAlertEntity } from '../../entities/compliance-alert.entity';
import { ComplianceEventEntity } from '../../entities/compliance-event.entity';
import { ComplianceReportEntity } from '../../entities/compliance-report.entity';
import { KYCDocumentEntity } from '../../entities/kyc-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core Entities
      UserEntity,
      WalletEntity,
      TransactionEntity,
      
      // Compliance Entities
      ComplianceAlertEntity,
      ComplianceEventEntity,
      ComplianceReportEntity,
      KYCDocumentEntity,
    ]),
  ],
  controllers: [ComplianceController],
  providers: [
    AMLTransactionMonitorService,
    RegulatoryReportingService,
    KYCVerificationService,
    ComplianceAuditService,
  ],
  exports: [
    AMLTransactionMonitorService,
    RegulatoryReportingService,
    KYCVerificationService,
    ComplianceAuditService,
  ],
})
export class ComplianceModule {}