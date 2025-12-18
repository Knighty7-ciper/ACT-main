import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PPPCalculationService, PPPCalculationInput } from './ppp-calculation.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('PPP Calculation')
@Controller('ppp-calculation')
export class PPPCalculationController {
  constructor(private readonly pppCalculationService: PPPCalculationService) {}

  @Post('calculate-act')
  @ApiOperation({ 
    summary: 'Calculate ACT value using PPP methodology',
    description: 'Calculates the African Currency Trade (ACT) value based on purchasing power parity across African markets'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'ACT value calculated successfully',
    schema: {
      type: 'object',
      properties: {
        actValue: { type: 'number', example: 1.2456 },
        breakdown: {
          type: 'object',
          properties: {
            staples: { type: 'number', example: 0.5601 },
            energy: { type: 'number', example: 0.3734 },
            telecom: { type: 'number', example: 0.1867 },
            transport: { type: 'number', example: 0.1245 }
          }
        },
        metadata: {
          type: 'object',
          properties: {
            totalProductsProcessed: { type: 'number', example: 25 },
            totalCountriesIncluded: { type: 'number', example: 20 },
            totalDataPoints: { type: 'number', example: 350 },
            calculationTimestamp: { type: 'string', example: '2025-10-27T03:03:30Z' }
          }
        }
      }
    }
  })
  async calculateACTValue(@Body() options: PPPCalculationInput) {
    return this.pppCalculationService.calculateACTValue(options);
  }

  @Get('latest-act')
  @ApiOperation({ 
    summary: 'Get latest ACT value',
    description: 'Retrieves the most recently calculated ACT value from the database'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Latest ACT value retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        actValue: { type: 'number', example: 1.2456 },
        breakdown: {
          type: 'object',
          properties: {
            staples: { type: 'number', example: 0.5601 },
            energy: { type: 'number', example: 0.3734 },
            telecom: { type: 'number', example: 0.1867 },
            transport: { type: 'number', example: 0.1245 }
          }
        },
        metadata: {
          type: 'object',
          properties: {
            totalProductsProcessed: { type: 'number', example: 25 },
            totalCountriesIncluded: { type: 'number', example: 20 },
            calculationTimestamp: { type: 'string', example: '2025-10-27T03:03:30Z' }
          }
        }
      }
    }
  })
  async getLatestACTValue(): Promise<any> {
    return this.pppCalculationService.getLatestACTValue();
  }

  @Post('convert-to-act')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Convert amount from local currency to ACT',
    description: 'Converts an amount from local currency to ACT using the latest PPP-based ACT value'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversion successful',
    schema: {
      type: 'object',
      properties: {
        originalAmount: { type: 'number', example: 1000 },
        originalCurrency: { type: 'string', example: 'NGN' },
        actAmount: { type: 'number', example: 0.6369 },
        actValue: { type: 'number', example: 1.2456 },
        exchangeRate: { type: 'number', example: 1570.0 }
      }
    }
  })
  async convertToACT(
    @Body() body: {
      amount: number;
      fromCurrency: string;
      actValue?: number;
    }
  ) {
    const { amount, fromCurrency, actValue: providedActValue } = body;
    
    // Get ACT value if not provided
    const actValue = providedActValue || (await this.pppCalculationService.getLatestACTValue())?.actValue;
    
    if (!actValue) {
      throw new Error('ACT value not available. Please calculate ACT value first.');
    }

    const actAmount = await this.pppCalculationService.convertToACT(amount, fromCurrency, actValue);
    const exchangeRate = await this.pppCalculationService.getUsdExchangeRate(fromCurrency);

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      actAmount,
      actValue,
      exchangeRate
    };
  }

  @Post('convert-from-act')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Convert amount from ACT to local currency',
    description: 'Converts an amount from ACT to local currency using the latest PPP-based ACT value'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversion successful',
    schema: {
      type: 'object',
      properties: {
        originalAmount: { type: 'number', example: 100 },
        originalCurrency: { type: 'string', example: 'ACT' },
        convertedAmount: { type: 'number', example: 157057.9 },
        targetCurrency: { type: 'string', example: 'NGN' },
        actValue: { type: 'number', example: 1.2456 },
        exchangeRate: { type: 'number', example: 1570.0 }
      }
    }
  })
  async convertFromACT(
    @Body() body: {
      actAmount: number;
      toCurrency: string;
      actValue?: number;
    }
  ) {
    const { actAmount, toCurrency, actValue: providedActValue } = body;
    
    // Get ACT value if not provided
    const actValue = providedActValue || (await this.pppCalculationService.getLatestACTValue())?.actValue;
    
    if (!actValue) {
      throw new Error('ACT value not available. Please calculate ACT value first.');
    }

    const convertedAmount = await this.pppCalculationService.convertFromACT(actAmount, toCurrency, actValue);
    const exchangeRate = await this.pppCalculationService.getUsdExchangeRate(toCurrency);

    return {
      originalAmount: actAmount,
      originalCurrency: 'ACT',
      convertedAmount,
      targetCurrency: toCurrency,
      actValue,
      exchangeRate
    };
  }

  @Get('methodology')
  @ApiOperation({ 
    summary: 'Get ACT calculation methodology',
    description: 'Returns information about the PPP-based ACT calculation methodology'
  })
  async getMethodology(): Promise<any> {
    return {
      name: 'African Currency Trade (ACT) Index',
      version: '1.0',
      description: 'USD-independent valuation model based on purchasing power parity across African markets',
      methodology: {
        approach: 'Purchasing Power Parity (PPP)',
        theoretical_framework: 'Absolute purchasing power parity and Law of One Price',
        data_collection: 'Real transaction prices from 20+ African countries',
        calculation_method: 'Weighted averages by product category and country',
        categories: {
          'Staples': '45% - Essential food items',
          'Energy': '30% - Fuel and energy products', 
          'Telecom': '15% - Communication services',
          'Transport': '10% - Transportation costs'
        },
        country_weights: 'Composite of GDP and population weights',
        update_frequency: 'Monthly with weekly volatility monitoring'
      },
      principles: [
        'USD Independence - Value derived from regional purchasing power',
        'Market-Based Pricing - Real transaction prices, not official rates',
        'Transparency - Open methodology and public data sources',
        'Stability - Weighted averages reduce individual country volatility',
        'Inclusivity - Representation across economic development levels'
      ],
      data_sources: [
        'National Statistics Offices - Official price indices',
        'Market Surveys - Pesa-Afric partner networks',
        'Regulatory Bodies - Energy prices, telecom tariffs',
        'Vendor APIs - Real-time merchant pricing'
      ]
    };
  }
}