import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EconomicIndicatorEntity } from './entities/economic-indicator.entity';
import { CreateEconomicIndicatorDto } from './dto/create-economic-indicator.dto';
import { UpdateEconomicIndicatorDto } from './dto/update-economic-indicator.dto';
import { EconomicIndicatorResponseDto } from './dto/economic-indicator-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EconomicIndicatorService {
  constructor(
    @InjectRepository(EconomicIndicatorEntity)
    private indicatorRepository: Repository<EconomicIndicatorEntity>,
  ) {}

  async create(createEconomicIndicatorDto: CreateEconomicIndicatorDto): Promise<EconomicIndicatorResponseDto> {
    const indicator = this.indicatorRepository.create({
      id: uuidv4(),
      ...createEconomicIndicatorDto,
      releaseDate: createEconomicIndicatorDto.releaseDate
        ? new Date(createEconomicIndicatorDto.releaseDate)
        : undefined,
    });
    const saved = await this.indicatorRepository.save(indicator);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<{ data: EconomicIndicatorResponseDto[]; total: number }> {
    const [data, total] = await this.indicatorRepository.findAndCount({
      where: { isActive: true },
    });
    return { data: data.map((i) => this.toResponseDto(i)), total };
  }

  async findOne(id: string): Promise<EconomicIndicatorResponseDto> {
    const indicator = await this.indicatorRepository.findOne({ where: { id } });
    if (!indicator) {
      throw new NotFoundException('Economic indicator not found');
    }
    return this.toResponseDto(indicator);
  }

  async findByCountry(countryCode: string): Promise<{ data: EconomicIndicatorResponseDto[]; total: number }> {
    const data = await this.indicatorRepository.find({
      where: { countryCode, isActive: true },
    });
    return { data: data.map((i) => this.toResponseDto(i)), total: data.length };
  }

  async findByType(indicatorType: string): Promise<{ data: EconomicIndicatorResponseDto[]; total: number }> {
    const data = await this.indicatorRepository.find({
      where: { indicatorType, isActive: true },
    });
    return { data: data.map((i) => this.toResponseDto(i)), total: data.length };
  }

  async update(
    id: string,
    updateEconomicIndicatorDto: UpdateEconomicIndicatorDto,
  ): Promise<EconomicIndicatorResponseDto> {
    const indicator = await this.indicatorRepository.findOne({ where: { id } });
    if (!indicator) {
      throw new NotFoundException('Economic indicator not found');
    }

    if (updateEconomicIndicatorDto.releaseDate) {
      updateEconomicIndicatorDto.releaseDate = new Date(
        updateEconomicIndicatorDto.releaseDate,
      ) as any;
    }

    Object.assign(indicator, updateEconomicIndicatorDto);
    const updated = await this.indicatorRepository.save(indicator);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const indicator = await this.indicatorRepository.findOne({ where: { id } });
    if (!indicator) {
      throw new NotFoundException('Economic indicator not found');
    }
    await this.indicatorRepository.remove(indicator);
  }

  private toResponseDto(indicator: EconomicIndicatorEntity): EconomicIndicatorResponseDto {
    return {
      id: indicator.id,
      countryCode: indicator.countryCode,
      indicatorType: indicator.indicatorType,
      indicatorName: indicator.indicatorName,
      value: indicator.value,
      unit: indicator.unit,
      period: indicator.period,
      source: indicator.source,
      releaseDate: indicator.releaseDate,
      isActive: indicator.isActive,
      createdAt: indicator.createdAt,
      updatedAt: indicator.updatedAt,
    };
  }
}
