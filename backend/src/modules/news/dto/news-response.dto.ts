import { ApiProperty } from '@nestjs/swagger';

export class NewsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  summary?: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  source?: string;

  @ApiProperty()
  sourceUrl?: string;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  publishedAt?: Date;
}
