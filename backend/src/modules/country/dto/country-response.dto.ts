import { ApiProperty } from '@nestjs/swagger';

export class CountryResponseDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  region?: string;

  @ApiProperty()
  subregion?: string;

  @ApiProperty()
  currencyCode?: string;

  @ApiProperty()
  phoneCode?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
