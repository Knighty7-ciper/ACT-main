import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EconomicIndicatorService } from './economic-indicator.service';
import { CreateEconomicIndicatorDto } from './dto/create-economic-indicator.dto';
import { UpdateEconomicIndicatorDto } from './dto/update-economic-indicator.dto';
import { EconomicIndicatorResponseDto } from './dto/economic-indicator-response.dto';
import { JwtAuthGuard } from '../../shared/guards/auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('economic-indicators')
@Controller('economic-indicators')
export class EconomicIndicatorController {
  constructor(private readonly economicIndicatorService: EconomicIndicatorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all economic indicators' })
  @ApiResponse({ status: 200, description: 'Indicators retrieved' })
  async findAll(): Promise<any> { {
    return this.economicIndicatorService.findAll();
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Get indicators by country' })
  @ApiResponse({ status: 200, description: 'Indicators retrieved' })
  async findByCountry(@Param('countryCode') countryCode: string) {
    return this.economicIndicatorService.findByCountry(countryCode);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get indicators by type' })
  @ApiResponse({ status: 200, description: 'Indicators retrieved' })
  async findByType(@Param('type') type: string) {
    return this.economicIndicatorService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get indicator by ID' })
  @ApiResponse({ status: 200, description: 'Indicator found', type: EconomicIndicatorResponseDto })
  async findOne(@Param('id') id: string): Promise<EconomicIndicatorResponseDto> {
    return this.economicIndicatorService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create economic indicator (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Indicator created',
    type: EconomicIndicatorResponseDto,
  })
  async create(@Body() createEconomicIndicatorDto: CreateEconomicIndicatorDto): Promise<EconomicIndicatorResponseDto> {
    return this.economicIndicatorService.create(createEconomicIndicatorDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update economic indicator (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Indicator updated',
    type: EconomicIndicatorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateEconomicIndicatorDto: UpdateEconomicIndicatorDto,
  ): Promise<EconomicIndicatorResponseDto> {
    return this.economicIndicatorService.update(id, updateEconomicIndicatorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete economic indicator (Admin only)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.economicIndicatorService.remove(id);
  }
}
