import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeRateService } from './exchange-rate.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('exchange-rates')
@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active exchange rates' })
  @ApiResponse({ status: 200, description: 'Exchange rates retrieved' })
  async findAll(): Promise<any> { {
    return this.exchangeRateService.findAll();
  }

  @Get('pair')
  @ApiOperation({ summary: 'Get exchange rate for currency pair' })
  @ApiResponse({ status: 200, description: 'Exchange rate found', type: ExchangeRateResponseDto })
  async findByPair(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<ExchangeRateResponseDto> {
    return this.exchangeRateService.findByCurrencyPair(from, to);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exchange rate by ID' })
  @ApiResponse({ status: 200, description: 'Exchange rate found', type: ExchangeRateResponseDto })
  async findOne(@Param('id') id: string): Promise<ExchangeRateResponseDto> {
    return this.exchangeRateService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create exchange rate (Admin only)' })
  @ApiResponse({ status: 201, description: 'Exchange rate created', type: ExchangeRateResponseDto })
  async create(@Body() createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRateResponseDto> {
    return this.exchangeRateService.create(createExchangeRateDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update exchange rate (Admin only)' })
  @ApiResponse({ status: 200, description: 'Exchange rate updated', type: ExchangeRateResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto,
  ): Promise<ExchangeRateResponseDto> {
    return this.exchangeRateService.update(id, updateExchangeRateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete exchange rate (Admin only)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.exchangeRateService.remove(id);
  }
}
