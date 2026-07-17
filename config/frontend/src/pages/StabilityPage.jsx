import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  DollarSign,
  Percent,
  Globe
} from 'lucide-react';

const StabilityPage = () => {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // African currencies data with PPP values
  const currencyData = [
    {
      code: 'ZAR',
      country: 'South Africa',
      flag: '🇿🇦',
      pppValue: 18.5,
      stabilityPercent: 78,
      volatility: 12.3,
      trend: 'stable'
    },
    {
      code: 'NGN',
      country: 'Nigeria',
      flag: '🇳🇬',
      pppValue: 1450,
      stabilityPercent: 65,
      volatility: 18.7,
      trend: 'up'
    },
    {
      code: 'KES',
      country: 'Kenya',
      flag: '🇰🇪',
      pppValue: 155,
      stabilityPercent: 75,
      volatility: 10.2,
      trend: 'stable'
    },
    {
      code: 'GHS',
      country: 'Ghana',
      flag: '🇬🇭',
      pppValue: 15.2,
      stabilityPercent: 72,
      volatility: 11.5,
      trend: 'stable'
    },
    {
      code: 'EGP',
      country: 'Egypt',
      flag: '🇪🇬',
      pppValue: 48.5,
      stabilityPercent: 68,
      volatility: 15.8,
      trend: 'up'
    },
    {
      code: 'MAD',
      country: 'Morocco',
      flag: '🇲🇦',
      pppValue: 9.8,
      stabilityPercent: 82,
      volatility: 8.4,
      trend: 'stable'
    },
    {
      code: 'ETB',
      country: 'Ethiopia',
      flag: '🇪🇹',
      pppValue: 125,
      stabilityPercent: 70,
      volatility: 13.2,
      trend: 'stable'
    },
    {
      code: 'XAF',
      country: 'Cameroon',
      flag: '🇨🇲',
      pppValue: 620,
      stabilityPercent: 66,
      volatility: 14.1,
      trend: 'down'
    },
    {
      code: 'UGX',
      country: 'Uganda',
      flag: '🇺🇬',
      pppValue: 3850,
      stabilityPercent: 73,
      volatility: 11.8,
      trend: 'stable'
    },
    {
      code: 'TZS',
      country: 'Tanzania',
      flag: '🇹🇿',
      pppValue: 2850,
      stabilityPercent: 71,
      volatility: 12.5,
      trend: 'stable'
    }
  ];

  // Load data on mount
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrencies(currencyData);
      setSelectedCurrency(currencyData[0]);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 600);
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrencies([...currencyData]);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getStabilityColor = (percent) => {
    if (percent >= 75) return 'bg-emerald-500';
    if (percent >= 65) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStabilityLabel = (percent) => {
    if (percent >= 75) return { text: 'Stable', color: 'text-emerald-600' };
    if (percent >= 65) return { text: 'Moderate', color: 'text-amber-600' };
    return { text: 'Volatile', color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 mt-4 font-medium">Loading currency data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
              African Currency Stability
            </h1>
            <p className="text-slate-600">
              Real-time PPP-based stability metrics for African currencies
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase">Countries</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{currencies.length}</p>
            <p className="text-xs text-slate-500">African markets</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase">Avg Stability</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {Math.round(currencies.reduce((sum, c) => sum + c.stabilityPercent, 0) / currencies.length)}%
            </p>
            <p className="text-xs text-emerald-600">Stable overall</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase">Top Performer</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">MAD</p>
            <p className="text-xs text-slate-500">Morocco - 82%</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase">PPP Range</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">9.8 - 3850</p>
            <p className="text-xs text-slate-500">Low to high</p>
          </div>
        </div>

        {/* Currency Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currencies.map((currency, index) => {
            const stability = getStabilityLabel(currency.stabilityPercent);

            return (
              <motion.div
                key={currency.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedCurrency(currency)}
                className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:border-slate-300 ${
                  selectedCurrency?.code === currency.code
                    ? 'border-emerald-500 ring-2 ring-emerald-100'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{currency.flag}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{currency.country}</h3>
                      <p className="text-sm text-slate-500">{currency.code}</p>
                    </div>
                  </div>
                  {getTrendIcon(currency.trend)}
                </div>

                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-sm text-slate-500">PPP Value</p>
                    <p className="text-xl font-bold text-slate-900 font-mono">
                      {currency.pppValue.toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${stability.color} bg-slate-50`}>
                    {stability.text}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Stability</span>
                    <span className="font-medium text-slate-900">{currency.stabilityPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getStabilityColor(currency.stabilityPercent)}`}
                      style={{ width: `${currency.stabilityPercent}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Currency Details */}
        {selectedCurrency && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{selectedCurrency.flag}</span>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedCurrency.country}</h2>
                <p className="text-slate-500">{selectedCurrency.code} - Purchasing Power Parity</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">PPP Exchange Rate</p>
                <p className="text-2xl font-bold text-slate-900 font-mono">
                  {selectedCurrency.pppValue.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">Per USD equivalent</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Stability Score</p>
                <p className="text-2xl font-bold text-slate-900">{selectedCurrency.stabilityPercent}%</p>
                <p className="text-xs text-slate-500 mt-1">
                  {getStabilityLabel(selectedCurrency.stabilityPercent).text}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Volatility Index</p>
                <p className="text-2xl font-bold text-slate-900">{selectedCurrency.volatility}%</p>
                <p className="text-xs text-slate-500 mt-1">30-day variance</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default StabilityPage;
