import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @ApiProperty({ example: 'stellar', required: false })
  @IsOptional()
  @IsString()
  walletType?: string;

  @ApiProperty({ example: 'GBRPYHIL2CI3...' })
  @IsString()
  @IsNotEmpty()
  address: string;
}
