import { ApiProperty } from '@nestjs/swagger';

export class ExchangeRateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fromCurrency: string;

  @ApiProperty()
  toCurrency: string;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  bid?: number;

  @ApiProperty()
  ask?: number;

  @ApiProperty()
  source?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
