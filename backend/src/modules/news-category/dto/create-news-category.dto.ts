import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsCategoryDto {
  @ApiProperty({ example: 'market-updates' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Market Updates' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Latest market news and updates', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'chart', required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}
