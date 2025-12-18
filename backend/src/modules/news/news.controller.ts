import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsResponseDto } from './dto/news-response.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published news' })
  @ApiResponse({ status: 200, description: 'News retrieved' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.newsService.findAll(page, limit);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured news' })
  @ApiResponse({ status: 200, description: 'Featured news retrieved', type: [NewsResponseDto] })
  async findFeatured(): Promise<NewsResponseDto[]> {
    return this.newsService.findFeatured();
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get news by category' })
  @ApiResponse({ status: 200, description: 'News retrieved' })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.newsService.findByCategory(categoryId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get news by ID' })
  @ApiResponse({ status: 200, description: 'News found', type: NewsResponseDto })
  async findOne(@Param('id') id: string): Promise<NewsResponseDto> {
    return this.newsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create news (Admin only)' })
  @ApiResponse({ status: 201, description: 'News created', type: NewsResponseDto })
  async create(@Body() createNewsDto: CreateNewsDto): Promise<NewsResponseDto> {
    return this.newsService.create(createNewsDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update news (Admin only)' })
  @ApiResponse({ status: 200, description: 'News updated', type: NewsResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
  ): Promise<NewsResponseDto> {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete news (Admin only)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.newsService.remove(id);
  }
}
