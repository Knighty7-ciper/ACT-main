import CommodityPrice from '../models/CommodityPrice.js';
import PPPValue from '../models/PPPValue.js';

// Get PPP value for a specific country
export const getPPPValue = async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    if (!countryCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing country code',
        message: 'Country code is required'
      });
    }
    
    const pppValue = await PPPValue.getLatestByCountry(countryCode.toUpperCase());
    
    if (!pppValue) {
      return res.status(404).json({
        success: false,
        error: 'No data',
        message: 'No PPP value available for this country'
      });
    }
    
    // Get basket details
    const basketTotal = await CommodityPrice.calculateBasketTotal(countryCode.toUpperCase());
    
    res.json({
      success: true,
      data: {
        countryCode: pppValue.country_code,
        currency: pppValue.currency,
        basketTotal: parseFloat(pppValue.basket_total),
        basketTotalUsd: parseFloat(pppValue.basket_total_usd),
        tokenValue: parseFloat(pppValue.token_value),
        tokenValueUsd: parseFloat(pppValue.token_value_usd),
        inflationRate: parseFloat(pppValue.inflation_rate || 0),
        volatilityIndex: parseFloat(pppValue.volatility_index || 0),
        stabilityScore: parseFloat(pppValue.stability_score || 0),
        confidenceScore: parseFloat(pppValue.confidence_score),
        calculationTimestamp: pppValue.calculation_timestamp,
        basketItems: basketTotal?.items || []
      }
    });
  } catch (error) {
    console.error('Get PPP value error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching PPP value'
    });
  }
};

// Get global PPP comparison
export const getGlobalPPP = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const comparison = await PPPValue.getGlobalComparison();
    
    res.json({
      success: true,
      data: {
        countries: comparison.countries.slice(0, parseInt(limit)),
        statistics: comparison.statistics
      }
    });
  } catch (error) {
    console.error('Get global PPP error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching global PPP data'
    });
  }
};

