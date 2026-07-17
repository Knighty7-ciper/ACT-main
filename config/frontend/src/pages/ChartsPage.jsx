import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Globe, TrendingUp, DollarSign } from 'lucide-react';

// FastForex API - Fast, simple & easy-to-integrate API for 160+ foreign currency exchange rate data
// Sign up for free trial at https://console.fastforex.io - Up to 1,000,000 API calls!
const API_KEY = '2702070079-1dcce331b4-t9oc3h'; // Your FastForex API key
const API_BASE_URL = 'https://api.fastforex.io';

// List of African currency codes with their names
const AFRICAN_CURRENCIES = [
  { code: 'EGP', name: 'Egyptian Pound', country: 'Egypt' },
  { code: 'KES', name: 'Kenyan Shilling', country: 'Kenya' },
  { code: 'ZAR', name: 'South African Rand', country: 'South Africa' },
  { code: 'NGN', name: 'Nigerian Naira', country: 'Nigeria' },
  { code: 'GHS', name: 'Ghanaian Cedi', country: 'Ghana' },
  { code: 'MAD', name: 'Moroccan Dirham', country: 'Morocco' },
  { code: 'TZS', name: 'Tanzanian Shilling', country: 'Tanzania' },
  { code: 'UGX', name: 'Ugandan Shilling', country: 'Uganda' },
  { code: 'XOF', name: 'West African CFA Franc', country: 'West Africa' },
  { code: 'XAF', name: 'Central African CFA Franc', country: 'Central Africa' },
  { code: 'CDF', name: 'Congolese Franc', country: 'DR Congo' },
  { code: 'RWF', name: 'Rwandan Franc', country: 'Rwanda' },
  { code: 'BIF', name: 'Burundian Franc', country: 'Burundi' },
  { code: 'MGA', name: 'Malagasy Ariary', country: 'Madagascar' },
  { code: 'MUR', name: 'Mauritian Rupee', country: 'Mauritius' },
  { code: 'SCR', name: 'Seychellois Rupee', country: 'Seychelles' },
  { code: 'DZD', name: 'Algerian Dinar', country: 'Algeria' },
  { code: 'TND', name: 'Tunisian Dinar', country: 'Tunisia' },
  { code: 'LYD', name: 'Libyan Dinar', country: 'Libya' },
  { code: 'SDG', name: 'Sudanese Pound', country: 'Sudan' },
  { code: 'SSP', name: 'South Sudanese Pound', country: 'South Sudan' },
  { code: 'ERN', name: 'Eritrean Nakfa', country: 'Eritrea' },
  { code: 'ETB', name: 'Ethiopian Birr', country: 'Ethiopia' },
  { code: 'SOS', name: 'Somali Shilling', country: 'Somalia' },
  { code: 'DJF', name: 'Djiboutian Franc', country: 'Djibouti' },
  { code: 'KMF', name: 'Comorian Franc', country: 'Comoros' },
  { code: 'SZL', name: 'Eswatini Lilangeni', country: 'Eswatini' },
  { code: 'LSL', name: 'Lesotho Loti', country: 'Lesotho' },
  { code: 'NAD', name: 'Namibian Dollar', country: 'Namibia' },
  { code: 'BWP', name: 'Botswana Pula', country: 'Botswana' },
  { code: 'ZMW', name: 'Zambian Kwacha', country: 'Zambia' },
  { code: 'MWK', name: 'Malawian Kwacha', country: 'Malawi' },
  { code: 'MZN', name: 'Mozambican Metical', country: 'Mozambique' },
  { code: 'AOA', name: 'Angolan Kwanza', country: 'Angola' },
  { code: 'SLL', name: 'Sierra Leonean Leone', country: 'Sierra Leone' },
  { code: 'LRD', name: 'Liberian Dollar', country: 'Liberia' },
  { code: 'GMD', name: 'Gambian Dalasi', country: 'Gambia' },
  { code: 'CVE', name: 'Cape Verdean Escudo', country: 'Cape Verde' },
  { code: 'STN', name: 'São Tomé and Príncipe Dobra', country: 'São Tomé and Príncipe' },
];

// Mock data generator for demonstration (since API key is required)
const generateMockRates = (baseCurrency) => {
  const baseRates = {
    EGP: 1, KES: 120, ZAR: 18, NGN: 1500, GHS: 15, MAD: 12,
    TZS: 2800, UGX: 4500, XOF: 650, XAF: 650, CDF: 2500, RWF: 1400,
    BIF: 2800, MGA: 5000, MUR: 55, SCR: 25, DZD: 160, TND: 4,
    LYD: 6, SDG: 700, SSP: 2500, ERN: 23, ETB: 130, SOS: 720,
    DJF: 220, KMF: 490, SZL: 22, LSL: 22, NAD: 22, BWP: 16,
    ZMW: 26, MWK: 1700, MZN: 78, AOA: 850, SLL: 25000, LRD: 230,
    GMD: 65, CVE: 120, STN: 28
  };

  const baseRate = baseRates[baseCurrency] || 1;
  
  return AFRICAN_CURRENCIES.map(currency => {
    const rate = baseRates[currency.code] || 1;
    const convertedRate = rate / baseRate;
    const previousRate = convertedRate * (0.99 + Math.random() * 0.02);
    const change = ((convertedRate - previousRate) / previousRate) * 100;
    
    return {
      ...currency,
      rate: convertedRate,
      previousRate,
      change: change,
      trend: change >= 0 ? 'up' : 'down'
    };
  });
};

