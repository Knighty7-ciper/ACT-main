import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EconomicIndicatorService } from './economic-indicator.service';
import { EconomicIndicatorController } from './economic-indicator.controller';
import { EconomicIndicatorEntity } from './entities/economic-indicator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EconomicIndicatorEntity])],
  controllers: [EconomicIndicatorController],
  providers: [EconomicIndicatorService],
  exports: [EconomicIndicatorService],
})
export class EconomicIndicatorModule {}