// Get basket prices for comparison - returns format expected by frontend
export const getBasketComparison = async (req, res) => {
  try {
    const { countries } = req.query;
    
    if (!countries) {
      return res.status(400).json({
        success: false,
        error: 'Missing countries',
        message: 'Countries parameter is required'
      });
    }
    
    const countryList = countries.split(',').map(c => c.trim().toUpperCase());
    const prices = await CommodityPrice.getBasketPrices(countryList);
    
    // Get all latest PPP values for stability scores
    const allLatest = await PPPValue.getAllLatest();
    
    // Build countries data structure
    const countriesData = {};
    countryList.forEach(code => {
      const ppp = allLatest.find(p => p.country_code === code) || {};
      countriesData[code] = {
        stabilityScore: parseFloat(ppp.stability_score || 85),
        inflationRate: parseFloat(ppp.inflation_rate || 2.5),
        tokenValue: parseFloat(ppp.token_value || 1)
      };
    });
    
    // Group by commodity type and format for frontend
    const commodities = [];
    const priceMap = {};
    
    // Create a map of prices by country and item
    prices.forEach(price => {
      const key = price.commodity_name;
      if (!priceMap[key]) {
        priceMap[key] = {
          name: price.commodity_name,
          type: price.commodity_type,
          unit: price.unit,
          icon: getCommodityIcon(price.commodity_name)
        };
      }
      priceMap[key][price.country_code] = {
        price: parseFloat(price.price),
        priceUsd: parseFloat(price.price_usd),
        currency: price.currency
      };
    });
    
    // Convert to array
    Object.values(priceMap).forEach(item => {
      commodities.push(item);
    });
    
    res.json({
      success: true,
      data: {
        countries: countriesData,
        commodities,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get basket comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching basket comparison'
    });
  }
};

// Get exchange rates for swap functionality
export const getExchangeRates = async (req, res) => {
  try {
    // Get all available PPP values
    const latest = await PPPValue.getAllLatest();
    
    // Build exchange rates relative to USD
    const rates = {};
    const market = {
      price: 1.00,
      change24h: '+0.02',
      volume24h: '2500000',
      stabilityScore: 95
    };
    
    latest.forEach(ppp => {
      const code = ppp.country_code;
      const tokenValue = parseFloat(ppp.token_value || 1);
      
      // ACT to other currencies
      rates[`ACT-${code}`] = tokenValue;
      rates[`ACT-USD`] = 1.0;
      rates[`ACT-USDC`] = 1.0;
      rates[`ACT-USDT`] = 1.0;
      
      // Other currencies to ACT
      rates[`${code}-ACT`] = 1 / tokenValue;
      rates[`USD-ACT`] = 1.0;
      rates[`USDC-ACT`] = 1.0;
      rates[`USDT-ACT`] = 1.0;
    });
    
    // Add some stablecoin pairs
    rates['USD-USDC'] = 1.0;
    rates['USD-USDT'] = 1.0;
    rates['USDC-USD'] = 1.0;
    rates['USDT-USD'] = 1.0;
    
    res.json({
      success: true,
      data: {
        rates,
        market,
        baseCurrency: 'ACT',
        quoteCurrencies: ['USD', 'USDC', 'USDT', ...latest.map(p => p.country_code)],
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching exchange rates'
    });
  }
};

// Get stability ranking - returns format expected by frontend
export const getStabilityRanking = async (req, res) => {
  try {
    const { limit = 50, region } = req let ranking = await.query;
    
    PPPValue.getStabilityRanking(parseInt(limit));
    
    // Filter by region if specified
    if (region && region !== 'all') {
      const regionCountries = getCountriesByRegion(region);
      ranking = ranking.filter(c => regionCountries.includes(c.country_code));
    }
    
    // Calculate stability details for each country
    const rankingWithDetails = await Promise.all(
      ranking.map(async (country) => {
        const stability = await PPPValue.calculateStabilityIndex(country.country_code);
        return {
          code: country.country_code,
          name: getCountryName(country.country_code),
          flag: getCountryFlag(country.country_code),
          region: getCountryRegion(country.country_code),
          stability: parseFloat(country.stability_score || 0),
          inflation: parseFloat(country.inflation_rate || 0),
          volatility: parseFloat(country.volatility_index || 0),
          tokenValue: parseFloat(country.token_value || 1),
          basketTotal: parseFloat(country.basket_total || 0),
          ...stability
        };
      })
    );
    
    // Calculate global statistics
    const globalStats = {
      totalCountries: rankingWithDetails.length,
      highStability: rankingWithDetails.filter(c => c.stability >= 80).length,
      moderateStability: rankingWithDetails.filter(c => c.stability >= 40 && c.stability < 80).length,
      lowStability: rankingWithDetails.filter(c => c.stability < 40).length,
      averageInflation: rankingWithDetails.reduce((sum, c) => sum + c.inflation, 0) / rankingWithDetails.length
    };
    
    res.json({
      success: true,
      data: {
        countries: rankingWithDetails,
        globalStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get stability ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching stability ranking'
    });
  }
};

// Calculate token amount for basket value
export const calculateTokenAmount = async (req, res) => {
  try {
    const { countryCode, basketValue } = req.body;
    
    if (!countryCode || !basketValue) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameters',
        message: 'Country code and basket value are required'
      });
    }
    
    const result = await PPPValue.calculateTokenAmount(
      countryCode.toUpperCase(), 
      parseFloat(basketValue)
    );
    
    res.json({
      success: true,
      data: {
        countryCode: result.countryCode,
        basketValue: result.basketValue,
        tokenAmount: result.tokenAmount,
        tokenValue: result.tokenValue,
        tokenValueUsd: result.tokenValueUsd,
        calculationTimestamp: result.calculationTimestamp
      }
    });
  } catch (error) {
    console.error('Calculate token amount error:', error);
    res.status(500).json({
      success: false,
      error: 'Calculation failed',
      message: error.message || 'An error occurred while calculating token amount'
    });
  }
};

// Get PPP history for a country
export const getPPPHistory = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { days = 30 } = req.query;
    
    const history = await PPPValue.getHistory(countryCode.toUpperCase(), parseInt(days));
    
    const formatted = history.map(h => ({
      date: h.calculation_timestamp,
      tokenValue: parseFloat(h.token_value),
      tokenValueUsd: parseFloat(h.token_value_usd),
      basketTotal: parseFloat(h.basket_total),
      stabilityScore: parseFloat(h.stability_score || 0),
      inflationRate: parseFloat(h.inflation_rate || 0)
    }));
    
    res.json({
      success: true,
      data: {
        countryCode: countryCode.toUpperCase(),
        history: formatted,
        dataPoints: history.length
      }
    });
  } catch (error) {
    console.error('Get PPP history error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching PPP history'
    });
  }
};

