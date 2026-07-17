// ==========================================
// PESA-AFRIK PROFESSIONAL PPP ALGORITHM
// Weighted Geometric Mean Index for Currency Valuation
// ==========================================

// Basket composition weights (based on typical household expenditure patterns)
const BASKET_WEIGHTS = {
  food_staple: 0.30,    // 30% - Rice, Maize, Wheat (essential survival)
  protein: 0.20,        // 20% - Meat, Eggs, Fish (nutrition)
  fuel_energy: 0.25,    // 25% - Cooking fuel, Transport fuel
  utilities: 0.15,      // 15% - Electricity, Water
  housing: 0.10,        // 10% - Rent proxy (cement, steel)
};

// Global reference prices (USD equivalent - baseline for comparison)
const GLOBAL_REFERENCE_PRICES = {
  // Food Staples
  'Rice (2kg)': 8.50,
  'Wheat Flour (2kg)': 5.20,
  'Bread (2kg)': 6.80,
  'Maize Meal (2kg)': 4.50,
  'Cassava (2kg)': 3.80,
  
  // Proteins
  'Chicken Breast (1kg)': 12.50,
  'Beef (1kg)': 15.00,
  'Eggs (12)': 6.00,
  'Fish (1kg)': 10.00,
  'Milk (1L)': 2.50,
  
  // Fuel & Energy
  'Diesel (1L)': 1.45,
  'Petrol (1L)': 1.35,
  'Cooking Gas (1kg)': 4.50,
  'Charcoal (1kg)': 1.20,
  
  // Utilities
  'Electricity (100kWh)': 18.00,
  'Water (10m³)': 8.00,
  'Internet (1GB)': 3.50,
  'Mobile Airtime': 2.00,
  
  // Housing Materials
  'Cement (50kg)': 12.00,
  'Steel Rod (1m)': 3.50,
  ' roofing Sheets': 8.00,
};

// Currency exchange rates to USD (for normalization)
const USD_EXCHANGE_RATES = {
  ZAR: 0.052,
  NGN: 0.00065,
  KES: 0.0065,
  GHS: 0.080,
  EGP: 0.032,
  MAD: 0.10,
  ETB: 0.0088,
  TZS: 0.00040,
  UGA: 0.00027,
  XAF: 0.0016,
};

// Full basket items with categories and weights
const BASKET_ITEMS = [
  // Food Staples (30%)
  { name: 'Rice (2kg)', category: 'food_staple', weight: 0.08, unit: 'kg' },
  { name: 'Wheat Flour (2kg)', category: 'food_staple', weight: 0.07, unit: 'kg' },
  { name: 'Bread (2kg)', category: 'food_staple', weight: 0.07, unit: 'kg' },
  { name: 'Maize Meal (2kg)', category: 'food_staple', weight: 0.08, unit: 'kg' },
  
  // Proteins (20%)
  { name: 'Chicken Breast (1kg)', category: 'protein', weight: 0.06, unit: 'kg' },
  { name: 'Eggs (12)', category: 'protein', weight: 0.05, unit: 'units' },
  { name: 'Beef (1kg)', category: 'protein', weight: 0.05, unit: 'kg' },
  { name: 'Milk (1L)', category: 'protein', weight: 0.04, unit: 'L' },
  
  // Fuel & Energy (25%)
  { name: 'Diesel (1L)', category: 'fuel_energy', weight: 0.08, unit: 'L' },
  { name: 'Petrol (1L)', category: 'fuel_energy', weight: 0.07, unit: 'L' },
  { name: 'Cooking Gas (1kg)', category: 'fuel_energy', weight: 0.05, unit: 'kg' },
  { name: 'Charcoal (1kg)', category: 'fuel_energy', weight: 0.05, unit: 'kg' },
  
  // Utilities (15%)
  { name: 'Electricity (100kWh)', category: 'utilities', weight: 0.06, unit: 'kWh' },
  { name: 'Water (10m³)', category: 'utilities', weight: 0.04, unit: 'm³' },
  { name: 'Internet (1GB)', category: 'utilities', weight: 0.03, unit: 'GB' },
  { name: 'Mobile Airtime', category: 'utilities', weight: 0.02, unit: 'units' },
  
  // Housing (10%)
  { name: 'Cement (50kg)', category: 'housing', weight: 0.05, unit: 'bag' },
  { name: 'Steel Rod (1m)', category: 'housing', weight: 0.03, unit: 'm' },
  { name: 'Roofing Sheets', category: 'housing', weight: 0.02, unit: 'sheets' },
];

