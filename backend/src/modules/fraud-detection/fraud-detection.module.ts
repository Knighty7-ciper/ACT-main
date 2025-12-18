import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudDetectionService } from './fraud-detection.service';
import { FraudDetectionController } from './fraud-detection.controller';
import { 
  FraudAlert,
  UserRiskProfile,
  TransactionRiskAnalysis,
  FraudPattern,
  TransactionMonitoringRule
} from './entities';
import { UserEntity } from '../user/entities/user.entity';
import { TransactionEntity } from '../transaction/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FraudAlert,
      UserRiskProfile,
      TransactionRiskAnalysis,
      FraudPattern,
      TransactionMonitoringRule,
      UserEntity,
      TransactionEntity
    ])
  ],
  providers: [FraudDetectionService],
  controllers: [FraudDetectionController],
  exports: [FraudDetectionService],
})
export class FraudDetectionModule {}