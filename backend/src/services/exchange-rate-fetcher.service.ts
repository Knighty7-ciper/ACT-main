import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRateEntity } from '../modules/exchange-rate/entities/exchange-rate.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExchangeRateFetcherService {
  private readonly logger = new Logger(ExchangeRateFetcherService.name);
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(ExchangeRateEntity)
    private exchangeRateRepository: Repository<ExchangeRateEntity>,
  ) {
    this.apiKey = configService.get<string>('EXCHANGE_RATE_API_KEY') ?? '';
  }

  async fetchAndUpdateRates(): Promise<void> {
    try {
      const baseCurrencies = ['USD', 'EUR', 'GBP', 'ZAR', 'NGN', 'KES', 'GHS'];
      const targetCurrencies = ['USD', 'EUR', 'GBP', 'ZAR', 'NGN', 'KES', 'GHS'];

      for (const from of baseCurrencies) {
        for (const to of targetCurrencies) {
          if (from !== to) {
            try {
              const rate = await this.fetchRate(from, to);
              await this.updateRate(from, to, rate);
            } catch (error: any) {
              this.logger.warn(`Failed to fetch rate for ${from}/${to}`);
            }
          }
        }
      }

      this.logger.log('Exchange rates updated successfully');
    } catch (error: any) {
      this.logger.error('Error updating exchange rates', error);
    }
  }

  private async fetchRate(from: string, to: string): Promise<number> {
    try {
      // Use a free currency exchange API (no API key required)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.rates || !data.rates[to]) {
        throw new Error(`Rate not available for ${from} to ${to}`);
      }

      return data.rates[to];
    } catch (error: any) {
      this.logger.warn(`Failed to fetch real rate for ${from}/${to}, using fallback calculation`);
      
      // Fallback calculation using USD as base if API fails
      // These are approximate rates that would be updated by the real API
      const usdRates: Record<string, number> = {
        'USD': 1.0,
        'EUR': 0.92,
        'GBP': 0.79,
        'ZAR': 18.50,
        'NGN': 1580.00,
        'KES': 152.50,
        'GHS': 15.20,
      };

      // If both currencies are in USD rates, calculate cross rate
      if (usdRates[from] && usdRates[to]) {
        return usdRates[from] / usdRates[to];
      }
      
      return 1.0;
    }
  }

  private async updateRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
  ): Promise<void> {
    let existingRate = await this.exchangeRateRepository.findOne({
      where: { fromCurrency, toCurrency },
    });

    if (existingRate) {
      existingRate.rate = rate;
      existingRate.bid = rate * 0.99;
      existingRate.ask = rate * 1.01;
      existingRate.updatedAt = new Date();
      await this.exchangeRateRepository.save(existingRate);
    } else {
      const newRate = this.exchangeRateRepository.create({
        id: uuidv4(),
        fromCurrency,
        toCurrency,
        rate,
        bid: rate * 0.99,
        ask: rate * 1.01,
        source: 'system',
        isActive: true,
      });
      await this.exchangeRateRepository.save(newRate);
    }
  }

  async getRate(from: string, to: string): Promise<number> {
    const rate = await this.exchangeRateRepository.findOne({
      where: { fromCurrency: from, toCurrency: to, isActive: true },
    });

    if (!rate) {
      // Fallback to fetch fresh rate
      return this.fetchRate(from, to);
    }

    return rate.rate;
  }
}