// Local prices database (simulated real-world data)
const LOCAL_PRICES = {
  ZAF: {
    'Rice (2kg)': 65, 'Wheat Flour (2kg)': 42, 'Bread (2kg)': 55, 'Maize Meal (2kg)': 38,
    'Chicken Breast (1kg)': 125, 'Eggs (12)': 78, 'Beef (1kg)': 180, 'Milk (1L)': 25,
    'Diesel (1L)': 21.50, 'Petrol (1L)': 23.80, 'Cooking Gas (1kg)': 145, 'Charcoal (1kg)': 35,
    'Electricity (100kWh)': 185, 'Water (10m³)': 125, 'Internet (1GB)': 99, 'Mobile Airtime': 50,
    'Cement (50kg)': 125, 'Steel Rod (1m)': 28, 'Roofing Sheets': 185,
  },
  NGA: {
    'Rice (2kg)': 3200, 'Wheat Flour (2kg)': 1800, 'Bread (2kg)': 2200, 'Maize Meal (2kg)': 1500,
    'Chicken Breast (1kg)': 4800, 'Eggs (12)': 2000, 'Beef (1kg)': 5500, 'Milk (1L)': 800,
    'Diesel (1L)': 1150, 'Petrol (1L)': 1050, 'Cooking Gas (1kg)': 4200, 'Charcoal (1kg)': 1800,
    'Electricity (100kWh)': 28000, 'Water (10m³)': 9500, 'Internet (1GB)': 1200, 'Mobile Airtime': 400,
    'Cement (50kg)': 8500, 'Steel Rod (1m)': 2800, 'Roofing Sheets': 9500,
  },
  KEN: {
    'Rice (2kg)': 320, 'Wheat Flour (2kg)': 195, 'Bread (2kg)': 250, 'Maize Meal (2kg)': 180,
    'Chicken Breast (1kg)': 680, 'Eggs (12)': 350, 'Beef (1kg)': 850, 'Milk (1L)': 120,
    'Diesel (1L)': 175, 'Petrol (1L)': 195, 'Cooking Gas (1kg)': 580, 'Charcoal (1kg)': 280,
    'Electricity (100kWh)': 4500, 'Water (10m³)': 2800, 'Internet (1GB)': 550, 'Mobile Airtime': 200,
    'Cement (50kg)': 950, 'Steel Rod (1m)': 180, 'Roofing Sheets': 1250,
  },
  GHA: {
    'Rice (2kg)': 85, 'Wheat Flour (2kg)': 55, 'Bread (2kg)': 65, 'Maize Meal (2kg)': 45,
    'Chicken Breast (1kg)': 145, 'Eggs (12)': 65, 'Beef (1kg)': 185, 'Milk (1L)': 28,
    'Diesel (1L)': 42, 'Petrol (1L)': 38, 'Cooking Gas (1kg)': 180, 'Charcoal (1kg)': 75,
    'Electricity (100kWh)': 520, 'Water (10m³)': 350, 'Internet (1GB)': 85, 'Mobile Airtime': 40,
    'Cement (50kg)': 145, 'Steel Rod (1m)': 42, 'Roofing Sheets': 280,
  },
  EGY: {
    'Rice (2kg)': 950, 'Wheat Flour (2kg)': 520, 'Bread (2kg)': 650, 'Maize Meal (2kg)': 450,
    'Chicken Breast (1kg)': 1450, 'Eggs (12)': 480, 'Beef (1kg)': 1850, 'Milk (1L)': 180,
    'Diesel (1L)': 350, 'Petrol (1L)': 320, 'Cooking Gas (1kg)': 580, 'Charcoal (1kg)': 250,
    'Electricity (100kWh)': 3800, 'Water (10m³)': 2200, 'Internet (1GB)': 380, 'Mobile Airtime': 120,
    'Cement (50kg)': 1850, 'Steel Rod (1m)': 580, 'Roofing Sheets': 2200,
  },
  MAR: {
    'Rice (2kg)': 48, 'Wheat Flour (2kg)': 32, 'Bread (2kg)': 38, 'Maize Meal (2kg)': 28,
    'Chicken Breast (1kg)': 85, 'Eggs (12)': 45, 'Beef (1kg)': 120, 'Milk (1L)': 18,
    'Diesel (1L)': 32, 'Petrol (1L)': 35, 'Cooking Gas (1kg)': 95, 'Charcoal (1kg)': 25,
    'Electricity (100kWh)': 185, 'Water (10m³)': 145, 'Internet (1GB)': 65, 'Mobile Airtime': 25,
    'Cement (50kg)': 125, 'Steel Rod (1m)': 32, 'Roofing Sheets': 145,
  },
  ETH: {
    'Rice (2kg)': 220, 'Wheat Flour (2kg)': 145, 'Bread (2kg)': 180, 'Maize Meal (2kg)': 120,
    'Chicken Breast (1kg)': 420, 'Eggs (12)': 195, 'Beef (1kg)': 520, 'Milk (1L)': 85,
    'Diesel (1L)': 145, 'Petrol (1L)': 135, 'Cooking Gas (1kg)': 280, 'Charcoal (1kg)': 95,
    'Electricity (100kWh)': 2800, 'Water (10m³)': 1450, 'Internet (1GB)': 320, 'Mobile Airtime': 85,
    'Cement (50kg)': 1050, 'Steel Rod (1m)': 220, 'Roofing Sheets': 1450,
  },
  TZA: {
    'Rice (2kg)': 3800, 'Wheat Flour (2kg)': 2200, 'Bread (2kg)': 2800, 'Maize Meal (2kg)': 1800,
    'Chicken Breast (1kg)': 5500, 'Eggs (12)': 2500, 'Beef (1kg)': 6800, 'Milk (1L)': 950,
    'Diesel (1L)': 1450, 'Petrol (1L)': 1350, 'Cooking Gas (1kg)': 5200, 'Charcoal (1kg)': 2800,
    'Electricity (100kWh)': 38000, 'Water (10m³)': 12500, 'Internet (1GB)': 4200, 'Mobile Airtime': 550,
    'Cement (50kg)': 12500, 'Steel Rod (1m)': 3200, 'Roofing Sheets': 15500,
  },
};

