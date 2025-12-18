import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductParityResultEntity } from './entities/product-parity-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductParityResultEntity])],
  exports: [TypeOrmModule],
})
export class ProductParityResultsModule {}