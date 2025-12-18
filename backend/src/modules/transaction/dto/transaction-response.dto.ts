import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  walletId?: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  fromCurrency: string;

  @ApiProperty()
  toCurrency: string;

  @ApiProperty()
  fromAmount: number;

  @ApiProperty()
  toAmount: number;

  @ApiProperty()
  fee?: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  referenceNumber?: string;

  @ApiProperty()
  stellarTransactionHash?: string;

  @ApiProperty()
  completedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
