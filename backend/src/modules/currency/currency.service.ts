import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from './entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyResponseDto } from './dto/currency-response.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
  ) {}

  async create(createCurrencyDto: CreateCurrencyDto): Promise<CurrencyResponseDto> {
    const existing = await this.currencyRepository.findOne({
      where: { code: createCurrencyDto.code },
    });
    if (existing) {
      throw new ConflictException('Currency code already exists');
    }

    const currency = this.currencyRepository.create(createCurrencyDto);
    const saved = await this.currencyRepository.save(currency);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<{ data: CurrencyResponseDto[]; total: number }> {
    const [data, total] = await this.currencyRepository.findAndCount({
      where: { isActive: true },
    });
    return { data: data.map((c) => this.toResponseDto(c)), total };
  }

  async findOne(code: string): Promise<CurrencyResponseDto> {
    const currency = await this.currencyRepository.findOne({ where: { code } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }
    return this.toResponseDto(currency);
  }

  async update(code: string, updateCurrencyDto: UpdateCurrencyDto): Promise<CurrencyResponseDto> {
    const currency = await this.currencyRepository.findOne({ where: { code } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    Object.assign(currency, updateCurrencyDto);
    const updated = await this.currencyRepository.save(currency);
    return this.toResponseDto(updated);
  }

  async remove(code: string): Promise<void> {
    const currency = await this.currencyRepository.findOne({ where: { code } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }
    await this.currencyRepository.remove(currency);
  }

  private toResponseDto(currency: CurrencyEntity): CurrencyResponseDto {
    return {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      countryCode: currency.countryCode,
      decimalPlaces: currency.decimalPlaces,
      isActive: currency.isActive,
      description: currency.description,
      createdAt: currency.createdAt,
      updatedAt: currency.updatedAt,
    };
  }
}
