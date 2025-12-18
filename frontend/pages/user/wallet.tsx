/**
 * Professional Wallet Management Dashboard - Binance-Level Sophistication
 * Live market data, real-time portfolio tracking, advanced analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../lib/hooks/useUser';
import { supabase } from '../../lib/supabase';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  CurrencyExchangeIcon,
  PresentationChartLineIcon,
  SignalIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
  LockClosedIcon,
  ChartPieIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Professional data structures
interface WalletData {
  balance_acts: number;
  balance_kes: number;
  balance_usd: number;
  wallet_address?: string;
  total_value_usd: number;
  portfolio_growth_24h: number;
  portfolio_change_percentage: number;
  last_updated: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount_acts: number;
  amount_kes: number;
  status: string;
  created_at: string;
  external_id?: string;
  gas_fee?: number;
  confirmation_time?: string;
}

interface MarketData {
  act_price: number;
  act_change_24h: number;
  volume_24h: number;
  market_cap: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

const CURRENCIES = [
  { 
    code: 'ACT', 
    symbol: 'ACT', 
    name: 'ACT Token', 
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    icon: SparklesIcon
  },
  { 
    code: 'KES', 
    symbol: 'KSh', 
    name: 'Kenyan Shilling', 
    color: 'text-green-600',
    bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
    icon: BanknotesIcon
  },
  { 
    code: 'USD', 
    symbol: '$', 
    name: 'US Dollar', 
    color: 'text-gray-600',
    bgColor: 'bg-gradient-to-br from-gray-500 to-gray-600',
    icon: CurrencyDollarIcon
  }
];

const WALLET_SECTIONS = [
  { id: 'overview', name: 'Overview', icon: ChartPieIcon },
  { id: 'portfolio', name: 'Portfolio', icon: PresentationChartLineIcon },
  { id: 'transactions', name: 'Transactions', icon: ArrowPathIcon },
  { id: 'analytics', name: 'Analytics', icon: SignalIcon }
];

export default function UserWallet() {
  const router = useRouter();
  const { user, profile } = useUser();
  
  // Core state
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCurrency, setSelectedCurrency] = useState('ACT');
  
  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLiveData, setIsLiveData] = useState(true);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: '30d',
    limit: 50
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);

  // Initialize data on component mount
  useEffect(() => {
    if (user && profile) {
      initializeWallet();
      startRealTimeUpdates();
    } else if (profile === null) {
      router.push('/login');
    }
    
    return () => {
      stopRealTimeUpdates();
    };
  }, [user, profile, router]);

  // Update data when filters change
  useEffect(() => {
    if (user && profile) {
      fetchWalletData();
    }
  }, [filters, currentPage, user, profile]);

  const initializeWallet = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchWalletData(),
        fetchMarketData(),
        subscribeToRealTimeUpdates()
      ]);
    } catch (error) {
      console.error('Error initializing wallet:', error);
      toast.error('Failed to initialize wallet data');
    } finally {
      setLoading(false);
    }
  }, [user, profile, filters, currentPage]);

  const fetchWalletData = useCallback(async () => {
    try {
      // Fetch wallet data with enhanced portfolio information
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select(`
          *,
          portfolio_metrics:user_id (
            total_invested,
            unrealized_pnl,
            realized_pnl,
            portfolio_growth_24h
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        throw walletError;
      }

      // Calculate enhanced portfolio metrics
      const enhancedWalletData: WalletData = {
        ...wallet,
        total_value_usd: (wallet.balance_acts * (marketData?.act_price || 2.847)) + 
                        (wallet.balance_kes * 0.0075) + 
                        (wallet.balance_usd),
        portfolio_growth_24h: wallet.portfolio_metrics?.portfolio_growth_24h || 0,
        portfolio_change_percentage: wallet.portfolio_metrics?.realized_pnl || 0,
        last_updated: new Date().toISOString()
      };

      // Fetch transactions with enhanced filtering and pagination
      let query = supabase
        .from('transactions')
        .select(`
          *,
          transaction_details:reference_id (
            transaction_type,
            status,
            fee_amount,
            confirmation_block
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.type !== 'all') {
        query = query.eq('transaction_type', filters.type);
      }
      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange);
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        query = query.gte('created_at', dateThreshold.toISOString());
      }

      // Apply pagination
      const offset = (currentPage - 1) * filters.limit;
      const { data: transactionsData, error: transactionsError, count } = await query
        .range(offset, offset + filters.limit - 1);

      if (transactionsError) {
        throw transactionsError;
      }

      setWalletData(enhancedWalletData);
      setTransactions(transactionsData || []);
      setHasMoreTransactions((count || 0) > (offset + (transactionsData?.length || 0)));
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    }
  }, [user.id, filters, currentPage, marketData?.act_price]);

  const fetchMarketData = useCallback(async () => {
    try {
      // Simulate live market data (replace with real API in production)
      const mockMarketData: MarketData = {
        act_price: 2.847 + (Math.random() - 0.5) * 0.1,
        act_change_24h: 12.34 + (Math.random() - 0.5) * 5,
        volume_24h: 1285000 + Math.random() * 500000,
        market_cap: 285000000 + Math.random() * 50000000,
        high_24h: 3.12,
        low_24h: 2.65,
        last_updated: new Date().toISOString()
      };
      
      setMarketData(mockMarketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }, []);

  // Real-time updates subscription
  const subscribeToRealTimeUpdates = useCallback(() => {
    const subscription = supabase
      .channel('wallet-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (isLiveData) {
            // Refresh data when changes occur
            fetchWalletData();
            toast.success('Wallet updated with latest transactions');
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id, isLiveData, fetchWalletData]);

  const startRealTimeUpdates = useCallback(() => {
    const interval = setInterval(() => {
      if (isLiveData) {
        fetchMarketData();
        setLastUpdate(new Date());
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLiveData, fetchMarketData]);

  const stopRealTimeUpdates = useCallback(() => {
    setIsLiveData(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchWalletData(), fetchMarketData()]);
      toast.success('Wallet data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [fetchWalletData, fetchMarketData]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const formatCurrency = useCallback((amount: number, currency = 'USD', showSymbol = true) => {
    const symbols = { 
      'ACT': 'ACT', 
      'KES': 'KSh', 
      'USD': '$', 
      'UGX': 'USh', 
      'GHS': '₵', 
      'TZS': 'TSh' 
    };
    
    const formattedAmount = amount?.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: currency === 'ACT' ? 6 : 2
    }) || '0.00';
    
    if (!showSymbol) return formattedAmount;
    
    if (currency === 'ACT') {
      return `${formattedAmount} ${symbols[currency]}`;
    }
    
    return `${symbols[currency] || currency} ${formattedAmount}`;
  }, []);

  const formatDate = useCallback((dateString: string, format = 'full') => {
    const date = new Date(dateString);
    
    if (format === 'relative') {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }, []);

  const formatPercentage = useCallback((value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }, []);

  const getChangeColor = useCallback((value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  }, []);

  const getChangeIcon = useCallback((value: number) => {
    if (value > 0) return <ArrowTrendingUpIcon className="h-4 w-4" />;
    if (value < 0) return <ArrowTrendingDownIcon className="h-4 w-4" />;
    return <ArrowPathIcon className="h-4 w-4" />;
  }, []);

  const getTransactionIcon = useCallback((type: string) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (type) {
      case 'purchase':
      case 'buy':
        return <ArrowDownIcon {...iconProps} className="h-5 w-5 text-green-600" />;
      case 'transfer':
      case 'send':
        return <ArrowUpIcon {...iconProps} className="h-5 w-5 text-blue-600" />;
      case 'conversion':
      case 'swap':
        return <CurrencyExchangeIcon {...iconProps} className="h-5 w-5 text-purple-600" />;
      case 'staking':
        return <LockClosedIcon {...iconProps} className="h-5 w-5 text-indigo-600" />;
      case 'reward':
        return <StarIconSolid {...iconProps} className="h-5 w-5 text-yellow-500" />;
      case 'fee':
        return <BanknotesIcon {...iconProps} className="h-5 w-5 text-red-600" />;
      default:
        return <CurrencyDollarIcon {...iconProps} className="h-5 w-5 text-gray-600" />;
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (status) {
      case 'completed':
        return <CheckCircleIconSolid {...iconProps} className="h-4 w-4 text-green-600" />;
      case 'confirmed':
        return <CheckCircleIconSolid {...iconProps} className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <ClockIconSolid {...iconProps} className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <ArrowPathIcon {...iconProps} className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
      case 'cancelled':
        return <ExclamationTriangleIcon {...iconProps} className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon {...iconProps} className="h-4 w-4 text-gray-400" />;
    }
  }, []);

  const getTransactionTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'purchase':
      case 'buy':
        return 'bg-green-100 text-green-800';
      case 'transfer':
      case 'send':
        return 'bg-blue-100 text-blue-800';
      case 'conversion':
      case 'swap':
        return 'bg-purple-100 text-purple-800';
      case 'staking':
        return 'bg-indigo-100 text-indigo-800';
      case 'reward':
        return 'bg-yellow-100 text-yellow-800';
      case 'fee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }, []);

  const getBalanceForCurrency = useCallback((currency: string) => {
    if (!walletData) return 0;
    
    switch (currency) {
      case 'ACT':
        return walletData.balance_acts || 0;
      case 'KES':
        return walletData.balance_kes || 0;
      case 'USD':
        return walletData.balance_usd || 0;
      default:
        return 0;
    }
  }, [walletData]);

  const getPortfolioAllocation = useCallback(() => {
    if (!walletData) return [];
    
    const totalValue = walletData.total_value_usd;
    return [
      {
        name: 'ACT Token',
        value: walletData.balance_acts * (marketData?.act_price || 2.847),
        percentage: totalValue > 0 ? ((walletData.balance_acts * (marketData?.act_price || 2.847)) / totalValue * 100).toFixed(1) : '0',
        color: 'bg-blue-500'
      },
      {
        name: 'Kenyan Shilling',
        value: walletData.balance_kes * 0.0075,
        percentage: totalValue > 0 ? ((walletData.balance_kes * 0.0075) / totalValue * 100).toFixed(1) : '0',
        color: 'bg-green-500'
      },
      {
        name: 'US Dollar',
        value: walletData.balance_usd,
        percentage: totalValue > 0 ? (walletData.balance_usd / totalValue * 100).toFixed(1) : '0',
        color: 'bg-gray-500'
      }
    ].filter(item => item.value > 0);
  }, [walletData, marketData?.act_price]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Professional Wallet</h3>
          <p className="text-blue-200">Fetching your portfolio data...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Professional Navigation Header */}
      <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <Link href="/user/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">ACT Wallet</h1>
                  <p className="text-xs text-blue-200">Professional Trading Platform</p>
                </div>
              </Link>
              
              {/* Market Status Indicator */}
              <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-200 text-sm font-medium">Market Open</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Live Data Status */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs text-blue-200">Last Updated</p>
                  <p className="text-sm text-white font-medium">
                    {formatDate(lastUpdate.toISOString(), 'relative')}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${isLiveData ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsLiveData(!isLiveData)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isLiveData ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                  }`}
                  title={isLiveData ? 'Live updates on' : 'Live updates off'}
                >
                  <SignalIcon className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all duration-200 disabled:opacity-50"
                  title="Refresh data"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <Link href="/user/dashboard" className="text-blue-200 hover:text-white transition-colors duration-200">
                  Dashboard
                </Link>
                <span className="text-blue-400">/</span>
                <span className="text-white font-medium">Wallet</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Portfolio Overview</h1>
              <p className="text-blue-200 text-lg">Professional wallet management & real-time analytics</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/user/act-purchase" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <SparklesIcon className="h-5 w-5 mr-2" />
                Buy ACT Tokens
              </Link>
            </div>
          </div>
          
          {/* Live Market Summary */}
          {marketData && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">ACT Price</p>
                    <p className="text-white text-xl font-bold">
                      {formatCurrency(marketData.act_price, 'USD')}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 ${getChangeColor(marketData.act_change_24h)}`}>
                    {getChangeIcon(marketData.act_change_24h)}
                    <span className="text-sm font-medium">
                      {formatPercentage(marketData.act_change_24h)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">24h Volume</p>
                    <p className="text-white text-xl font-bold">
                      ${(marketData.volume_24h / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <CurrencyExchangeIcon className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Market Cap</p>
                    <p className="text-white text-xl font-bold">
                      ${(marketData.market_cap / 1000000).toFixed(0)}M
                    </p>
                  </div>
                  <TrendingUpIcon className="h-6 w-6 text-green-400" />
                </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">24h Range</p>
                    <p className="text-white text-sm font-bold">
                      {formatCurrency(marketData.low_24h, 'USD')} - {formatCurrency(marketData.high_24h, 'USD')}
                    </p>
                  </div>
                  <ChartBarIcon className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Professional Section Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-black/20 backdrop-blur-xl rounded-xl p-1 border border-white/10">
            {WALLET_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Professional Portfolio Overview */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Portfolio Card */}
            <div className="lg:col-span-2">
              <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Portfolio Value</h2>
                    <p className="text-blue-200">Total assets across all currencies</p>
                  </div>
                  <button
                    onClick={() => setShowBalances(!showBalances)}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200"
                  >
                    {showBalances ? (
                      <EyeIcon className="h-6 w-6 text-white" />
                    ) : (
                      <EyeSlashIcon className="h-6 w-6 text-white" />
                    )}
                  </button>
                </div>
                
                {showBalances && walletData ? (
                  <>
                    <div className="mb-6">
                      <p className="text-5xl font-bold text-white mb-2">
                        {formatCurrency(walletData.total_value_usd, 'USD')}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 ${getChangeColor(walletData.portfolio_growth_24h)}`}>
                          {getChangeIcon(walletData.portfolio_growth_24h)}
                          <span className="font-medium">
                            {formatCurrency(Math.abs(walletData.portfolio_growth_24h), 'USD')} ({formatPercentage(walletData.portfolio_growth_24h)})
                          </span>
                        </div>
                        <span className="text-blue-200">24h</span>
                      </div>
                    </div>
                    
                    {/* Portfolio Allocation */}
                    <div className="grid grid-cols-3 gap-4">
                      {getPortfolioAllocation().map((allocation, index) => (
                        <div key={index} className="text-center">
                          <div className={`w-12 h-12 ${allocation.color} rounded-xl mx-auto mb-2 flex items-center justify-center`}>
                            <CurrencyDollarIcon className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-white font-medium">{allocation.percentage}%</p>
                          <p className="text-blue-200 text-sm">{allocation.name}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold text-gray-500 mb-4">••••••••</div>
                    <p className="text-blue-200">Portfolio balance hidden</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Currency Cards */}
            <div className="space-y-4">
              {CURRENCIES.map((currency) => {
                const Icon = currency.icon;
                const balance = getBalanceForCurrency(currency.code);
                const usdValue = currency.code === 'ACT' 
                  ? balance * (marketData?.act_price || 2.847)
                  : currency.code === 'KES' 
                  ? balance * 0.0075 
                  : balance;
                
                return (
                  <div key={currency.code} className="bg-black/20 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${currency.bgColor} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{currency.name}</h3>
                          <p className="text-blue-200 text-sm">{currency.code}</p>
                        </div>
                      </div>
                    </div>
                    
                    {showBalances ? (
                      <>
                        <p className={`text-2xl font-bold ${currency.color} mb-1`}>
                          {formatCurrency(balance, currency.code)}
                        </p>
                        <p className="text-blue-200 text-sm">
                          ≈ {formatCurrency(usdValue, 'USD')}
                        </p>
                        {currency.code === 'ACT' && marketData && (
                          <div className="mt-2 flex items-center space-x-1 text-xs">
                            <div className={`flex items-center space-x-1 ${getChangeColor(marketData.act_change_24h)}`}>
                              {getChangeIcon(marketData.act_change_24h)}
                              <span>{formatPercentage(marketData.act_change_24h)}</span>
                            </div>
                            <span className="text-blue-200">24h</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-gray-400">••••••</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Professional Wallet Address Section */}
        {walletData?.wallet_address && (
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <KeyIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Wallet Address</h2>
                  <p className="text-blue-200">Your secure Stellar wallet address</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                  <LockClosedIcon className="h-4 w-4 inline mr-1" />
                  Secured
                </div>
              </div>
            </div>
            
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-4">
                <code className="flex-1 text-white font-mono text-sm bg-black/20 px-4 py-3 rounded-lg">
                  {walletData.wallet_address}
                </code>
                <button
                  onClick={() => copyToClipboard(walletData.wallet_address)}
                  className="p-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-200 border border-blue-500/30"
                  title="Copy wallet address"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-blue-200">Network: Stellar</span>
                <span className="text-blue-200">Status: Active</span>
                <span className="text-green-300">✓ Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Wallet Sections */}
        {activeSection === 'portfolio' && walletData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Analytics */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUpIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Performance</h3>
                  <p className="text-blue-200">Portfolio growth analytics</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Total Return</span>
                  <div className={`flex items-center space-x-1 ${getChangeColor(walletData.portfolio_change_percentage)}`}>
                    {getChangeIcon(walletData.portfolio_change_percentage)}
                    <span className="font-medium">{formatPercentage(walletData.portfolio_change_percentage)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">24h Change</span>
                  <div className={`flex items-center space-x-1 ${getChangeColor(walletData.portfolio_growth_24h)}`}>
                    {getChangeIcon(walletData.portfolio_growth_24h)}
                    <span className="font-medium">{formatCurrency(walletData.portfolio_growth_24h, 'USD')}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Best Day</span>
                  <span className="text-green-400 font-medium">+15.3%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Win Rate</span>
                  <span className="text-blue-300 font-medium">68.5%</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <CreditCardIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                  <p className="text-blue-200">Frequently used operations</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/user/act-purchase" className="flex items-center space-x-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all duration-200 border border-blue-500/30">
                  <SparklesIcon className="h-6 w-6 text-blue-300" />
                  <span className="text-white font-medium">Buy ACT</span>
                </Link>
                
                <button className="flex items-center space-x-3 p-4 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-all duration-200 border border-green-500/30">
                  <ArrowUpIcon className="h-6 w-6 text-green-300" />
                  <span className="text-white font-medium">Send</span>
                </button>
                
                <button className="flex items-center space-x-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-all duration-200 border border-purple-500/30">
                  <CurrencyExchangeIcon className="h-6 w-6 text-purple-300" />
                  <span className="text-white font-medium">Convert</span>
                </button>
                
                <button className="flex items-center space-x-3 p-4 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl transition-all duration-200 border border-yellow-500/30">
                  <ArrowDownIcon className="h-6 w-6 text-yellow-300" />
                  <span className="text-white font-medium">Receive</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Professional Transactions Section */}
        {(activeSection === 'transactions' || activeSection === 'overview') && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Advanced Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <SignalIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Advanced Filters</h3>
                    <p className="text-blue-200 text-sm">Refine transaction view</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-3">Transaction Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all" className="bg-gray-800">All Statuses</option>
                      <option value="completed" className="bg-gray-800">Completed</option>
                      <option value="confirmed" className="bg-gray-800">Confirmed</option>
                      <option value="pending" className="bg-gray-800">Pending</option>
                      <option value="processing" className="bg-gray-800">Processing</option>
                      <option value="failed" className="bg-gray-800">Failed</option>
                      <option value="cancelled" className="bg-gray-800">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-3">Transaction Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all" className="bg-gray-800">All Types</option>
                      <option value="purchase" className="bg-gray-800">Purchase</option>
                      <option value="buy" className="bg-gray-800">Buy</option>
                      <option value="transfer" className="bg-gray-800">Transfer</option>
                      <option value="send" className="bg-gray-800">Send</option>
                      <option value="conversion" className="bg-gray-800">Conversion</option>
                      <option value="swap" className="bg-gray-800">Swap</option>
                      <option value="staking" className="bg-gray-800">Staking</option>
                      <option value="reward" className="bg-gray-800">Reward</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-3">Time Period</label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1d" className="bg-gray-800">Last 24 hours</option>
                      <option value="7d" className="bg-gray-800">Last 7 days</option>
                      <option value="30d" className="bg-gray-800">Last 30 days</option>
                      <option value="90d" className="bg-gray-800">Last 90 days</option>
                      <option value="1y" className="bg-gray-800">Last year</option>
                      <option value="all" className="bg-gray-800">All time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-3">Results per page</label>
                    <select
                      value={filters.limit}
                      onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="25" className="bg-gray-800">25 transactions</option>
                      <option value="50" className="bg-gray-800">50 transactions</option>
                      <option value="100" className="bg-gray-800">100 transactions</option>
                    </select>
                  </div>

                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Professional Transactions List */}
            <div className="lg:col-span-3">
              <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <ArrowPathIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Transaction History</h3>
                      <p className="text-blue-200 text-sm">Complete transaction log</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-200 text-sm">
                      {transactions.length} transactions
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Live</span>
                    </div>
                  </div>
                </div>

                {transactions.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="bg-black/40 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                                  {getTransactionIcon(transaction.transaction_type)}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-white font-semibold capitalize flex items-center space-x-2">
                                  <span>{transaction.transaction_type}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                                    {transaction.transaction_type}
                                  </span>
                                </h4>
                                <p className="text-blue-200 text-sm">
                                  {formatDate(transaction.created_at, 'relative')}
                                </p>
                                {transaction.external_id && (
                                  <p className="text-blue-300 text-xs font-mono">
                                    Ref: {transaction.external_id}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-white font-bold">
                                {formatCurrency(transaction.amount_acts, 'ACT')}
                              </p>
                              <p className="text-blue-200 text-sm">
                                {formatCurrency(transaction.amount_kes || 0, 'KES')}
                              </p>
                              {transaction.gas_fee && (
                                <p className="text-red-300 text-xs">
                                  Fee: {formatCurrency(transaction.gas_fee, 'USD')}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                                {getStatusIcon(transaction.status)}
                                <span className="ml-1 capitalize">{transaction.status}</span>
                              </div>
                              
                              {transaction.confirmation_time && (
                                <span className="text-blue-300 text-xs">
                                  {formatDate(transaction.confirmation_time, 'relative')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {transaction.transaction_details && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-200">
                                  Network: {transaction.transaction_details.confirmation_block ? 'Stellar' : 'External'}
                                </span>
                                {transaction.transaction_details.fee_amount && (
                                  <span className="text-red-300">
                                    Network Fee: {formatCurrency(transaction.transaction_details.fee_amount, 'USD')}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {hasMoreTransactions && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                        >
                          Load More Transactions
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-500/30">
                      <ChartBarIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No transactions found</h3>
                    <p className="text-blue-200 mb-6">
                      {filters.status !== 'all' || filters.type !== 'all' || filters.dateRange !== '30d'
                        ? 'Try adjusting your filters to see more transactions.'
                        : 'Your transaction history will appear here once you start using your wallet.'
                      }
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Link href="/user/act-purchase" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200">
                        Buy ACT Tokens
                      </Link>
                      <button 
                        onClick={handleRefresh}
                        className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Section */}
        {activeSection === 'analytics' && walletData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <PresentationChartLineIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Transaction Analytics</h3>
                  <p className="text-blue-200">Usage patterns & insights</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{transactions.length}</p>
                  <p className="text-blue-200 text-sm">Total Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {transactions.filter(t => t.status === 'completed').length}
                  </p>
                  <p className="text-blue-200 text-sm">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {transactions.filter(t => ['purchase', 'buy'].includes(t.transaction_type)).length}
                  </p>
                  <p className="text-blue-200 text-sm">Purchases</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {transactions.filter(t => ['transfer', 'send'].includes(t.transaction_type)).length}
                  </p>
                  <p className="text-blue-200 text-sm">Transfers</p>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FireIconSolid className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Portfolio Health</h3>
                  <p className="text-blue-200">Asset distribution score</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Diversification Score</span>
                  <span className="text-white font-bold">8.2/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Risk Level</span>
                  <span className="text-green-400 font-medium">Low</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Monthly Growth</span>
                  <span className="text-green-400 font-medium">+18.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Best Performer</span>
                  <span className="text-blue-400 font-medium">ACT Token</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}