import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'transfer' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  fromCurrency: string;

  @ApiProperty({ example: 'EUR' })
  @IsString()
  toCurrency: string;

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  @Min(0.01)
  fromAmount: number;

  @ApiProperty({ example: 85.25 })
  @IsNumber()
  @Min(0.01)
  toAmount: number;

  @ApiProperty({ example: 'wallet-uuid', required: false })
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiProperty({ example: 'Transfer to John', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