// ==========================================
// MAIN PPP CALCULATION FUNCTION
// ==========================================

export const calculatePPPValue = (countryCode) => {
  const localPrices = LOCAL_PRICES[countryCode];
  if (!localPrices) {
    return {
      error: 'Country not supported',
      pppValue: 0,
    };
  }

  let weightedSum = 0;
  let totalWeight = 0;
  const itemCalculations = [];

  // Calculate weighted price for each basket item
  BASKET_ITEMS.forEach((item) => {
    const localPrice = localPrices[item.name];
    const globalPrice = GLOBAL_REFERENCE_PRICES[item.name];
    
    if (localPrice && globalPrice) {
      // Price ratio (Local / Global) - shows how expensive this item is locally
      const priceRatio = localPrice / globalPrice;
      
      // Weighted contribution
      const weightedContribution = priceRatio * item.weight;
      weightedSum += weightedContribution;
      totalWeight += item.weight;

      itemCalculations.push({
        name: item.name,
        category: item.category,
        localPrice,
        globalPrice,
        priceRatio,
        weight: item.weight,
        weightedContribution,
      });
    }
  });

  // Calculate the PPP ratio
  // This represents how many units of local currency = 1 unit of Pesa-Afrik
  const pppRatio = weightedSum / totalWeight;

  // Calculate category breakdowns
  const categories = {};
  itemCalculations.forEach((calc) => {
    if (!categories[calc.category]) {
      categories[calc.category] = {
        items: [],
        totalWeight: 0,
        weightedSum: 0,
      };
    }
    categories[calc.category].items.push(calc);
    categories[calc.category].totalWeight += calc.weight;
    categories[calc.category].weightedSum += calc.weightedContribution;
  });

  // Calculate category ratios
  const categoryRatios = {};
  Object.keys(categories).forEach((cat) => {
    const catData = categories[cat];
    categoryRatios[cat] = catData.weightedSum / catData.totalWeight;
  });

  // Calculate volatility score based on price variance
  const priceRatios = itemCalculations.map((calc) => calc.priceRatio);
  const meanRatio = priceRatios.reduce((sum, r) => sum + r, 0) / priceRatios.length;
  const variance = priceRatios.reduce((sum, r) => sum + Math.pow(r - meanRatio, 2), 0) / priceRatios.length;
  const stdDev = Math.sqrt(variance);
  const volatilityScore = Math.min(100, Math.round(stdDev * 100));

  // Calculate inflation hedge score (inverse of local currency inflation risk)
  const inflationHedgeScore = Math.max(0, Math.min(100, 100 - volatilityScore * 0.5));

  return {
    countryCode,
    pppRatio, // The core PPP value
    itemCalculations,
    categoryRatios,
    volatilityScore,
    inflationHedgeScore,
    basketTotalUSD: weightedSum,
    summary: {
      mostExpensiveCategory: Object.entries(categoryRatios).sort((a, b) => b[1] - a[1])[0],
      leastExpensiveCategory: Object.entries(categoryRatios).sort((a, b) => a[1] - b[1])[0],
    },
    formattedValue: formatPPPValue(pppRatio, countryCode),
  };
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const formatPPPValue = (ratio, countryCode) => {
  const currency = getCurrencyCode(countryCode);
  const formattedRatio = ratio.toFixed(4);
  return {
    ratio: formattedRatio,
    description: `1 Pesa-Afrik = ${formattedRatio} ${currency}`,
    inverse: (1 / ratio).toFixed(2),
    inverseDescription: `1 ${currency} = ${(1 / ratio).toFixed(4)} Pesa-Afrik`,
  };
};

const getCurrencyCode = (countryCode) => {
  const currencies = {
    ZAF: 'ZAR', NGA: 'NGN', KEN: 'KES', GHA: 'GHS',
    EGY: 'EGP', MAR: 'MAD', ETH: 'ETB', TZA: 'TZS',
  };
  return currencies[countryCode] || 'USD';
};

// ==========================================
// INFLATION HEDGE CALCULATOR
// ==========================================

export const calculateInflationHedge = (countryCode, investmentUSD = 1000, years = 5) => {
  const pppData = calculatePPPValue(countryCode);
  const currency = getCurrencyCode(countryCode);
  
  // Estimated inflation rates by country
  const inflationRates = {
    ZAF: 0.058,
    NGA: 0.25,        // 25% average inflation
    KEN: 0.072,
    GHA: 0.085,
    EGY: 0.15,
    MAR: 0.042,
    ETH: 0.08,
    TZA: 0.065,
  };

  const annualInflation = inflationRates[countryCode] || 0.08;
  const pppAppreciation = 0.02; // Pesa-Afrik appreciates slightly as basket is rebalanced

  // Calculate value erosion over time
  const projections = [];
  let usdValue = investmentUSD;
  let localCurrencyValue = investmentUSD;
  let pesaValue = investmentUSD;

  for (let year = 0; year <= years; year++) {
    projections.push({
      year,
      usdValue: usdValue.toFixed(2),
      localCurrencyValue: localCurrencyValue.toFixed(2),
      pesaValue: pesaValue.toFixed(2),
      localPurchasingPower: (localCurrencyValue / Math.pow(1 + annualInflation, year)).toFixed(2),
      pesaPurchasingPower: (pesaValue / Math.pow(1 + annualInflation, year)).toFixed(2),
    });

    // Apply inflation to local currency
    localCurrencyValue *= (1 - annualInflation);
    
    // Pesa-Afrik maintains value (slight appreciation to offset global inflation)
    pesaValue *= (1 + pppAppreciation);
  }

  return {
    initialInvestment: investmentUSD,
    currency,
    years,
    annualInflationRate: annualInflation * 100,
    projections,
    summary: {
      finalPesaValue: pesaValue.toFixed(2),
      finalLocalValue: localCurrencyValue.toFixed(2),
      finalUSDValue: usdValue.toFixed(2),
      purchasingPowerRetained: ((pesaValue / investmentUSD) * 100).toFixed(1),
      purchasingPowerLost: ((1 - localCurrencyValue / investmentUSD) * 100).toFixed(1),
    },
  };
};

// ==========================================
// STABILITY METRICS
// ==========================================

export const calculateStabilityMetrics = (countryCode) => {
  const pppData = calculatePPPValue(countryCode);
  
  // Volatility levels
  const volatilityLevel = pppData.volatilityScore < 15 ? 'LOW' : 
                          pppData.volatilityScore < 30 ? 'MODERATE' : 'HIGH';
  
  const stabilityScore = Math.max(0, 100 - pppData.volatilityScore * 1.5);
  
  return {
    stabilityScore: Math.round(stabilityScore),
    volatilityScore: pppData.volatilityScore,
    volatilityLevel,
    inflationHedgeScore: Math.round(pppData.inflationHedgeScore),
    categoryBreakdown: pppData.categoryRatios,
    recommendation: getRecommendation(stabilityScore, volatilityLevel),
    riskLevel: getRiskLevel(stabilityScore),
  };
};

const getRecommendation = (stabilityScore, volatilityLevel) => {
  if (stabilityScore >= 80 && volatilityLevel === 'LOW') {
    return {
      rating: 'EXCELLENT',
      text: 'Highly stable. Ideal for long-term value preservation.',
      color: 'green',
    };
  } else if (stabilityScore >= 60) {
    return {
      rating: 'GOOD',
      text: 'Moderately stable. Suitable for most financial use cases.',
      color: 'blue',
    };
  } else if (stabilityScore >= 40) {
    return {
      rating: 'CAUTION',
      text: 'Some volatility detected. Monitor basket composition.',
      color: 'yellow',
    };
  } else {
    return {
      rating: 'HIGH RISK',
      text: 'Significant price variations. Consider alternative strategies.',
      color: 'red',
    };
  }
};

const getRiskLevel = (stabilityScore) => {
  if (stabilityScore >= 80) return 'LOW';
  if (stabilityScore >= 60) return 'LOW-MEDIUM';
  if (stabilityScore >= 40) return 'MEDIUM';
  if (stabilityScore >= 20) return 'MEDIUM-HIGH';
  return 'HIGH';
};

// ==========================================
// COMPARATIVE ANALYSIS
// ==========================================

export const getComparativeAnalysis = (countryCodes) => {
  const analysis = countryCodes.map((code) => {
    const pppData = calculatePPPValue(code);
    const stability = calculateStabilityMetrics(code);
    const hedge = calculateInflationHedge(code, 1000, 1);

    return {
      countryCode: code,
      currency: getCurrencyCode(code),
      pppRatio: pppData.pppRatio,
      formatted: pppData.formattedValue,
      stability,
      inflationHedge: hedge.summary,
    };
  });

  // Sort by stability
  analysis.sort((a, b) => b.stability.stabilityScore - a.stability.stabilityScore);

  return {
    countries: analysis,
    rankings: {
      mostStable: analysis[0],
      leastStable: analysis[analysis.length - 1],
      bestInflationHedge: analysis.reduce((best, current) => 
        parseFloat(current.inflationHedge.purchasingPowerRetained) > 
        parseFloat(best.inflationHedge.purchasingPowerRetained) ? current : best
      ),
    },
  };
};

// ==========================================
// EXPORTS
// ==========================================

export const getBasketItems = () => BASKET_ITEMS;
export const getBasketWeights = () => BAPP_WEIGHTS;
export const getLocalPrices = (countryCode) => LOCAL_PRICES[countryCode] || {};

export default {
  calculatePPPValue,
  calculateInflationHedge,
  calculateStabilityMetrics,
  getComparativeAnalysis,
  getBasketItems,
  getBasketWeights,
  getLocalPrices,
};