// Get current commodity prices for a country
export const getCommodityPrices = async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    const prices = await CommodityPrice.getLatestByCountry(countryCode.toUpperCase());
    
    const formatted = prices.map(p => ({
      commodityType: p.commodity_type,
      commodityName: p.commodity_name,
      quantity: parseFloat(p.quantity),
      unit: p.unit,
      price: parseFloat(p.price),
      priceUsd: parseFloat(p.price_usd),
      currency: p.currency,
      source: p.source,
      timestamp: p.valid_from
    }));
    
    // Calculate basket total
    const basketTotal = formatted.reduce((sum, item) => sum + item.price, 0);
    
    res.json({
      success: true,
      data: {
        countryCode: countryCode.toUpperCase(),
        items: formatted,
        basketTotal,
        itemCount: formatted.length
      }
    });
  } catch (error) {
    console.error('Get commodity prices error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching commodity prices'
    });
  }
};

// Get all available countries
export const getAvailableCountries = async (req, res) => {
  try {
    const latest = await PPPValue.getAllLatest();
    
    const countries = latest.map(p => ({
      countryCode: p.country_code,
      currency: p.currency,
      tokenValue: parseFloat(p.token_value),
      stabilityScore: parseFloat(p.stability_score || 0),
      lastUpdated: p.calculation_timestamp
    }));
    
    res.json({
      success: true,
      data: {
        countries,
        totalCount: countries.length
      }
    });
  } catch (error) {
    console.error('Get available countries error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching available countries'
    });
  }
};

// Helper function to get commodity icon
function getCommodityIcon(name) {
  const icons = {
    'Rice': '🌾',
    'Wheat Flour': '🌾',
    'Bread': '🍞',
    'Chicken Breast': '🍗',
    'Eggs': '🥚',
    'Diesel': '⛽',
    'Cooking Oil': '🫒',
    'Electricity': '⚡',
    'Water': '💧',
    'Public Transport': '🚌'
  };
  return icons[name] || '📦';
}

// Helper function to get country name
function getCountryName(code) {
  const names = {
    'USA': 'United States',
    'CHE': 'Switzerland',
    'GBR': 'United Kingdom',
    'JPN': 'Japan',
    'DEU': 'Germany',
    'CAN': 'Canada',
    'AUS': 'Australia',
    'SGP': 'Singapore',
    'BRA': 'Brazil',
    'IND': 'India',
    'ZAF': 'South Africa',
    'MEX': 'Mexico',
    'FRA': 'France',
    'CHN': 'China',
    'NGA': 'Nigeria',
    'ARG': 'Argentina',
    'TUR': 'Turkey',
    'VEN': 'Venezuela',
    'EUR': 'Eurozone'
  };
  return names[code] || code;
}

// Helper function to get country flag
function getCountryFlag(code) {
  const flags = {
    'USA': '🇺🇸',
    'CHE': '🇨🇭',
    'GBR': '🇬🇧',
    'JPN': '🇯🇵',
    'DEU': '🇩🇪',
    'CAN': '🇨🇦',
    'AUS': '🇦🇺',
    'SGP': '🇸🇬',
    'BRA': '🇧🇷',
    'IND': '🇮🇳',
    'ZAF': '🇿🇦',
    'MEX': '🇲🇽',
    'FRA': '🇫🇷',
    'CHN': '🇨🇳',
    'NGA': '🇳🇬',
    'ARG': '🇦🇷',
    'TUR': '🇹🇷',
    'VEN': '🇻🇪',
    'EUR': '🇪🇺'
  };
  return flags[code] || '🌍';
}

// Helper function to get country region
function getCountryRegion(code) {
  const regions = {
    'USA': 'americas',
    'CHE': 'europe',
    'GBR': 'europe',
    'JPN': 'asia',
    'DEU': 'europe',
    'CAN': 'americas',
    'AUS': 'asia',
    'SGP': 'asia',
    'BRA': 'americas',
    'IND': 'asia',
    'ZAF': 'africa',
    'MEX': 'americas',
    'FRA': 'europe',
    'CHN': 'asia',
    'NGA': 'africa',
    'ARG': 'americas',
    'TUR': 'europe',
    'VEN': 'americas',
    'EUR': 'europe'
  };
  return regions[code] || 'other';
}

// Helper function to get countries by region
function getCountriesByRegion(region) {
  const regionCountries = {
    'americas': ['USA', 'CAN', 'BRA', 'MEX', 'ARG', 'VEN'],
    'europe': ['GBR', 'CHE', 'DEU', 'FRA', 'TUR'],
    'asia': ['JPN', 'AUS', 'SGP', 'IND', 'CHN'],
    'africa': ['ZAF', 'NGA']
  };
  return regionCountries[region] || [];
}

export default {
  getPPPValue,
  getGlobalPPP,
  getBasketComparison,
  getExchangeRates,
  getStabilityRanking,
  calculateTokenAmount,
  getPPPHistory,
  getCommodityPrices,
  getAvailableCountries
};
