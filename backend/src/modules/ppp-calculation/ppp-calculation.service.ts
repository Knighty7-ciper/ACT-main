import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { ProductPriceEntity } from '../product-prices/entities/product-price.entity';
import { CountryWeightEntity } from '../country-weights/entities/country-weight.entity';
import { CategoryWeightEntity } from '../category-weights/entities/category-weight.entity';
import { ACTPriceHistoryEntity } from '../act-price-history/entities/act-price-history.entity';
import { ProductParityResultEntity } from '../product-parity-results/entities/product-parity-result.entity';

export interface PPPCalculationInput {
  collectionDate?: Date;
  inflationAdjustment?: number;
  includeOutliers?: boolean;
  minCountryCoverage?: number;
}

export interface PPPCalculationResult {
  actValue: number;
  breakdown: {
    staples: number;
    energy: number;
    telecom: number;
    transport: number;
  };
  metadata: {
    totalProductsProcessed: number;
    totalCountriesIncluded: number;
    totalDataPoints: number;
    averagePriceVariance: number;
    dataCompletenessScore: number;
    calculationTimestamp: Date;
  };
  productParityResults: Array<{
    productCode: string;
    productName: string;
    category: string;
    weightedAvgUsd: number;
    simpleAvgUsd: number;
    countriesIncluded: number;
    dataPoints: number;
    qualityScore: number;
  }>;
}

@Injectable()
export class PPPCalculationService {
  private readonly logger = new Logger(PPPCalculationService.name);

  // Category weights from ACT methodology
  private readonly CATEGORY_WEIGHTS: Record<string, number> = {
    'Staples': 0.45,
    'Energy': 0.30,
    'Telecom': 0.15,
    'Transport': 0.10
  };

  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    
    @InjectRepository(ProductPriceEntity)
    private productPriceRepository: Repository<ProductPriceEntity>,
    
    @InjectRepository(CountryWeightEntity)
    private countryWeightRepository: Repository<CountryWeightEntity>,
    
    @InjectRepository(CategoryWeightEntity)
    private categoryWeightRepository: Repository<CategoryWeightEntity>,
    
    @InjectRepository(ACTPriceHistoryEntity)
    private actPriceHistoryRepository: Repository<ACTPriceHistoryEntity>,
    
