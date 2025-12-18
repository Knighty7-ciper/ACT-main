import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryWeightEntity } from './entities/country-weight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CountryWeightEntity])],
  exports: [TypeOrmModule],
})
export class CountryWeightsModule {}