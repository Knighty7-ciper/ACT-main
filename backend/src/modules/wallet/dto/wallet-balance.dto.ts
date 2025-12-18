import { ApiProperty } from '@nestjs/swagger';

export class WalletBalanceDto {
  @ApiProperty()
  walletId: string;

  @ApiProperty()
  currencyCode: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  updatedAt: Date;
}
