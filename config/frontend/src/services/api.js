// Pesa-Afrik API Service
// Simplified direct Supabase integration

import { supabase, TABLES } from './supabase.js';

// Browser-compatible base64 encoding
const base64Encode = (str) => {
  try {
    return btoa(str);
  } catch (e) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    }));
  }
};

// PPP Data for African countries (fallback)
const pppData = {
  ZAF: { tokenValue: 18.50, stabilityScore: 78, inflationRate: 5.8, basketTotal: 2800, currency: 'ZAR' },
  NGA: { tokenValue: 1450, stabilityScore: 65, inflationRate: 18.5, basketTotal: 125000, currency: 'NGN' },
  KEN: { tokenValue: 155, stabilityScore: 75, inflationRate: 7.2, basketTotal: 18500, currency: 'KES' },
  GHA: { tokenValue: 15.20, stabilityScore: 72, inflationRate: 8.5, basketTotal: 920, currency: 'GHS' },
  EGY: { tokenValue: 48.50, stabilityScore: 68, inflationRate: 12.5, basketTotal: 7500, currency: 'EGP' },
  MAR: { tokenValue: 9.80, stabilityScore: 82, inflationRate: 4.2, basketTotal: 950, currency: 'MAD' },
  ETH: { tokenValue: 58, stabilityScore: 70, inflationRate: 8.0, basketTotal: 4500, currency: 'ETB' },
  TZA: { tokenValue: 2450, stabilityScore: 74, inflationRate: 6.5, basketTotal: 180000, currency: 'TZS' },
};

// Commodity basket prices
const basketPrices = {
  ZAF: [
    { name: 'Rice (2kg)', price: 45, currency: 'ZAR' },
    { name: 'Wheat Flour (2kg)', price: 28, currency: 'ZAR' },
    { name: 'Chicken Breast (1kg)', price: 85, currency: 'ZAR' },
    { name: 'Eggs (12)', price: 55, currency: 'ZAR' },
    { name: 'Diesel (1L)', price: 22, currency: 'ZAR' },
    { name: 'Electricity (100kWh)', price: 180, currency: 'ZAR' },
  ],
  NGA: [
    { name: 'Rice (2kg)', price: 2800, currency: 'NGN' },
    { name: 'Wheat Flour (2kg)', price: 1500, currency: 'NGN' },
    { name: 'Chicken Breast (1kg)', price: 4500, currency: 'NGN' },
    { name: 'Eggs (12)', price: 1800, currency: 'NGN' },
    { name: 'Diesel (1L)', price: 1200, currency: 'NGN' },
    { name: 'Electricity (100kWh)', price: 25000, currency: 'NGN' },
  ],
  KEN: [
    { name: 'Rice (2kg)', price: 280, currency: 'KES' },
    { name: 'Wheat Flour (2kg)', price: 180, currency: 'KES' },
    { name: 'Chicken Breast (1kg)', price: 650, currency: 'KES' },
    { name: 'Eggs (12)', price: 300, currency: 'KES' },
    { name: 'Diesel (1L)', price: 180, currency: 'KES' },
    { name: 'Electricity (100kWh)', price: 4000, currency: 'KES' },
  ],
};

