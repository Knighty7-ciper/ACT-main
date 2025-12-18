import { IsString, IsOptional, IsUUID, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({ example: 'Market Update: Dollar Strengthens' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Full article content here...' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'Brief summary of the news', required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ example: 'category-uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 'Reuters', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ example: 'https://reuters.com/article', required: false })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
