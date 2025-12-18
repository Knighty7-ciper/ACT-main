import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryResponseDto } from './dto/country-response.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('countries')
@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({ status: 200, description: 'Countries retrieved' })
  async findAll(): Promise<any> {
    return this.countryService.findAll();
  }

  @Get('region/:region')
  @ApiOperation({ summary: 'Get countries by region' })
  @ApiResponse({ status: 200, description: 'Countries retrieved' })
  async findByRegion(@Param('region') region: string) {
    return this.countryService.findByRegion(region);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get country by code' })
  @ApiResponse({ status: 200, description: 'Country found', type: CountryResponseDto })
  async findOne(@Param('code') code: string): Promise<CountryResponseDto> {
    return this.countryService.findOne(code);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create country (Admin only)' })
  @ApiResponse({ status: 201, description: 'Country created', type: CountryResponseDto })
  async create(@Body() createCountryDto: CreateCountryDto): Promise<CountryResponseDto> {
    return this.countryService.create(createCountryDto);
  }

  @Put(':code')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update country (Admin only)' })
  @ApiResponse({ status: 200, description: 'Country updated', type: CountryResponseDto })
  async update(
    @Param('code') code: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ): Promise<CountryResponseDto> {
    return this.countryService.update(code, updateCountryDto);
  }

  @Delete(':code')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete country (Admin only)' })
  async remove(@Param('code') code: string): Promise<void> {
    return this.countryService.remove(code);
  }
}
