import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsEntity } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsResponseDto } from './dto/news-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
  ) {}

  async create(createNewsDto: CreateNewsDto): Promise<NewsResponseDto> {
    const news = this.newsRepository.create({
      id: uuidv4(),
      ...createNewsDto,
      publishedAt: new Date(),
    });
    const saved = await this.newsRepository.save(news);
    return this.toResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.newsRepository.findAndCount({
      where: { isPublished: true },
      skip,
      take: limit,
      order: { publishedAt: 'DESC' },
    });
    return {
      data: data.map((n) => this.toResponseDto(n)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeatured(): Promise<NewsResponseDto[]> {
    const data = await this.newsRepository.find({
      where: { isPublished: true, isFeatured: true },
      take: 5,
      order: { publishedAt: 'DESC' },
    });
    return data.map((n) => this.toResponseDto(n));
  }

  async findByCategory(categoryId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.newsRepository.findAndCount({
      where: { categoryId, isPublished: true },
      skip,
      take: limit,
      order: { publishedAt: 'DESC' },
    });
    return {
      data: data.map((n) => this.toResponseDto(n)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<NewsResponseDto> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException('News not found');
    }
    news.viewCount += 1;
    await this.newsRepository.save(news);
    return this.toResponseDto(news);
  }

  async update(id: string, updateNewsDto: UpdateNewsDto): Promise<NewsResponseDto> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException('News not found');
    }

    Object.assign(news, updateNewsDto);
    const updated = await this.newsRepository.save(news);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException('News not found');
    }
    await this.newsRepository.remove(news);
  }

  private toResponseDto(news: NewsEntity): NewsResponseDto {
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      summary: news.summary,
      categoryId: news.categoryId,
      imageUrl: news.imageUrl,
      source: news.source,
      sourceUrl: news.sourceUrl,
      isPublished: news.isPublished,
      isFeatured: news.isFeatured,
      viewCount: news.viewCount,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
      publishedAt: news.publishedAt,
    };
  }
}
