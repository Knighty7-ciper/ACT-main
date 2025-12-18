import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsCategoryEntity } from './entities/news-category.entity';
import { CreateNewsCategoryDto } from './dto/create-news-category.dto';
import { UpdateNewsCategoryDto } from './dto/update-news-category.dto';
import { NewsCategoryResponseDto } from './dto/news-category-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NewsCategoryService {
  constructor(
    @InjectRepository(NewsCategoryEntity)
    private categoryRepository: Repository<NewsCategoryEntity>,
  ) {}

  async create(createNewsCategoryDto: CreateNewsCategoryDto): Promise<NewsCategoryResponseDto> {
    const existing = await this.categoryRepository.findOne({
      where: { slug: createNewsCategoryDto.slug },
    });
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    const category = this.categoryRepository.create({
      id: uuidv4(),
      ...createNewsCategoryDto,
    });
    const saved = await this.categoryRepository.save(category);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<{ data: NewsCategoryResponseDto[]; total: number }> {
    const [data, total] = await this.categoryRepository.findAndCount({
      where: { isActive: true },
    });
    return { data: data.map((c) => this.toResponseDto(c)), total };
  }

  async findOne(id: string): Promise<NewsCategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.toResponseDto(category);
  }

  async update(
    id: string,
    updateNewsCategoryDto: UpdateNewsCategoryDto,
  ): Promise<NewsCategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, updateNewsCategoryDto);
    const updated = await this.categoryRepository.save(category);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.categoryRepository.remove(category);
  }

  private toResponseDto(category: NewsCategoryEntity): NewsCategoryResponseDto {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
