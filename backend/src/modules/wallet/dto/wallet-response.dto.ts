import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  currencyCode: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  walletType: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  verifiedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
