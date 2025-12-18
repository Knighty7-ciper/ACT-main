import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyResponseDto } from './dto/currency-response.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('currencies')
@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active currencies' })
  @ApiResponse({ status: 200, description: 'Currencies retrieved' })
  async findAll(): Promise<any> {
    return this.currencyService.findAll();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get currency by code' })
  @ApiResponse({ status: 200, description: 'Currency found', type: CurrencyResponseDto })
  async findOne(@Param('code') code: string): Promise<CurrencyResponseDto> {
    return this.currencyService.findOne(code);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create currency (Admin only)' })
  @ApiResponse({ status: 201, description: 'Currency created', type: CurrencyResponseDto })
  async create(@Body() createCurrencyDto: CreateCurrencyDto): Promise<CurrencyResponseDto> {
    return this.currencyService.create(createCurrencyDto);
  }

  @Put(':code')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update currency (Admin only)' })
  @ApiResponse({ status: 200, description: 'Currency updated', type: CurrencyResponseDto })
  async update(
    @Param('code') code: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<CurrencyResponseDto> {
    return this.currencyService.update(code, updateCurrencyDto);
  }

  @Delete(':code')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete currency (Admin only)' })
  async remove(@Param('code') code: string): Promise<void> {
    return this.currencyService.remove(code);
  }
}