// API Service
const api = {
  // ==========================================
  // PPP endpoints
  // ==========================================
  
  ppp: {
    async getValue(countryCode) {
      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from(TABLES.PPP_DATA)
          .select('*')
          .eq('country_code', countryCode)
          .single();
        
        if (!error && data) {
          return {
            countryCode: data.country_code,
            currency: data.currency_code,
            tokenValue: data.ppp_conversion_rate,
            basketTotal: data.total_ppp_value || 2800,
            stabilityScore: Math.round(data.inflation_rate ? Math.max(0, 100 - data.inflation_rate * 2) : 75),
            inflationRate: data.inflation_rate,
            volatilityIndex: data.inflation_rate ? data.inflation_rate / 100 : 0.08
          };
        }
      } catch (err) {
        console.warn('PPP fetch from Supabase failed, using fallback:', err);
      }
      
      // Fallback to local data
      await new Promise(resolve => setTimeout(resolve, 50));
      const data = pppData[countryCode];
      
      return data ? {
        countryCode,
        currency: data.currency,
        tokenValue: data.tokenValue,
        basketTotal: data.basketTotal,
        stabilityScore: data.stabilityScore,
        inflationRate: data.inflationRate,
        volatilityIndex: data.stabilityScore > 80 ? 0.04 : data.stabilityScore > 60 ? 0.08 : 0.15
      } : {
        countryCode,
        currency: 'ZAR',
        tokenValue: 18.50,
        basketTotal: 2800,
        stabilityScore: 75,
        inflationRate: 6.0,
        volatilityIndex: 0.08
      };
    },
    
    async getGlobal() {
      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from(TABLES.PPP_DATA)
          .select('*')
          .order('ppp_conversion_rate', { ascending: false });
        
        if (!error && data && data.length > 0) {
          const countries = data.map(d => ({
            countryCode: d.country_code,
            currency: d.currency_code,
            tokenValue: d.ppp_conversion_rate,
            stabilityScore: Math.round(d.inflation_rate ? Math.max(0, 100 - d.inflation_rate * 2) : 75),
            basketTotal: d.total_ppp_value || 2800,
            inflationRate: d.inflation_rate
          }));
          
          return {
            countries,
            statistics: {
              totalCountries: countries.length,
              averageStability: countries.reduce((sum, c) => sum + c.stabilityScore, 0) / countries.length
            }
          };
        }
      } catch (err) {
        console.warn('Global PPP fetch from Supabase failed, using fallback:', err);
      }
      
      // Fallback to local data
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const countries = Object.entries(pppData).map(([code, data]) => ({
        countryCode: code,
        currency: data.currency,
        tokenValue: data.tokenValue,
        stabilityScore: data.stabilityScore,
        basketTotal: data.basketTotal,
        inflationRate: data.inflationRate
      }));
      
      return {
        countries,
        statistics: {
          totalCountries: countries.length,
          averageStability: countries.reduce((sum, c) => sum + c.stabilityScore, 0) / countries.length
        }
      };
    },
    
    async getBasketPrices(countries) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const countryList = countries.split(',').map(c => c.trim().toUpperCase());
      const result = {};
      countryList.forEach(code => {
        result[code] = basketPrices[code] || basketPrices.ZAF;
      });
      return result;
    },
    
    async getStabilityRanking() {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const ranking = Object.entries(pppData)
        .map(([code, data]) => ({
          countryCode: code,
          currency: data.currency,
          tokenValue: data.tokenValue,
          stabilityScore: data.stabilityScore,
          inflationRate: data.inflationRate,
          basketTotal: data.basketTotal,
          status: data.stabilityScore >= 80 ? 'stable' : data.stabilityScore >= 60 ? 'moderate' : 'unstable'
        }))
        .sort((a, b) => b.stabilityScore - a.stabilityScore);
      
      return {
        ranking,
        totalCountries: ranking.length,
        statistics: {
          totalCountries: ranking.length,
          averageStability: ranking.reduce((sum, c) => sum + c.stabilityScore, 0) / ranking.length,
          highStability: ranking.filter(c => c.stabilityScore >= 80).length,
          moderateStability: ranking.filter(c => c.stabilityScore >= 40 && c.stabilityScore < 80).length,
          lowStability: ranking.filter(c => c.stabilityScore < 40).length,
          averageInflation: ranking.reduce((sum, c) => sum + c.inflationRate, 0) / ranking.length,
        }
      };
    }
  },
  
  // ==========================================
  // Transaction endpoints
  // ==========================================
  
  transactions: {
    async getRecent(limit = 10) {
      await new Promise(resolve => setTimeout(resolve, 50));
      // Return empty for now - can implement with real data later
      return [];
    },
    
    async create(transactionData) {
      // Placeholder for transaction creation
      console.log('Transaction created:', transactionData);
      return {
        id: `tx-${Date.now()}`,
        ...transactionData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }
  }
};

export default api;