    @InjectRepository(ProductParityResultEntity)
    private productParityResultRepository: Repository<ProductParityResultEntity>,
  ) {}

  /**
   * Calculate ACT value using PPP methodology from research
   * Based on African Currency Trade Index calculation
   */
  async calculateACTValue(options: PPPCalculationInput = {}): Promise<PPPCalculationResult> {
    this.logger.log('Starting ACT PPP calculation...');

    const {
      collectionDate = new Date(),
      inflationAdjustment = 1.0,
      includeOutliers = false,
      minCountryCoverage = 3
    } = options;

    try {
      // Step 1: Load required data
      const [products, countryWeights, categoryWeights] = await Promise.all([
        this.getActiveProducts(),
        this.getActiveCountryWeights(),
        this.getActiveCategoryWeights()
      ]);

      this.logger.log(`Loaded ${products.length} products, ${countryWeights.length} countries, ${categoryWeights.length} categories`);

      // Step 2: Get product prices for the collection date
      const productPrices = await this.getProductPricesByDate(collectionDate, includeOutliers);
      
      // Step 3: Calculate product parity for each product
      const parityResults = await this.calculateProductParity(products, productPrices, countryWeights);
      
      // Step 4: Filter products with sufficient country coverage
      const validParityResults = parityResults.filter(result => 
        result.countriesIncluded >= minCountryCoverage
      );

      // Step 5: Aggregate by category
      const categoryAggregations = this.aggregateByCategory(validParityResults, categoryWeights);
      
      // Step 6: Calculate final ACT value
      const actValue = this.calculateFinalACTValue(categoryAggregations, inflationAdjustment);
      
      // Step 7: Save results to database
      const calculationResult = await this.saveCalculationResults(
        actValue,
        categoryAggregations,
        validParityResults,
        collectionDate
      );

      this.logger.log(`ACT calculation completed: $${actValue.toFixed(4)} USD`);

      return {
        actValue,
        breakdown: {
          staples: categoryAggregations.Staples || 0,
          energy: categoryAggregations.Energy || 0,
          telecom: categoryAggregations.Telecom || 0,
          transport: categoryAggregations.Transport || 0,
        },
        metadata: {
          totalProductsProcessed: validParityResults.length,
          totalCountriesIncluded: countryWeights.length,
          totalDataPoints: productPrices.length,
          averagePriceVariance: this.calculateAverageVariance(validParityResults),
          dataCompletenessScore: this.calculateDataCompleteness(validParityResults, products.length),
          calculationTimestamp: new Date(),
        },
        productParityResults: validParityResults
      };

    } catch (error) {
      this.logger.error('Error calculating ACT value:', error);
      throw new Error(`ACT calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert amount from local currency to ACT
   */
  async convertToACT(amount: number, fromCurrency: string, actValue: number): Promise<number> {
    try {
      // Get USD exchange rate for the currency
      const exchangeRate = await this.getUsdExchangeRate(fromCurrency);
      
      if (!exchangeRate) {
        throw new Error(`Exchange rate not found for currency: ${fromCurrency}`);
      }

      // Convert to USD, then to ACT
      const usdAmount = amount / exchangeRate;
      const actAmount = usdAmount / actValue;

      return actAmount;
    } catch (error) {
      this.logger.error(`Error converting ${amount} ${fromCurrency} to ACT:`, error);
      throw error;
    }
  }

  /**
   * Convert amount from ACT to local currency
   */
  async convertFromACT(actAmount: number, toCurrency: string, actValue: number): Promise<number> {
    try {
      // Get USD exchange rate for the target currency
      const exchangeRate = await this.getUsdExchangeRate(toCurrency);
      
      if (!exchangeRate) {
        throw new Error(`Exchange rate not found for currency: ${toCurrency}`);
      }

      // Convert from ACT to USD, then to local currency
      const usdAmount = actAmount * actValue;
      const localAmount = usdAmount * exchangeRate;

      return localAmount;
    } catch (error) {
      this.logger.error(`Error converting ${actAmount} ACT to ${toCurrency}:`, error);
      throw error;
    }
  }

  /**
   * Get latest ACT value from database
   */
  async getLatestACTValue(): Promise<PPPCalculationResult | null> {
    const latestCalculation = await this.actPriceHistoryRepository.findOne({
      where: { isActive: true },
      order: { calculationTimestamp: 'DESC' }
    });

    if (!latestCalculation) {
      return null;
    }

    return {
      actValue: parseFloat(latestCalculation.actValue.toString()),
      breakdown: {
        staples: parseFloat(latestCalculation.staplesComponent.toString()),
        energy: parseFloat(latestCalculation.energyComponent.toString()),
        telecom: parseFloat(latestCalculation.telecomComponent.toString()),
        transport: parseFloat(latestCalculation.transportComponent.toString()),
      },
      metadata: {
        totalProductsProcessed: latestCalculation.totalProductsProcessed,
        totalCountriesIncluded: latestCalculation.totalCountriesIncluded,
        totalDataPoints: latestCalculation.totalDataPoints,
        averagePriceVariance: parseFloat(latestCalculation.averagePriceVariance.toString()),
        dataCompletenessScore: parseFloat(latestCalculation.dataCompletenessScore.toString()),
        calculationTimestamp: latestCalculation.calculationTimestamp,
      },
      productParityResults: [] // Would need to fetch separately if needed
    };
  }

  // Private helper methods

  private async getActiveProducts(): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { productCategory: 'ASC', productName: 'ASC' }
    });
  }

  private async getActiveCountryWeights(): Promise<CountryWeightEntity[]> {
    return this.countryWeightRepository.find({
      where: { isActive: true },
      order: { compositeWeight: 'DESC' }
    });
  }

  private async getActiveCategoryWeights(): Promise<CategoryWeightEntity[]> {
    return this.categoryWeightRepository.find({
      where: { isActive: true }
    });
  }

  private async getProductPricesByDate(collectionDate: Date, includeOutliers: boolean): Promise<any[]> {
    const query = this.productPriceRepository
      .createQueryBuilder('pp')
      .innerJoinAndSelect('pp.product', 'product')
      .innerJoinAndSelect('pp.country', 'country')
      .where('pp.collectionDate = :collectionDate', { collectionDate: collectionDate.toISOString().split('T')[0] })
      .andWhere('pp.isActive = :isActive', { isActive: true })
      .andWhere('product.isActive = :productActive', { productActive: true })
      .andWhere('country.isActive = :countryActive', { countryActive: true });

    // Add outlier filtering logic if needed
    if (!includeOutliers) {
      query.andWhere('pp.isOutlier = :isOutlier', { isOutlier: false });
    }

    return query.getMany();
  }

  private async calculateProductParity(
    products: ProductEntity[],
    productPrices: any[],
    countryWeights: CountryWeightEntity[]
  ): Promise<any[]> {
    const parityResults = [];

    for (const product of products) {
      const productPricesForProduct = productPrices.filter(pp => pp.product.id === product.id);
      
      if (productPricesForProduct.length === 0) {
        continue;
      }

      // Calculate weighted and simple averages
      let weightedSum = 0;
      let weightTotal = 0;
      let simpleSum = 0;
      let minPrice = Infinity;
      let maxPrice = 0;
      let varianceSum = 0;
      const validPrices = [];

      for (const priceData of productPricesForProduct) {
        const countryWeight = countryWeights.find(cw => cw.countryCode === priceData.country.countryCode);
        
        if (!countryWeight) {
          continue;
        }

        const priceUsd = parseFloat(priceData.priceUsdNormalized.toString());
        const weight = parseFloat(countryWeight.compositeWeight.toString());

        weightedSum += priceUsd * weight;
        weightTotal += weight;
        simpleSum += priceUsd;
        validPrices.push(priceUsd);

        if (priceUsd < minPrice) minPrice = priceUsd;
        if (priceUsd > maxPrice) maxPrice = priceUsd;
      }

      if (validPrices.length === 0) {
        continue;
      }

      const weightedAvgUsd = weightTotal > 0 ? weightedSum / weightTotal : 0;
      const simpleAvgUsd = validPrices.length > 0 ? simpleSum / validPrices.length : 0;

      // Calculate variance
      const mean = simpleAvgUsd;
      varianceSum = validPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0);
      const variance = validPrices.length > 1 ? varianceSum / (validPrices.length - 1) : 0;
      const stdDev = Math.sqrt(variance);

      parityResults.push({
        productCode: product.productCode,
        productName: product.productName,
        category: product.productCategory,
        weightedAvgUsd,
        simpleAvgUsd,
        standardDeviation: stdDev,
        minPriceUsd: minPrice,
        maxPriceUsd: maxPrice,
        priceVariance: variance,
        countriesIncluded: validPrices.length,
        dataPoints: productPricesForProduct.length,
        qualityScore: this.calculateProductQualityScore(validPrices.length, stdDev, mean)
      });
    }

    return parityResults;
  }

  private aggregateByCategory(parityResults: any[], categoryWeights: CategoryWeightEntity[]): Record<string, number> {
    const categoryAggregations: Record<string, number> = {};

    for (const category of Object.keys(this.CATEGORY_WEIGHTS)) {
      const categoryProducts = parityResults.filter(pr => pr.category === category);
      
      if (categoryProducts.length === 0) {
        categoryAggregations[category] = 0;
        continue;
      }

      // Calculate weighted average for category
      const categoryValue = categoryProducts.reduce((sum: number, product: any) => {
        return sum + (product.weightedAvgUsd * (this.CATEGORY_WEIGHTS as Record<string, number>)[category]);
      }, 0) / categoryProducts.length;

      categoryAggregations[category] = categoryValue;
    }

    return categoryAggregations;
  }

  private calculateFinalACTValue(categoryAggregations: Record<string, number>, inflationAdjustment: number): number {
    const actValue = Object.entries(categoryAggregations).reduce((total: number, [category, value]) => {
      const weight = (this.CATEGORY_WEIGHTS as Record<string, number>)[category] || 0;
      return total + (value * weight);
    }, 0);

    return actValue * inflationAdjustment;
  }

  private calculateAverageVariance(parityResults: any[]): number {
    if (parityResults.length === 0) return 0;
    
    const totalVariance = parityResults.reduce((sum, result) => sum + result.priceVariance, 0);
    return totalVariance / parityResults.length;
  }

  private calculateDataCompleteness(parityResults: any[], totalProducts: number): number {
    if (totalProducts === 0) return 0;
    return parityResults.length / totalProducts;
  }

  private calculateProductQualityScore(dataPoints: number, stdDev: number, mean: number): number {
    // Quality score based on data points and variance
    let score = Math.min(dataPoints / 10, 1.0); // Max points for 10+ data points
    
    // Reduce score for high variance
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;
    if (coefficientOfVariation > 0.5) {
      score *= 0.7; // Reduce score for high variance
    } else if (coefficientOfVariation > 0.3) {
      score *= 0.85; // Slight reduction for moderate variance
    }
    
    return Math.max(score, 0.1); // Minimum score of 0.1
  }

  private async saveCalculationResults(
    actValue: number,
    categoryAggregations: any,
    parityResults: any[],
    collectionDate: Date
  ): Promise<ACTPriceHistoryEntity> {
    const calculationResult = this.actPriceHistoryRepository.create({
      actValue,
      calculationDate: collectionDate.toISOString().split('T')[0] as any,
      calculationTimestamp: new Date(),
      staplesComponent: categoryAggregations.Staples || 0,
      energyComponent: categoryAggregations.Energy || 0,
      telecomComponent: categoryAggregations.Telecom || 0,
      transportComponent: categoryAggregations.Transport || 0,
      totalProductsProcessed: parityResults.length,
      totalCountriesIncluded: 0, // Would calculate from parity results
      totalDataPoints: parityResults.reduce((sum, pr) => sum + pr.dataPoints, 0),
      averagePriceVariance: this.calculateAverageVariance(parityResults),
      dataCompletenessScore: this.calculateDataCompleteness(parityResults, 0), // Would use actual total products
      calculationMethod: 'PPP_WEIGHTED_AVERAGE',
      inflationAdjustmentFactor: 1.0,
      createdBy: 'system'
    });

    return this.actPriceHistoryRepository.save(calculationResult);
  }

  public async getUsdExchangeRate(currencyCode: string): Promise<number> {
    // Get USD exchange rate for specified currency
    // In production, this would integrate with real-time exchange rate APIs
    const rates: { [key: string]: number } = {
      'NGN': 1570.00,
      'KES': 133.50,
      'ZAR': 18.40,
      'GHS': 12.50,
      'EGP': 31.00,
      'ETB': 131.50,
      'TZS': 2650.00,
      'UGX': 3750.00,
      'MAD': 10.20,
      'USD': 1.00
    };

    return rates[currencyCode] || 1.0;
  }
}