import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, 
  BarChart3, PieChart, Shield, AlertTriangle, 
  CheckCircle, Info, RefreshCw, ArrowRight,
  Calculator, Globe, Zap, Target, ArrowUpRight
} from 'lucide-react';
import { 
  calculatePPPValue, 
  calculateInflationHedge, 
  calculateStabilityMetrics,
  getComparativeAnalysis,
  getBasketItems,
  getLocalPrices
} from '../services/pppAlgorithm';

const BasketPage = () => {
  const [selectedCountries, setSelectedCountries] = useState(['ZAF', 'NGA', 'KEN', 'GHA']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [analysisMode, setAnalysisMode] = useState('comparison');
  const [isLoading, setIsLoading] = useState(true);

  const africanCountries = [
    { code: 'ZAF', name: 'South Africa', currency: 'ZAR' },
    { code: 'NGA', name: 'Nigeria', currency: 'NGN' },
    { code: 'KEN', name: 'Kenya', currency: 'KES' },
    { code: 'GHA', name: 'Ghana', currency: 'GHS' },
    { code: 'EGY', name: 'Egypt', currency: 'EGP' },
    { code: 'MAR', name: 'Morocco', currency: 'MAD' },
    { code: 'ETH', name: 'Ethiopia', currency: 'ETB' },
    { code: 'TZA', name: 'Tanzania', currency: 'TZS' },
    { code: 'UGA', name: 'Uganda', currency: 'UGX' },
    { code: 'CMR', name: 'Cameroon', currency: 'XAF' },
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: PieChart },
    { id: 'food_staple', name: 'Food Staples', icon: Target },
    { id: 'protein', name: 'Proteins', icon: Activity },
    { id: 'fuel_energy', name: 'Fuel & Energy', icon: Zap },
    { id: 'utilities', name: 'Utilities', icon: Globe },
    { id: 'housing', name: 'Housing', icon: Shield },
  ];

  const basketItems = getBasketItems();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const pppData = useMemo(() => {
    return getComparativeAnalysis(selectedCountries);
  }, [selectedCountries]);

  const hedgeData = useMemo(() => {
    return selectedCountries.map(code => ({
      country: code,
      ...calculateInflationHedge(code, investmentAmount, timeHorizon),
      ppp: calculatePPPValue(code),
    }));
  }, [selectedCountries, investmentAmount, timeHorizon]);

  const toggleCountry = (code) => {
    if (selectedCountries.includes(code)) {
      if (selectedCountries.length > 1) {
        setSelectedCountries(selectedCountries.filter(c => c !== code));
      }
    } else {
      if (selectedCountries.length < 5) {
        setSelectedCountries([...selectedCountries, code]);
      }
    }
  };

  const formatCurrency = (value, currency) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M ${currency}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K ${currency}`;
    }
    return `${value.toFixed(2)} ${currency}`;
  };

  const getScoreColor = (score) => {
    if (score >= 70) return { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Strong' };
    if (score >= 50) return { bg: 'bg-amber-500', text: 'text-amber-600', label: 'Moderate' };
    return { bg: 'bg-red-500', text: 'text-red-600', label: 'Weak' };
  };

  const getVolatilityColor = (vol) => {
    if (vol < 15) return 'text-emerald-600 bg-emerald-50';
    if (vol < 30) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 mt-4 font-medium">Loading basket data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                Commodity Basket Analysis
              </h1>
              <p className="text-slate-600">
                Weighted geometric mean index for real purchasing power comparison across African markets
              </p>
            </div>
            <div className="flex gap-2">
              {['comparison', 'hedge', 'stability'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAnalysisMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    analysisMode === mode
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex flex-wrap items-end gap-6">
            {/* Country Selection */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                Compare Markets (Max 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {africanCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      selectedCountries.includes(country.code)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {country.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="min-w-[180px]">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                Basket Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-primary-600"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hedge Calculator Controls */}
            {analysisMode === 'hedge' && (
              <>
                <div className="min-w-[150px]">
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                    Investment (USD)
                  </label>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-primary-600"
                  />
                </div>
                <div className="min-w-[120px]">
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                    Time Horizon
                  </label>
                  <select
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-primary-600"
                  >
                    {[1, 2, 3, 5, 10].map((y) => (
                      <option key={y} value={y}>{y} Year{y > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* COMPARISON MODE */}
        {analysisMode === 'comparison' && (
          <>
            {/* PPP Value Cards - Clean horizontal layout */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {pppData.countries.map((country) => {
                const scoreColor = getScoreColor(country.stability.stabilityScore);
                return (
                  <div
                    key={country.countryCode}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-slate-900">{country.countryCode}</p>
                        <p className="text-xs text-slate-500">{country.currency}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${scoreColor.text} ${scoreColor.bg}/10`}>
                        {country.stability.riskLevel}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-3xl font-bold text-slate-900 font-mono">{country.formatted.ratio}</p>
                      <p className="text-xs text-slate-500 mt-1">per Pesa-Afrik</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Stability</p>
                        <p className={`font-semibold ${scoreColor.text}`}>{country.stability.stabilityScore}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Volatility</p>
                        <p className={`font-semibold ${
                          country.stability.volatilityScore < 15 ? 'text-emerald-600' :
                          country.stability.volatilityScore < 30 ? 'text-amber-600' : 'text-red-600'
                        }`}>{country.stability.volatilityScore}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Breakdown Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <h2 className="font-semibold text-slate-900">Category Price Ratios</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Info className="w-4 h-4" />
                    <span>Ratio = Local Price / Global Reference Price</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Category
                      </th>
                      {selectedCountries.map((code) => (
                        <th key={code} className="px-4 py-4 text-center">
                          <p className="text-sm font-semibold text-slate-700">{code}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries({
                      food_staple: 'Food Staples',
                      protein: 'Proteins',
                      fuel_energy: 'Fuel & Energy',
                      utilities: 'Utilities',
                      housing: 'Housing',
                    }).map(([catId, catName]) => (
                      <tr key={catId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{catName}</p>
                          <p className="text-xs text-slate-500">
                            {catId === 'food_staple' ? '30%' : 
                             catId === 'protein' ? '20%' : 
                             catId === 'fuel_energy' ? '25%' : 
                             catId === 'utilities' ? '15%' : '10%'} weight
                          </p>
                        </td>
                        {selectedCountries.map((code) => {
                          const ratio = pppData.countries.find(c => c.countryCode === code)
                            ?.ppp?.categoryRatios?.[catId];
                          const maxRatio = Math.max(
                            ...selectedCountries.map(c => 
                              pppData.countries.find(x => x.countryCode === c)?.ppp?.categoryRatios?.[catId] || 0
                            )
                          );
                          const isHighest = ratio === maxRatio && ratio > 0;
                          
                          return (
                            <td key={code} className="px-4 py-4 text-center">
                              <span className={`font-mono font-medium ${
                                isHighest ? 'text-red-600' : 'text-slate-700'
                              }`}>
                                {ratio?.toFixed(2) || '—'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Most Stable Market</h3>
                    <p className="text-sm text-slate-500">{pppData.rankings.mostStable.countryCode} - Score: {pppData.rankings.mostStable.stability.stabilityScore}/100</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm pl-13">
                  {pppData.rankings.mostStable.stability.recommendation.text}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Best Inflation Hedge</h3>
                    <p className="text-sm text-slate-500">{pppData.rankings.bestInflationHedge.countryCode} - {pppData.rankings.bestInflationHedge.inflationHedge.purchasingPowerRetained}% power retained</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm pl-13">
                  Superior protection against local currency erosion compared to holding fiat
                </p>
              </div>
            </div>
          </>
        )}

        {/* HEDGE MODE */}
        {analysisMode === 'hedge' && (
          <>
            {/* Investment Calculator Results */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {hedgeData.map((data) => (
                <div
                  key={data.country}
                  className="bg-white rounded-xl border border-slate-200 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="font-semibold text-slate-900">{data.country}</p>
                      <p className="text-xs text-slate-500">{data.currency}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-400" />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-3">After {timeHorizon} Years</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Pesa-Afrik</p>
                          <p className="text-lg font-bold text-emerald-600">
                            ${parseFloat(data.summary.finalPesaValue).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Local</p>
                          <p className="text-lg font-bold text-red-600">
                            ${parseFloat(data.summary.finalLocalValue).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">USD</p>
                          <p className="text-lg font-bold text-slate-700">
                            ${parseFloat(data.summary.finalUSDValue).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Power Retained</span>
                      <span className="font-semibold text-emerald-600">
                        {data.summary.purchasingPowerRetained}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600">Power Lost</span>
                      <span className="font-semibold text-red-600">
                        {data.summary.purchasingPowerLost}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* The Case for Pesa-Afrik */}
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-6">
                Why Pesa-Afrik Matters
              </h3>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="pl-4 border-l-2 border-primary-200">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Inflation Protection</h4>
                  <p className="text-sm text-slate-600">
                    African currencies average 8-25% annual inflation. Pesa-Afrik's basket-backed value maintains purchasing power regardless of local devaluation.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-emerald-200">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Cross-Border Value</h4>
                  <p className="text-sm text-slate-600">
                    Unlike volatile cryptocurrencies or weakening fiat, Pesa-Afrik's value derives from real goods relevant across African markets.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-amber-200">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Stability Through Diversification</h4>
                  <p className="text-sm text-slate-600">
                    The weighted basket across 5 categories reduces single-point failure risk. Even if one category fluctuates, others stabilize overall value.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STABILITY MODE */}
        {analysisMode === 'stability' && (
          <>
            {/* Stability Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {selectedCountries.map((code) => {
                const stability = calculateStabilityMetrics(code);
                const ppp = calculatePPPValue(code);
                const scoreColor = getScoreColor(stability.stabilityScore);
                
                return (
                  <div
                    key={code}
                    className="bg-white rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-semibold text-slate-900">{code}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        stability.volatilityLevel === 'LOW'
                          ? 'bg-emerald-100 text-emerald-700'
                          : stability.volatilityLevel === 'MODERATE'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {stability.volatilityLevel}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Stability Score</span>
                        <span className="font-medium">{stability.stabilityScore}/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${scoreColor.bg}`}
                          style={{ width: `${stability.stabilityScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Inflation Hedge</span>
                        <span className="font-medium text-slate-700">{stability.inflationHedgeScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Risk Level</span>
                        <span className={`font-medium ${
                          stability.riskLevel === 'LOW' ? 'text-emerald-600' :
                          stability.riskLevel.includes('HIGH') ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {stability.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-600" />
                Market Recommendations
              </h3>
              
              <div className="space-y-3">
                {selectedCountries.map((code) => {
                  const stability = calculateStabilityMetrics(code);
                  
                  return (
                    <div
                      key={code}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{code}</p>
                        <p className="text-xs text-slate-500 mt-1">{stability.recommendation.text}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Score</p>
                          <p className="font-semibold text-slate-900">{stability.stabilityScore}</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          stability.recommendation.color === 'green' ? 'bg-emerald-100 text-emerald-700' :
                          stability.recommendation.color === 'blue' ? 'bg-primary-100 text-primary-700' :
                          stability.recommendation.color === 'yellow' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {stability.recommendation.rating}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Methodology: Weighted Geometric Mean Index based on household expenditure patterns</p>
          <p className="mt-1">Basket: Food Staples 30% | Proteins 20% | Fuel & Energy 25% | Utilities 15% | Housing 10%</p>
        </div>
      </div>
    </div>
  );
};

export default BasketPage;
