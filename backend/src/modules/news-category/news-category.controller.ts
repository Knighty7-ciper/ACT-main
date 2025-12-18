import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NewsCategoryService } from './news-category.service';
import { CreateNewsCategoryDto } from './dto/create-news-category.dto';
import { UpdateNewsCategoryDto } from './dto/update-news-category.dto';
import { NewsCategoryResponseDto } from './dto/news-category-response.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('news-categories')
@Controller('news-categories')
export class NewsCategoryController {
  constructor(private readonly newsCategoryService: NewsCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all news categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async findAll(): Promise<any> { {
    return this.newsCategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category found', type: NewsCategoryResponseDto })
  async findOne(@Param('id') id: string): Promise<NewsCategoryResponseDto> {
    return this.newsCategoryService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create news category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created', type: NewsCategoryResponseDto })
  async create(@Body() createNewsCategoryDto: CreateNewsCategoryDto): Promise<NewsCategoryResponseDto> {
    return this.newsCategoryService.create(createNewsCategoryDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update news category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated', type: NewsCategoryResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateNewsCategoryDto: UpdateNewsCategoryDto,
  ): Promise<NewsCategoryResponseDto> {
    return this.newsCategoryService.update(id, updateNewsCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete news category (Admin only)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.newsCategoryService.remove(id);
  }
}
