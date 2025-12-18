import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPriceEntity } from './entities/product-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPriceEntity])],
  exports: [TypeOrmModule],
})
export class ProductPricesModule {}