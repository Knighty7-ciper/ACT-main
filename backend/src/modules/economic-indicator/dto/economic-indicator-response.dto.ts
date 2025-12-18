import { ApiProperty } from '@nestjs/swagger';

export class EconomicIndicatorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty()
  indicatorType: string;

  @ApiProperty()
  indicatorName: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  unit?: string;

  @ApiProperty()
  period?: string;

  @ApiProperty()
  source?: string;

  @ApiProperty()
  releaseDate?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
