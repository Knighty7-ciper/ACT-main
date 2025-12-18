/**
 * user/dashboard.tsx - Professional Trading Platform Dashboard
 * Enterprise-grade user dashboard with advanced analytics and trading tools
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../lib/hooks/useUser';
import { supabase } from '../../lib/supabase';
import {
  CurrencyDollarIcon,
  UserIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CubeTransparentIcon,
  SparklesIcon,
  BoltIcon,
  FireIcon,
  TrophyIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  PlusIcon,
  MinusIcon,
  PlayIcon,
  PauseIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ShareIcon,
  BookmarkIcon,
  HeartIcon,
  HandRaisedIcon,
  AdjustmentsHorizontalIcon,
  SignalIcon,
  CpuChipIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CommandLineIcon,
  CloudIcon,
  LightBulbIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  ClockIcon as ClockOutlineIcon,
  GlobeAltIcon as GlobeOutlineIcon,
  ChartPieIcon,
  PresentationChartBarIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarIcon,
  PaintBrushIcon,
  DocumentDuplicateIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';

// TypeScript interfaces
interface WalletData {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  frozen_balance: number;
  last_transaction_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description?: string;
}

interface KYCRequest {
  id: string;
  user_id: string;
  status: string;
  level: string;
  created_at: string;
  updated_at: string;
}

interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change24h: number;
  changePercent24h: number;
  allocation: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  available: boolean;
  badge?: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function UserDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useUser();
  
  // State management
  const [dashboardData, setDashboardData] = useState({
    wallet: null as WalletData | null,
    recentTransactions: [] as Transaction[],
    pendingRequests: [] as KYCRequest[],
    kycStatus: null as string | null,
    quickStats: null as any
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'portfolio' | 'trading'>('overview');
  const [notifications, setNotifications] = useState(3);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch wallet data
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch recent transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch pending KYC requests
      const { data: requestsData } = await supabase
        .from('kyc_requests')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved', 'in_progress'])
        .order('created_at', { ascending: false });

      setDashboardData({
        wallet: walletData,
        recentTransactions: transactionsData || [],
        pendingRequests: requestsData || [],
        kycStatus: profile?.kyc_status,
        quickStats: {
          totalTransactions: transactionsData?.length || 0,
          pendingRequests: requestsData?.filter(r => r.status === 'pending').length || 0,
          lastLogin: profile?.last_login_at,
          accountAge: Math.floor((Date.now() - new Date(profile?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)),
          totalPortfolioValue: walletData?.balance || 0
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  // Simulate real-time market data
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData([
        {
          symbol: 'ACT/USD',
          price: 2.847 + (Math.random() - 0.5) * 0.02,
          change24h: 12.34 + (Math.random() - 0.5) * 2,
          changePercent24h: 12.34 + (Math.random() - 0.5) * 2,
          volume24h: 87456 + Math.random() * 1000,
          marketCap: 427183920 + Math.random() * 1000000
        },
        {
          symbol: 'BTC/USD',
          price: 67450.89 + (Math.random() - 0.5) * 100,
          change24h: -2.15 + (Math.random() - 0.5) * 5,
          changePercent24h: -2.15 + (Math.random() - 0.5) * 5,
          volume24h: 24567890 + Math.random() * 1000000,
          marketCap: 1320000000000 + Math.random() * 10000000000
        },
        {
          symbol: 'ETH/USD',
          price: 3245.67 + (Math.random() - 0.5) * 50,
          change24h: 3.45 + (Math.random() - 0.5) * 3,
          changePercent24h: 3.45 + (Math.random() - 0.5) * 3,
          volume24h: 12345678 + Math.random() * 500000,
          marketCap: 390000000000 + Math.random() * 5000000000
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Generate portfolio data
  useEffect(() => {
    const portfolioData: PortfolioAsset[] = [
      {
        symbol: 'ACT',
        name: 'ACT Token',
        balance: dashboardData.wallet?.balance || 0,
        value: (dashboardData.wallet?.balance || 0) * 2.847,
        change24h: 12.34,
        changePercent24h: 12.34,
        allocation: 85
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: 0.05,
        value: 3372.54,
        change24h: -2.15,
        changePercent24h: -2.15,
        allocation: 10
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: 0.5,
        value: 1622.83,
        change24h: 3.45,
        changePercent24h: 3.45,
        allocation: 5
      }
    ];
    setPortfolio(portfolioData);
  }, [dashboardData.wallet]);

  // Generate alerts
  useEffect(() => {
    const alertsData: Alert[] = [
      {
        id: '1',
        type: 'info',
        title: 'Market Update',
        message: 'ACT token price increased by 12.34% in the last 24 hours',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'success',
        title: 'Transaction Completed',
        message: 'Your recent ACT purchase of $500 has been processed successfully',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      {
        id: '3',
        type: 'warning',
        title: 'KYC Verification',
        message: 'Your KYC verification is pending review. Expected completion: 1-2 business days',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false
      }
    ];
    setAlerts(alertsData);
  }, []);

  // Handle quick actions
  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'buy-act':
        router.push('/user/act-purchase');
        break;
      case 'view-wallet':
        router.push('/user/wallet');
        break;
      case 'kyc-upload':
        router.push('/user/kyc');
        break;
      case 'request-help':
        router.push('/user/request-admin-help');
        break;
      case 'view-analytics':
        router.push('/user/analytics');
        break;
      case 'trading':
        router.push('/user/trading');
        break;
      case 'settings':
        router.push('/user/settings');
        break;
      case 'export-data':
        // Handle data export
        toast.success('Data export initiated. You will receive an email when ready.');
        break;
      default:
        break;
    }
  }, [router]);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      id: 'buy-act',
      title: 'Buy ACT Tokens',
      description: 'Purchase ACT tokens with competitive rates',
      icon: CurrencyDollarIcon,
      color: 'from-blue-500 to-blue-600',
      action: () => handleQuickAction('buy-act'),
      available: true,
      badge: 'Popular'
    },
    {
      id: 'view-wallet',
      title: 'View Wallet',
      description: 'Check balances and transaction history',
      icon: BanknotesIcon,
      color: 'from-green-500 to-green-600',
      action: () => handleQuickAction('view-wallet'),
      available: true
    },
    {
      id: 'kyc-upload',
      title: 'KYC Verification',
      description: profile?.kyc_status === 'verified' ? 'KYC Completed' : 'Complete verification',
      icon: ShieldCheckIcon,
      color: profile?.kyc_status === 'verified' ? 'from-gray-500 to-gray-600' : 'from-orange-500 to-orange-600',
      action: () => handleQuickAction('kyc-upload'),
      available: true,
      badge: profile?.kyc_status === 'verified' ? 'Completed' : 'Required'
    },
    {
      id: 'trading',
      title: 'Start Trading',
      description: 'Access advanced trading tools',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600',
      action: () => handleQuickAction('trading'),
      available: true,
      badge: 'Pro'
    },
    {
      id: 'view-analytics',
      title: 'Portfolio Analytics',
      description: 'View detailed performance metrics',
      icon: ChartPieIcon,
      color: 'from-cyan-500 to-cyan-600',
      action: () => handleQuickAction('view-analytics'),
      available: true
    },
    {
      id: 'request-help',
      title: 'Get Support',
      description: 'Contact our support team',
      icon: UserGroupIcon,
      color: 'from-indigo-500 to-indigo-600',
      action: () => handleQuickAction('request-help'),
      available: true
    }
  ];

  // Load data on component mount
  useEffect(() => {
    if (user && profile) {
      fetchDashboardData();
    }
  }, [user, profile, fetchDashboardData]);

  // Format currency
  const formatCurrency = (value: number, currency = 'USD'): string => {
    const formatters: Record<string, Intl.NumberFormat> = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      KES: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }),
    };
    return formatters[currency]?.format(value) || value.toFixed(2);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm">Fetching latest trading data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <CubeTransparentIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ACT Exchange
                </h1>
                <p className="text-xs text-gray-400">Professional Trading</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: PresentationChartBarIcon },
                { id: 'portfolio', label: 'Portfolio', icon: ChartPieIcon },
                { id: 'trading', label: 'Trading', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    activeView === tab.id
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg">
                <ClockIcon className="h-4 w-4" />
                <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
              </div>

              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {showBalance ? <EyeIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>

              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <BellIcon className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              <Link href="/user/settings" className="p-2 text-gray-400 hover:text-white transition-colors">
                <Cog6ToothIcon className="h-5 w-5" />
              </Link>

              <div className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-white font-medium">{profile?.full_name || 'User'}</div>
                  <div className="text-gray-400 text-xs">{profile?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Welcome Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Trader'}!
            </h1>
            <p className="text-gray-400 text-lg">
              Your trading dashboard is ready. Monitor your portfolio and execute trades.
            </p>
          </div>

          {/* Overview Mode */}
          {activeView === 'overview' && (
            <div className="space-y-8">
              
              {/* Portfolio Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <CurrencyDollarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center text-green-400 text-sm">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      +12.34%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Total Portfolio Value</p>
                    <p className="text-white font-bold text-2xl">
                      {showBalance ? formatCurrency(portfolio.reduce((sum, asset) => sum + asset.value, 0)) : '••••••'}
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <BanknotesIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Available Balance</p>
                    <p className="text-white font-bold text-2xl">
                      {showBalance ? formatCurrency(dashboardData.wallet?.balance || 0) : '••••••'}
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">24h P&L</p>
                    <p className="text-white font-bold text-2xl">
                      {showBalance ? formatCurrency(347.82) : '••••••'}
                    </p>
                    <p className="text-green-400 text-sm flex items-center">
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                      +8.2%
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dashboardData.kycStatus === 'verified' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {dashboardData.kycStatus === 'verified' ? 'Verified' : 'Pending'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">KYC Status</p>
                    <p className="text-white font-bold text-xl capitalize">
                      {dashboardData.kycStatus || 'Not Started'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                  <Link href="/user/trading" className="text-blue-400 hover:text-blue-300 font-medium flex items-center">
                    View All Tools
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      disabled={!action.available}
                      className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {action.badge && (
                        <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${
                          action.badge === 'Popular' ? 'bg-purple-600 text-white' :
                          action.badge === 'Pro' ? 'bg-blue-600 text-white' :
                          action.badge === 'Completed' ? 'bg-green-600 text-white' :
                          'bg-orange-600 text-white'
                        }`}>
                          {action.badge}
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <h3 className="text-white font-bold text-lg mb-2">{action.title}</h3>
                      <p className="text-gray-400 text-sm">{action.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity & Market Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recent Transactions */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                    <Link href="/user/transactions" className="text-blue-400 hover:text-blue-300 text-sm">
                      View All
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'buy' ? 'bg-green-600/20' : 'bg-red-600/20'
                          }`}>
                            {transaction.type === 'buy' ? (
                              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {transaction.type === 'buy' ? 'Bought' : 'Sold'} {transaction.currency}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <p className={`text-sm ${
                            transaction.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Overview */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Market Overview</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {marketData.map((asset) => (
                      <div key={asset.symbol} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{asset.symbol.split('/')[0]}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{asset.symbol}</p>
                            <p className="text-gray-400 text-sm">
                              Vol: ${(asset.volume24h / 1000000).toFixed(1)}M
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{formatCurrency(asset.price)}</p>
                          <p className={`text-sm flex items-center ${
                            asset.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {asset.changePercent24h >= 0 ? (
                              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(asset.changePercent24h)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Mode */}
          {activeView === 'portfolio' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Portfolio Analytics</h2>
                <p className="text-gray-400">Detailed breakdown of your holdings and performance</p>
              </div>

              {/* Portfolio Table */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Holdings</h3>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showBalance ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                      <span className="text-sm">Toggle Balance</span>
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 text-gray-400 font-medium">Asset</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Balance</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Value</th>
                        <th className="text-right py-3 text-gray-400 font-medium">24h Change</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Allocation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((asset) => (
                        <tr key={asset.symbol} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{asset.symbol}</span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{asset.name}</p>
                                <p className="text-gray-400 text-sm">{asset.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-4 text-white font-medium">
                            {showBalance ? asset.balance.toFixed(4) : '••••'}
                          </td>
                          <td className="text-right py-4 text-white font-bold">
                            {showBalance ? formatCurrency(asset.value) : '••••••'}
                          </td>
                          <td className="text-right py-4">
                            <div className={`flex items-center justify-end ${
                              asset.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {asset.changePercent24h >= 0 ? (
                                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                              )}
                              <span className="font-medium">
                                {formatPercentage(asset.changePercent24h)}
                              </span>
                            </div>
                          </td>
                          <td className="text-right py-4">
                            <div className="flex items-center justify-end space-x-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${asset.allocation}%` }}
                                ></div>
                              </div>
                              <span className="text-white text-sm font-medium">{asset.allocation}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Trading Mode */}
          {activeView === 'trading' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Trading Interface</h2>
                <p className="text-gray-400">Advanced trading tools and order management</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Quick Trade</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Amount (USD)</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Trading Pair</label>
                      <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                        <option value="ACT/USD">ACT/USD</option>
                        <option value="BTC/USD">BTC/USD</option>
                        <option value="ETH/USD">ETH/USD</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                        Buy
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
                        Sell
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Market Data</h3>
                  <div className="space-y-4">
                    {marketData.map((asset) => (
                      <div key={asset.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{asset.symbol}</p>
                          <p className="text-gray-400 text-sm">{formatCurrency(asset.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${
                            asset.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatPercentage(asset.changePercent24h)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}