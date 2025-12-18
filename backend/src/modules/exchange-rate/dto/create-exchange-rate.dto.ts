import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExchangeRateDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  fromCurrency: string;

  @ApiProperty({ example: 'EUR' })
  @IsString()
  toCurrency: string;

  @ApiProperty({ example: 0.92 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiProperty({ example: 0.91, required: false })
  @IsOptional()
  @IsNumber()
  bid?: number;

  @ApiProperty({ example: 0.93, required: false })
  @IsOptional()
  @IsNumber()
  ask?: number;

  @ApiProperty({ example: 'alpha-vantage', required: false })
  @IsOptional()
  @IsString()
  source?: string;
}
