import { Module } from '@nestjs/common';
import { PPPCalculationService } from './ppp-calculation.service';
import { PPPCalculationController } from './ppp-calculation.controller';

// Import entity modules
import { ProductsModule } from '../products/products.module';
import { ProductPricesModule } from '../product-prices/product-prices.module';
import { CountryWeightsModule } from '../country-weights/country-weights.module';
import { CategoryWeightsModule } from '../category-weights/category-weights.module';
import { ActPriceHistoryModule } from '../act-price-history/act-price-history.module';
import { ProductParityResultsModule } from '../product-parity-results/product-parity-results.module';

// Also need existing modules
import { CurrencyModule } from '../currency/currency.module';
import { CountryModule } from '../country/country.module';

@Module({
  imports: [
    // New PPP modules
    ProductsModule,
    ProductPricesModule, 
    CountryWeightsModule,
    CategoryWeightsModule,
    ActPriceHistoryModule,
    ProductParityResultsModule,
    
    // Existing modules
    CurrencyModule,
    CountryModule,
  ],
  controllers: [PPPCalculationController],
  providers: [PPPCalculationService],
  exports: [PPPCalculationService],
})
export class PPPCalculationModule {}