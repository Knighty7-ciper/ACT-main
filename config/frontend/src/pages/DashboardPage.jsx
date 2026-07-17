import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Shield, Globe, RefreshCw, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardPage = () => {
  const { user, wallets, transactions, isAuthenticated, logout, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [countryData, setCountryData] = useState(null);
  const [error, setError] = useState(null);

  // Use transactions from AuthContext
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      setRecentTransactions(transactions.slice(0, 5));
    }
  }, [transactions]);

  // Calculate total balance from wallets
  const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || 0), 0);

  // Fetch PPP basket data
  const fetchBasketData = useCallback(async () => {
    try {
      const response = await api.ppp.getValue(user?.countryCode || 'ZAF');
      if (response) {
        setCountryData({
          tokenValue: response.tokenValue,
          basketTotal: response.basketTotal,
          stabilityScore: response.stabilityScore,
          countryCode: user?.countryCode || 'ZAF',
          currency: response.currency || 'ZAR',
          commodities: response.commodities || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch basket data:', err);
      // Set default data on error
      setCountryData({
        tokenValue: 18.50,
        basketTotal: 2800,
        stabilityScore: 78,
        countryCode: user?.countryCode || 'ZAF',
        currency: 'ZAR',
        commodities: []
      });
    }
  }, [user?.countryCode]);

  // Fetch user transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.transactions.getRecent();
      if (response) {
        setRecentTransactions(response.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      // Keep existing transactions on error
    }
  }, []);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Refresh user data from AuthContext
      await refreshUserData();

      // Fetch basket and transaction data in parallel
      await Promise.all([
        fetchBasketData(),
        fetchTransactions()
      ]);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load some dashboard data. Please refresh to try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshUserData, fetchBasketData, fetchTransactions]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  // Load data on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadDashboardData]);

  // Copy address to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
      console.log('Address copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format transaction type for display
  const formatTransactionType = (type) => {
    const typeMap = {
      'transfer': 'Transfer',
      'receive': 'Receive',
      'send': 'Send',
      'swap': 'Swap',
      'stake': 'Stake',
      'unstake': 'Unstake'
    };
    return typeMap[type?.toLowerCase()] || type || 'Transaction';
  };

  // Get transaction icon and color
  const getTransactionIcon = (type) => {
    const normalizedType = type?.toLowerCase();
    switch (normalizedType) {
      case 'receive':
        return { icon: ArrowDownLeft, colorClass: 'bg-green-100', iconClass: 'text-green-600' };
      case 'send':
        return { icon: ArrowUpRight, colorClass: 'bg-red-100', iconClass: 'text-red-600' };
      case 'swap':
        return { icon: RefreshCw, colorClass: 'bg-primary-100', iconClass: 'text-primary-600' };
      default:
        return { icon: RefreshCw, colorClass: 'bg-slate-100', iconClass: 'text-slate-600' };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Please sign in to access your dashboard
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn-primary">Sign In</Link>
            <Link to="/register" className="btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Welcome back, {user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 text-sm">{error}</p>
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="skeleton h-4 w-24 mb-4 rounded" />
                <div className="skeleton h-8 w-32 mb-2 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Balance Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-gold-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Balance</p>
                      <p className="font-semibold text-slate-700">Pesa-Afrik</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Pesa
                </div>
                <div className="flex items-center gap-2 text-primary-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+5.2% this month</span>
                </div>
              </motion.div>

              {/* PPP Value Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Token Value</p>
                      <p className="font-semibold text-slate-700">PPP Adjusted</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {countryData?.currency || 'ZAR'} {countryData?.tokenValue?.toLocaleString() || '18.50'}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="text-sm">
                    1 Pesa = {countryData?.currency || 'ZAR'} {countryData?.tokenValue?.toLocaleString() || '18.50'}
                  </span>
                </div>
              </motion.div>

              {/* Stability Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gold-100 to-primary-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Stability Score</p>
                      <p className="font-semibold text-slate-700">Region: {countryData?.countryCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {countryData?.stabilityScore || 78}%
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-gold-400 to-primary-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${countryData?.stabilityScore || 78}%` }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Wallet Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">Your Wallets</h2>
                    <Link to="/swap" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      <RefreshCw className="w-4 h-4" />
                      Swap
                    </Link>
                  </div>
                  
                  <div className="divide-y divide-slate-200">
                    {wallets && wallets.length > 0 ? (
                      wallets.map((wallet) => (
                        <div key={wallet.id} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900">
                                  {wallet.type?.charAt(0).toUpperCase() + wallet.type?.slice(1) || 'Main'} Wallet
                                </p>
                                {wallet.isDefault && (
                                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <code className="bg-slate-100 px-2 py-0.5 rounded">
                                  {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'No address'}
                                </code>
                                {wallet.address && (
                                  <button
                                    onClick={() => copyToClipboard(wallet.address)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                    title="Copy address"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              {parseFloat(wallet.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Pesa
                            </p>
                            <p className="text-sm text-slate-500">
                              {countryData?.currency || 'ZAR'} {((parseFloat(wallet.balance || 0)) * (countryData?.tokenValue || 18.50)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center">
                        <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 mb-4">No wallet linked yet</p>
                        <Link to="/swap" className="btn-primary inline-flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Create Wallet
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Recent Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Recent Activity</h2>
                  <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    View All
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                  {recentTransactions && recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => {
                      const { icon: Icon, colorClass, iconClass } = getTransactionIcon(tx.type);
                      return (
                        <div key={tx.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                                <Icon className={`w-4 h-4 ${iconClass}`} />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {formatTransactionType(tx.type)}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : tx.date || 'Recently'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                tx.type?.toLowerCase() === 'receive' || tx.type?.toLowerCase() === 'receive' 
                                  ? 'text-green-600' 
                                  : 'text-slate-900'
                              }`}>
                                {tx.type?.toLowerCase() === 'receive' || tx.type?.toLowerCase() === 'receive' ? '+' : '-' }
                                {parseFloat(tx.amount || tx.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Pesa
                              </p>
                              <p className="text-xs text-slate-500 capitalize">
                                {tx.status || 'confirmed'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <RefreshCw className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No transactions yet</p>
                      <p className="text-slate-400 text-xs mt-1">Your activity will appear here</p>
                    </div>
                  )}
                </div>

                {recentTransactions && recentTransactions.length > 0 && (
                  <div className="px-6 py-4 border-t border-slate-200">
                    <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      View All Transactions
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Basket Value Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-gradient-to-r from-primary-600 to-gold-500 rounded-xl p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Your Balance in Real Terms</h3>
                  <p className="text-primary-100 text-sm">
                    Current balance can purchase goods worth this much in your region
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {countryData?.currency || 'ZAR'} {(totalBalance * (countryData?.tokenValue || 18.50)).toFixed(2)}
                  </div>
                  <div className="text-primary-100 text-sm">
                    Based on PPP basket value
                  </div>
                </div>
              </div>
            </motion.div>

            {/* PPP Basket Details (Collapsible) */}
            {countryData?.commodities && countryData.commodities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">PPP Basket Composition</h3>
                </div>
                <div className="p-6 grid md:grid-cols-3 gap-4">
                  {countryData.commodities.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">{item.name}</span>
                      <span className="font-medium text-slate-900">{countryData?.currency || 'ZAR'} {item.value?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
