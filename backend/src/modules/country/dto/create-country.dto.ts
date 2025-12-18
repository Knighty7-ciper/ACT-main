import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({ example: 'US' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Americas', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 'Northern America', required: false })
  @IsOptional()
  @IsString()
  subregion?: string;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiProperty({ example: '+1', required: false })
  @IsOptional()
  @IsString()
  phoneCode?: string;
}
