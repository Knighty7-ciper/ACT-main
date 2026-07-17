import CommodityPrice from '../models/CommodityPrice.js';
import PPPValue from '../models/PPPValue.js';

class PPPService {
  constructor() {
    // Standard basket configuration
    this.basketConfig = {
      food_staple: { weight: 0.30, items: ['Rice (white, long grain)', 'Wheat flour', 'Bread (white loaf)'] },
      protein: { weight: 0.15, items: ['Chicken breast', 'Eggs'] },
      fuel: { weight: 0.20, items: ['Diesel', 'Cooking oil'] },
      utilities: { weight: 0.20, items: ['Electricity', 'Water'] },
      transport: { weight: 0.10, items: ['Public transport'] },
      housing: { weight: 0.03, items: ['Basic rent'] },
      healthcare: { weight: 0.02, items: ['Basic medicine'] }
    };

    // Benchmark countries for calculation
    this.benchmarkCountries = ['USA', 'EUR', 'GBR', 'JPN', 'CHE'];
  }

  // Calculate PPP value for a country
  async calculatePPP(countryCode) {
    try {
      // Get latest commodity prices
      const prices = await CommodityPrice.getLatestByCountry(countryCode);
      
      if (!prices || prices.length === 0) {
        throw new Error(`No price data available for ${countryCode}`);
      }

      // Calculate basket total
      let basketTotal = 0;
      let basketTotalUsd = 0;
      const basketItems = [];

      for (const price of prices) {
        const itemTotal = parseFloat(price.price);
        const itemTotalUsd = parseFloat(price.price_usd || 0);
        basketTotal += itemTotal;
        basketTotalUsd += itemTotalUsd;
        
        basketItems.push({
          commodityType: price.commodity_type,
          commodityName: price.commodity_name,
          quantity: parseFloat(price.quantity),
          unit: price.unit,
          price: itemTotal,
          priceUsd: itemTotalUsd,
          currency: price.currency
        });
      }

      // Calculate weighted average across benchmarks
      const benchmarkData = await this.getBenchmarkData();
      const geometricMean = this.calculateGeometricMean(benchmarkData);
      
      // Calculate token value
      // Token value = (Basket Total in USD) / (Global Average Basket in USD)
      const baselineBasketUsd = this.calculateBaselineBasketUsd(benchmarkData);
      const tokenValueUsd = baselineBasketUsd > 0 ? baselineBasketUsd : 1.0;
      const tokenValue = basketTotalUsd / tokenValueUsd;

      // Calculate inflation rate (simplified - compare to previous value)
      const inflationRate = await this.calculateInflationRate(countryCode);

      // Calculate volatility index
      const volatilityIndex = await this.calculateVolatilityIndex(countryCode);

      // Calculate stability score
      const stabilityScore = this.calculateStabilityScore(volatilityIndex, inflationRate);

      // Store PPP value
      const pppData = {
        countryCode,
        currency: prices[0]?.currency || 'USD',
        basketTotal,
        basketTotalUsd,
        tokenValue: Math.max(tokenValue, 0.0001), // Prevent zero/negative values
        tokenValueUsd: tokenValueUsd,
        inflationRate,
        volatilityIndex,
        stabilityScore,
        calculationMethod: 'geometric_mean',
        dataPoints: prices.length,
        benchmarkCountry: 'USA',
        confidenceScore: this.calculateConfidenceScore(prices),
        effectiveFrom: new Date()
      };

      await PPPValue.recordPPPValue(pppData);

      return {
        ...pppData,
        basketItems
      };
    } catch (error) {
      console.error('PPP calculation error:', error);
      throw error;
    }
  }

  // Get benchmark data from stable countries
  async getBenchmarkData() {
    const prices = await CommodityPrice.getBasketPrices(this.benchmarkCountries);
    
    const benchmarkData = {};
    this.benchmarkCountries.forEach(country => {
      const countryPrices = prices.filter(p => p.country_code === country);
      const total = countryPrices.reduce((sum, p) => sum + parseFloat(p.price_usd || 0), 0);
      benchmarkData[country] = {
        basketTotal: total,
        itemCount: countryPrices.length,
        prices: countryPrices
      };
    });
    
    return benchmarkData;
  }

  // Calculate geometric mean of benchmark values
  calculateGeometricMean(benchmarkData) {
    const values = Object.values(benchmarkData)
      .filter(d => d.basketTotal > 0)
      .map(d => d.basketTotal);

    if (values.length === 0) return 1;

    const product = values.reduce((acc, val) => acc * val, 1);
    return Math.pow(product, 1 / values.length);
  }

  // Calculate baseline basket value in USD
  calculateBaselineBasketUsd(benchmarkData) {
    const geometricMean = this.calculateGeometricMean(benchmarkData);
    return geometricMean;
  }

  // Calculate inflation rate for a country
  async calculateInflationRate(countryCode) {
    try {
      const history = await PPPValue.getHistory(countryCode, 30);
      
      if (history.length < 2) return 0;

      const latest = history[0];
      const previous = history[history.length - 1];

      const latestValue = parseFloat(latest.basket_total_usd || 0);
      const previousValue = parseFloat(previous.basket_total_usd || 0);

      if (previousValue === 0) return 0;

      return ((latestValue - previousValue) / previousValue) * 100;
    } catch (error) {
      console.error('Inflation calculation error:', error);
      return 0;
    }
  }

