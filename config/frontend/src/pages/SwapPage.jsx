import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, RefreshCw, Wallet, Shield, Zap, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SwapPage = () => {
  const { user, wallets, isAuthenticated } = useAuth();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('PESA');
  const [toCurrency, setToCurrency] = useState('ZAR');
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [exchangeRate, setExchangeRate] = useState(18.50);
  const [marketData, setMarketData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});

  const currencies = [
    { symbol: 'PESA', name: 'Pesa-Afrik', type: 'crypto', icon: 'P' },
    { symbol: 'ZAR', name: 'South African Rand', type: 'fiat', icon: 'R' },
    { symbol: 'NGN', name: 'Nigerian Naira', type: 'fiat', icon: '₦' },
    { symbol: 'KES', name: 'Kenyan Shilling', type: 'fiat', icon: 'K' },
  ];

  // Fetch exchange rates from API
  const fetchExchangeRates = useCallback(async () => {
    try {
      const pppData = await api.ppp.getGlobal();
      
      if (pppData && pppData.countries) {
        const rates = {};
        pppData.countries.forEach(country => {
          rates[`PESA-${country.currency}`] = country.tokenValue;
          rates[`${country.currency}-PESA`] = 1 / country.tokenValue;
        });
        setExchangeRates(rates);
        setExchangeRate(rates[`PESA-${toCurrency}`] || 18.50);
        
        setMarketData({
          volume24h: '1250000',
          price: rates[`PESA-ZAR`] || 18.50,
          change24h: '+0.02',
          stabilityScore: 78
        });
      }
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
      // Use default rates on error
      const defaultRates = {
        'PESA-ZAR': 18.50,
        'PESA-NGN': 1450,
        'PESA-KES': 155,
        'ZAR-PESA': 0.054,
        'NGN-PESA': 0.00069,
        'KES-PESA': 0.0065,
      };
      setExchangeRates(defaultRates);
      setExchangeRate(defaultRates[`PESA-${toCurrency}`] || 18.50);
    }
  }, [toCurrency]);

  // Fetch rates on mount and when currency changes
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  // Get user balance for selected currency
  const getUserBalance = useCallback(() => {
    if (fromCurrency === 'PESA' && wallets && wallets.length > 0) {
      const defaultWallet = wallets.find(w => w.isDefault) || wallets[0];
      return parseFloat(defaultWallet?.balance || 0);
    }
    return 0;
  }, [fromCurrency, wallets]);

  // Swap currencies
  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  // Handle from amount change
  const handleFromAmountChange = (e) => {
    const value = e.target.value;
    setFromAmount(value);
    setError(null);
    setSuccess(null);
    
    if (value && parseFloat(value) > 0) {
      const calculated = parseFloat(value) * exchangeRate;
      setToAmount(calculated.toFixed(2));
    } else {
      setToAmount('');
    }
  };

  // Handle execute swap
  const handleExecuteSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!isAuthenticated) {
      setError('Please sign in to perform swaps');
      return;
    }

    const balance = getUserBalance();
    if (parseFloat(fromAmount) > balance) {
      setError('Insufficient balance');
      return;
    }

    setIsSwapping(true);
    setError(null);
    setSuccess(null);

    try {
      const wallet = wallets.find(w => w.isDefault) || wallets[0];
      
      if (!wallet) {
        throw new Error('No wallet found');
      }

      const response = await api.transactions.create(
        localStorage.getItem('accessToken'),
        {
          fromAddress: wallet.address,
          fromCurrency,
          toCurrency,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(toAmount),
          exchangeRate,
          slippage
        }
      );

      if (response) {
        setSuccess(`Successfully swapped ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}`);
        setFromAmount('');
        setToAmount('');
        
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Swap error:', err);
      setError(err.message || 'Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  // Calculate minimum received with slippage
  const getMinReceive = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return '0.00';
    return (parseFloat(fromAmount) * exchangeRate * (1 - slippage / 100)).toFixed(2);
  };

  // Calculate network fee (0.1% for PESA transactions)
  const getNetworkFee = () => {
    if (fromCurrency !== 'PESA') return '0';
    const fee = parseFloat(fromAmount || 0) * 0.001;
    return fee.toFixed(4);
  };

  // Get currency icon background class
  const getCurrencyIconClass = (type) => {
    switch (type) {
      case 'crypto':
        return 'bg-gradient-to-br from-primary-100 to-gold-100 text-primary-600';
      case 'stablecoin':
        return 'bg-blue-100 text-blue-600';
      case 'fiat':
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  // Get currency symbol for display
  const getCurrencySymbol = (symbol) => {
    switch (symbol) {
      case 'ZAR': return 'R';
      case 'NGN': return '₦';
      case 'KES': return 'K';
      default: return symbol;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
            Swap Pesa-Afrik
          </h1>
          <p className="text-slate-600">
            Exchange between Pesa and African fiat currencies with fair PPP-based rates
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Swap Interface */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Success/Error Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800 text-sm">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* From Section */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <label className="font-medium text-slate-700">You Pay</label>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-slate-400" />
                    {isAuthenticated ? (
                      <span className="text-sm text-slate-500">
                        Balance: {getUserBalance().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PESA
                      </span>
                    ) : (
                      <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
                        Sign in
                      </Link>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={handleFromAmountChange}
                    placeholder="0.00"
                    className="flex-1 text-3xl font-semibold text-slate-900 bg-transparent 
                             border-none outline-none placeholder-slate-300"
                    disabled={isSwapping}
                  />
                  
                  <div className="relative">
                    <select
                      value={fromCurrency}
                      onChange={(e) => {
                        setFromCurrency(e.target.value);
                        setExchangeRate(exchangeRates[`PESA-${e.target.value}`] || 1);
                      }}
                      className="appearance-none bg-slate-100 rounded-lg px-4 py-2 pr-10 
                               font-medium text-slate-900 cursor-pointer hover:bg-slate-200 transition-colors"
                      disabled={isSwapping}
                    >
                      {currencies.map((curr) => (
                        <option key={curr.symbol} value={curr.symbol}>
                          {curr.symbol}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ArrowDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-slate-500">
                  {getCurrencySymbol(fromCurrency)}{(parseFloat(fromAmount || 0) * exchangeRate).toFixed(2)} {fromCurrency}
                </div>
              </div>

              {/* Swap Button */}
              <div className="px-6 py-4 flex justify-center">
                <button
                  onClick={handleSwap}
                  className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center
                           text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  disabled={isSwapping}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* To Section */}
              <div className="p-6 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="font-medium text-slate-700">You Receive</label>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.00"
                    className="flex-1 text-3xl font-semibold text-slate-900 bg-transparent 
                             border-none outline-none placeholder-slate-300"
                    disabled={isSwapping}
                  />
                  
                  <div className="relative">
                    <select
                      value={toCurrency}
                      onChange={(e) => {
                        setToCurrency(e.target.value);
                        setExchangeRate(exchangeRates[`PESA-${e.target.value}`] || 1);
                      }}
                      className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 
                               font-medium text-slate-900 cursor-pointer hover:bg-slate-50 transition-colors"
                      disabled={isSwapping}
                    >
                      {currencies.map((curr) => (
                        <option key={curr.symbol} value={curr.symbol}>
                          {curr.symbol}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ArrowDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-slate-500">
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </div>
              </div>

              {/* Swap Details */}
              <div className="px-6 py-4 border-t border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Exchange Rate</span>
                    <span className="text-slate-900">1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Slippage Tolerance</span>
                    <span className="text-slate-900">{slippage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Network Fee</span>
                    <span className="text-slate-900">{getNetworkFee()} PESA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Minimum Received</span>
                    <span className="text-slate-900">{getMinReceive()} {toCurrency}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="px-6 py-4 border-t border-slate-200">
                <button
                  onClick={handleExecuteSwap}
                  disabled={!fromAmount || isLoading || isSwapping || (!isAuthenticated)}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSwapping ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : !isAuthenticated ? (
                    'Sign In to Swap'
                  ) : !fromAmount ? (
                    'Enter Amount'
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Swap Now</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-gold-50 border border-primary-100 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium text-primary-800">Fair PPP-Based Pricing</p>
                  <p className="text-sm text-primary-700 mt-1">
                    Exchange rates are calculated using Pesa-Afrik's Purchasing Power Parity algorithm, 
                    ensuring fair value across African currencies without speculation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Market Info</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">24h Volume</span>
                  <span className="font-medium text-slate-900">
                    {getCurrencySymbol(toCurrency)}{(marketData?.volume24h ? parseFloat(marketData.volume24h).toLocaleString() : '1,250,000')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">PESA Price</span>
                  <span className="font-medium text-slate-900">
                    {getCurrencySymbol(toCurrency)}{(marketData?.price || exchangeRate).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">24h Change</span>
                  <span className={`font-medium ${parseFloat(marketData?.change24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketData?.change24h || '+0.02'}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Stability Score</span>
                  <span className="font-medium text-primary-600">
                    {marketData?.stabilityScore || 78}%
                  </span>
                </div>
              </div>
            </div>

            {/* Supported Currencies */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Supported Currencies</h3>
              <div className="space-y-3">
                {currencies.map((curr) => (
                  <div key={curr.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCurrencyIconClass(curr.type)}`}>
                        <span className="text-xs font-bold">
                          {curr.icon}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{curr.name}</p>
                        <p className="text-xs text-slate-500">{curr.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      curr.type === 'fiat' ? 'bg-slate-100 text-slate-600' :
                      curr.type === 'stablecoin' ? 'bg-blue-100 text-blue-600' :
                      'bg-primary-100 text-primary-600'
                    }`}>
                      Supported
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slippage Settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Slippage Tolerance</h3>
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      slippage === value
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>

            {/* Help Link */}
            <a 
              href="#" 
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <ExternalLink className="w-4 h-4" />
              View swap documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;
