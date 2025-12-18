import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ACTPriceHistoryEntity } from './entities/act-price-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ACTPriceHistoryEntity])],
  exports: [TypeOrmModule],
})
export class ActPriceHistoryModule {}