  // Calculate volatility index
  async calculateVolatilityIndex(countryCode) {
    try {
      const history = await PPPValue.getHistory(countryCode, 90);
      
      if (history.length < 2) return 0;

      const values = history.map(h => parseFloat(h.token_value || 0)).filter(v => v > 0);
      
      if (values.length < 2) return 0;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      
      // Annualized volatility (assuming daily data)
      const dailyVolatility = Math.sqrt(variance) / mean;
      const annualizedVolatility = dailyVolatility * Math.sqrt(365);

      return Math.min(annualizedVolatility, 1); // Cap at 1 (100%)
    } catch (error) {
      console.error('Volatility calculation error:', error);
      return 0;
    }
  }

  // Calculate stability score
  calculateStabilityScore(volatilityIndex, inflationRate) {
    // Lower volatility and inflation = higher stability
    const volatilityPenalty = volatilityIndex * 50; // Max 50 points penalty
    const inflationPenalty = Math.min(Math.abs(inflationRate), 20); // Max 20 points penalty
    
    const score = 100 - volatilityPenalty - inflationPenalty;
    return Math.max(0, Math.min(100, score));
  }

  // Calculate confidence score based on data quality
  calculateConfidenceScore(prices) {
    if (!prices || prices.length === 0) return 0;

    // Higher confidence with more data points
    const dataPoints = prices.length;
    const maxItems = 12; // Total basket items
    const dataScore = Math.min(dataPoints / maxItems, 1);

    // Check for recent timestamps
    const now = Date.now();
    const recentThreshold = 24 * 60 * 60 * 1000; // 24 hours
    const recentCount = prices.filter(p => 
      new Date(p.valid_from).getTime() > now - recentThreshold
    ).length;
    const recencyScore = recentCount / prices.length;

    // Weighted average
    const confidence = (dataScore * 0.6 + recencyScore * 0.4);
    return Math.min(Math.max(confidence, 0), 1);
  }

  // Convert fiat amount to ACT tokens
  async fiatToToken(fiatAmount, countryCode) {
    const pppValue = await PPPValue.getLatestByCountry(countryCode);
    
    if (!pppValue) {
      throw new Error(`No PPP value available for ${countryCode}`);
    }

    const tokenValue = parseFloat(pppValue.token_value);
    const tokenAmount = fiatAmount / tokenValue;

    return {
      fiatAmount,
      fiatCurrency: pppValue.currency,
      tokenAmount: Math.round(tokenAmount * 1e8) / 1e8, // Round to 8 decimals
      tokenValue,
      exchangeRate: 1 / tokenValue
    };
  }

  // Convert ACT tokens to fiat
  async tokenToFiat(tokenAmount, countryCode) {
    const pppValue = await PPPValue.getLatestByCountry(countryCode);
    
    if (!pppValue) {
      throw new Error(`No PPP value available for ${countryCode}`);
    }

    const tokenValue = parseFloat(pppValue.token_value);
    const fiatAmount = tokenAmount * tokenValue;

    return {
      tokenAmount,
      fiatAmount: Math.round(fiatAmount * 100) / 100, // Round to 2 decimals
      fiatCurrency: pppValue.currency,
      tokenValue
    };
  }

  // Get purchasing power comparison
  async getPurchasingPowerComparison(fromCountry, toCountry, amount = 100) {
    const fromPPP = await PPPValue.getLatestByCountry(fromCountry);
    const toPPP = await PPPValue.getLatestByCountry(toCountry);

    if (!fromPPP || !toPPP) {
      throw new Error('PPP data not available for one or both countries');
    }

    const fromTokenValue = parseFloat(fromPPP.token_value);
    const toTokenValue = parseFloat(toPPP.token_value);

    // Amount in source country currency
    const fromFiatValue = amount;
    const tokenAmount = amount / fromTokenValue;

    // Convert to target country currency
    const toFiatValue = tokenAmount * toTokenValue;

    // Calculate purchasing power difference
    const purchasingPowerDiff = ((toFiatValue - fromFiatValue) / fromFiatValue) * 100;

    return {
      sourceCountry: fromCountry,
      targetCountry: toCountry,
      amount,
      sourceFiatValue: fromFiatValue,
      tokenAmount,
      targetFiatValue: Math.round(toFiatValue * 100) / 100,
      purchasingPowerDifference: Math.round(purchasingPowerDiff * 100) / 100,
      interpretation: purchasingPowerDiff > 0 
        ? `ACT tokens have ${Math.abs(purchasingPowerDiff)}% more purchasing power in ${toCountry}`
        : `ACT tokens have ${Math.abs(purchasingPowerDiff)}% less purchasing power in ${toCountry}`
    };
  }

  // Update all countries PPP values
  async updateAllPPPValues() {
    const countries = await PPPValue.getAllLatest();
    const results = [];

    for (const country of countries) {
      try {
        const result = await this.calculatePPP(country.country_code);
        results.push({
          countryCode: country.country_code,
          success: true,
          tokenValue: result.tokenValue
        });
      } catch (error) {
        results.push({
          countryCode: country.country_code,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

export default new PPPService();