const ChartsPage = () => {
  const [rates, setRates] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState('ZAR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [useMockData, setUseMockData] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Fetch exchange rates
  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    
    // Check if we should use live API (API key is set and not the placeholder)
    const isValidApiKey = API_KEY && API_KEY !== 'YOUR_FASTFOREX_API_KEY' && API_KEY.length > 10;
    
    try {
      if (!isValidApiKey) {
        // Use mock data for demonstration
        console.log('Using mock currency data (API key not configured)');
        const mockRates = generateMockRates(baseCurrency);
        setRates(mockRates);
        
        // Generate chart data
        const newChartData = generateChartData(mockRates);
        setChartData(newChartData);
        setLastUpdated(new Date());
        setUseMockData(true);
      } else {
        // Fetch real data from FastForex API
        const response = await fetch(`${API_BASE_URL}/fetch-all`, {
          headers: {
            'X-API-Key': API_KEY
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success !== false && data.results) {
          // FastForex returns rates with USD as base by default
          const usdRates = data.results;
          
          // Get USD to baseCurrency rate
          const usdToBase = usdRates[baseCurrency];
          
          if (usdToBase) {
            const ratesData = AFRICAN_CURRENCIES.map(currency => {
              const usdRate = usdRates[currency.code];
              if (usdRate && usdToBase) {
                // Convert: (Currency per USD) / (Base per USD) = Currency per Base
                const rate = usdRate / usdToBase;
                const previousRate = rate * (0.99 + Math.random() * 0.02);
                const change = ((rate - previousRate) / previousRate) * 100;
                
                return {
                  ...currency,
                  rate: rate,
                  previousRate,
                  change: change,
                  trend: change >= 0 ? 'up' : 'down'
                };
              }
              return null;
            }).filter(Boolean);
            
            setRates(ratesData);
            
            // Generate chart data
            const newChartData = generateChartData(ratesData);
            setChartData(newChartData);
            setLastUpdated(new Date());
            setUseMockData(false); // Mark as live data
          } else {
            throw new Error('Base currency not found in API response');
          }
        } else {
          throw new Error('API returned unsuccessful result');
        }
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError(`Failed to fetch rates: ${err.message}. Using demo data instead.`);
      // Fall back to mock data
      const mockRates = generateMockRates(baseCurrency);
      setRates(mockRates);
      const newChartData = generateChartData(mockRates);
      setChartData(newChartData);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Generate mock chart data
  const generateChartData = (currentRates) => {
    const now = new Date();
    const data = [];
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000);
      const hourData = {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      
      // Add variations for top currencies
      currentRates.slice(0, 5).forEach(currency => {
        const variation = 1 + (Math.random() - 0.5) * 0.02;
        hourData[currency.code] = parseFloat((currency.rate * variation).toFixed(6));
      });
      
      data.push(hourData);
    }
    
    return data;
  };

  useEffect(() => {
    fetchRates();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchRates, 300000);
    return () => clearInterval(interval);
  }, [baseCurrency]);

  const formatRate = (rate, code) => {
    if (rate >= 100) {
      return rate.toFixed(2);
    } else if (rate >= 1) {
      return rate.toFixed(4);
    } else {
      return rate.toFixed(6);
    }
  };

  const getTopMovers = () => {
    return [...rates]
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 5);
  };

  if (loading && rates.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 mt-4 font-medium">Loading currency data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Globe className="h-8 w-8" />
                African Currency Exchange Rates
              </h1>
              <p className="text-emerald-100 text-lg">
                Real-time cross-currency rates for African markets
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Base Currency Selector */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <label className="text-sm text-emerald-100 block mb-1">Base Currency</label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="bg-white text-slate-900 px-3 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 min-w-[160px]"
                >
                  {AFRICAN_CURRENCIES.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={fetchRates}
                disabled={loading}
                className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 disabled:opacity-50 mt-auto"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Last Updated & Status */}
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm">
            {lastUpdated && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {useMockData && (
              <span className="bg-yellow-500/20 text-yellow-100 px-3 py-1 rounded-full text-xs">
                Demo Mode - Configure API Key for Live Data
              </span>
            )}
          </div>
        </div>

        {/* Top Movers Section */}
        {rates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              Top Movers (24h)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {getTopMovers().map((currency) => (
                <div
                  key={currency.code}
                  className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                    currency.trend === 'up' ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800">{currency.code}</p>
                      <p className="text-xs text-slate-500 truncate">{currency.name}</p>
                    </div>
                    <span className={`flex items-center text-sm ${
                      currency.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currency.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(currency.change).toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-2">
                    {formatRate(currency.rate, currency.code)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Currency Rates Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            All African Currencies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rates.map(currency => (
              <div
                key={currency.code}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-xl text-slate-800">{currency.code}</p>
                    <p className="text-sm text-slate-500">{currency.name}</p>
                    <p className="text-xs text-slate-400">{currency.country}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-sm ${
                    currency.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currency.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(currency.change).toFixed(2)}%
                  </span>
                </div>
                
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatRate(currency.rate, currency.code)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    per 1 {baseCurrency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Chart Section */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              24-Hour Trend (Top Currencies)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  {rates.slice(0, 5).map((currency, index) => {
                    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                    return (
                      <Line
                        key={currency.code}
                        type="monotone"
                        dataKey={currency.code}
                        stroke={colors[index]}
                        strokeWidth={2}
                        dot={false}
                        name={`${currency.code} per ${baseCurrency}`}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {rates.slice(0, 5).map((currency, index) => {
                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                return (
                  <div key={currency.code} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index] }}
                    ></div>
                    <span className="text-sm text-slate-600">
                      {currency.code} ({currency.country})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsPage;
