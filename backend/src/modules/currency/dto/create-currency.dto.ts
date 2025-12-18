import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'US Dollar' })
  @IsString()
  name: string;

  @ApiProperty({ example: '$' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 'US', required: false })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  decimalPlaces: number;
}
