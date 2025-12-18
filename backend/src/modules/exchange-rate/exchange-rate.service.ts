import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRateEntity } from './entities/exchange-rate.entity';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExchangeRateService {
  constructor(
    @InjectRepository(ExchangeRateEntity)
    private exchangeRateRepository: Repository<ExchangeRateEntity>,
  ) {}

  async create(createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRateResponseDto> {
    const rate = this.exchangeRateRepository.create({
      id: uuidv4(),
      ...createExchangeRateDto,
    });
    const saved = await this.exchangeRateRepository.save(rate);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<{ data: ExchangeRateResponseDto[]; total: number }> {
    const [data, total] = await this.exchangeRateRepository.findAndCount({
      where: { isActive: true },
    });
    return { data: data.map((r) => this.toResponseDto(r)), total };
  }

  async findOne(id: string): Promise<ExchangeRateResponseDto> {
    const rate = await this.exchangeRateRepository.findOne({ where: { id } });
    if (!rate) {
      throw new NotFoundException('Exchange rate not found');
    }
    return this.toResponseDto(rate);
  }

  async findByCurrencyPair(fromCurrency: string, toCurrency: string): Promise<ExchangeRateResponseDto> {
    const rate = await this.exchangeRateRepository.findOne({
      where: { fromCurrency, toCurrency, isActive: true },
    });
    if (!rate) {
      throw new NotFoundException('Exchange rate not found');
    }
    return this.toResponseDto(rate);
  }

  async update(
    id: string,
    updateExchangeRateDto: UpdateExchangeRateDto,
  ): Promise<ExchangeRateResponseDto> {
    const rate = await this.exchangeRateRepository.findOne({ where: { id } });
    if (!rate) {
      throw new NotFoundException('Exchange rate not found');
    }

    Object.assign(rate, updateExchangeRateDto);
    const updated = await this.exchangeRateRepository.save(rate);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const rate = await this.exchangeRateRepository.findOne({ where: { id } });
    if (!rate) {
      throw new NotFoundException('Exchange rate not found');
    }
    await this.exchangeRateRepository.remove(rate);
  }

  private toResponseDto(rate: ExchangeRateEntity): ExchangeRateResponseDto {
    return {
      id: rate.id,
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: rate.rate,
      bid: rate.bid,
      ask: rate.ask,
      source: rate.source,
      isActive: rate.isActive,
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
    };
  }
}
