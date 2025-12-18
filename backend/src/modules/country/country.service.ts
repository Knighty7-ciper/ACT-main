import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryEntity } from './entities/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryResponseDto } from './dto/country-response.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(CountryEntity)
    private countryRepository: Repository<CountryEntity>,
  ) {}

  async create(createCountryDto: CreateCountryDto): Promise<CountryResponseDto> {
    const existing = await this.countryRepository.findOne({
      where: { code: createCountryDto.code },
    });
    if (existing) {
      throw new ConflictException('Country code already exists');
    }

    const country = this.countryRepository.create(createCountryDto);
    const saved = await this.countryRepository.save(country);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<{ data: CountryResponseDto[]; total: number }> {
    const [data, total] = await this.countryRepository.findAndCount({
      where: { isActive: true },
    });
    return { data: data.map((c) => this.toResponseDto(c)), total };
  }

  async findOne(code: string): Promise<CountryResponseDto> {
    const country = await this.countryRepository.findOne({ where: { code } });
    if (!country) {
      throw new NotFoundException('Country not found');
    }
    return this.toResponseDto(country);
  }

  async findByRegion(region: string): Promise<{ data: CountryResponseDto[]; total: number }> {
    const data = await this.countryRepository.find({ where: { region, isActive: true } });
    return { data: data.map((c) => this.toResponseDto(c)), total: data.length };
  }

  async update(code: string, updateCountryDto: UpdateCountryDto): Promise<CountryResponseDto> {
    const country = await this.countryRepository.findOne({ where: { code } });
    if (!country) {
      throw new NotFoundException('Country not found');
    }

    Object.assign(country, updateCountryDto);
    const updated = await this.countryRepository.save(country);
    return this.toResponseDto(updated);
  }

  async remove(code: string): Promise<void> {
    const country = await this.countryRepository.findOne({ where: { code } });
    if (!country) {
      throw new NotFoundException('Country not found');
    }
    await this.countryRepository.remove(country);
  }

  private toResponseDto(country: CountryEntity): CountryResponseDto {
    return {
      code: country.code,
      name: country.name,
      region: country.region,
      subregion: country.subregion,
      currencyCode: country.currencyCode,
      phoneCode: country.phoneCode,
      isActive: country.isActive,
      createdAt: country.createdAt,
      updatedAt: country.updatedAt,
    };
  }
}
