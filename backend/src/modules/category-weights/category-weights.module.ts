import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryWeightEntity } from './entities/category-weight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryWeightEntity])],
  exports: [TypeOrmModule],
})
export class CategoryWeightsModule {}