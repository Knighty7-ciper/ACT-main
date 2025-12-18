import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEconomicIndicatorDto {
  @ApiProperty({ example: 'US' })
  @IsString()
  countryCode: string;

  @ApiProperty({ example: 'gdp' })
  @IsString()
  indicatorType: string;

  @ApiProperty({ example: 'Gross Domestic Product' })
  @IsString()
  indicatorName: string;

  @ApiProperty({ example: 27360 })
  @IsNumber()
  value: number;

  @ApiProperty({ example: 'Billion USD', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 'Q4 2023', required: false })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiProperty({ example: 'World Bank', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;
}
