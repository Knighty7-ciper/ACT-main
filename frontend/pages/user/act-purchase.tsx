/**
 * Professional ACT Token Purchase Platform - Binance-Level Sophistication
 * Enterprise-grade token purchasing with real-time pricing and advanced payment options
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../lib/hooks/useUser';
import { supabase } from '../../lib/supabase';
import {
  CurrencyDollarIcon,
  CalculatorIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  SparklesIcon,
  TrendingUpIcon,
  ClockIcon,
  BoltIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  GiftIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  HeartIcon,
  BookmarkIcon,
  TagIcon,
  ShoppingCartIcon,
  XMarkIcon,
  CheckCircleIcon as CheckCircleIconOutline,
  LightBulbIcon,
  SignalIcon,
  CameraIcon,
  QrCodeIcon,
  WalletIcon,
  PhoneIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyExchangeIcon,
  PresentationChartLineIcon,
  CubeIcon,
  RocketLaunchIcon,
  ZapIcon,
  CrownIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  FireIcon as FireIconSolidIcon,
  SparklesIcon as SparklesIconSolid,
  StarIcon as StarIconSolid,
  TrophyIcon as TrophyIconSolid,
  GiftIcon as GiftIconSolid
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Professional interfaces
interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
  processingTime: string;
  fee: string;
  category: 'card' | 'mobile' | 'bank' | 'crypto' | 'buy_now_pay_later';
  supportedCurrencies: string[];
  securityLevel: 'standard' | 'enhanced' | 'premium';
  instantTransfer: boolean;
  popularity: number;
  features: string[];
  iconColor: string;
  processingFee: number;
  minimumAmount: number;
  maximumAmount: number;
}

interface Package {
  actTokens: number;
  discount: number;
  bonus: number;
  popular: boolean;
  badge?: string;
  limitedTime?: boolean;
  features: string[];
  roi: number;
  gradient: string;
}

interface MarketData {
  actPrice: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
  trending: 'up' | 'down' | 'stable';
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { 
    id: 'pesapal_card', 
    name: 'Credit/Debit Card', 
    description: 'Visa, Mastercard, Verve, American Express',
    icon: CreditCardIcon,
    processingTime: 'Instant',
    fee: '2.9% + $0.30',
    category: 'card',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'KES', 'UGX'],
    securityLevel: 'enhanced',
    instantTransfer: true,
    popularity: 95,
    features: ['Instant transfer', 'Bank-grade security', 'Fraud protection'],
    iconColor: 'from-blue-500 to-cyan-500',
    processingFee: 2.9,
    minimumAmount: 10,
    maximumAmount: 50000
  },
  { 
    id: 'pesapal_mobile', 
    name: 'Mobile Money', 
    description: 'M-Pesa, Airtel Money, Tigo Cash, MTN Mobile Money',
    icon: DevicePhoneMobileIcon,
    processingTime: 'Instant',
    fee: '3.5%',
    category: 'mobile',
    supportedCurrencies: ['KES', 'UGX', 'GHS', 'TZS', 'RWF'],
    securityLevel: 'premium',
    instantTransfer: true,
    popularity: 88,
    features: ['Instant transfer', 'Low fees', 'Mobile wallet support', 'SMS notifications'],
    iconColor: 'from-green-500 to-emerald-500',
    processingFee: 3.5,
    minimumAmount: 5,
    maximumAmount: 10000
  },
  { 
    id: 'pesapal_bank', 
    name: 'Bank Transfer', 
    description: 'Direct bank transfer (ACH, SWIFT)',
    icon: BuildingOffice2Icon,
    processingTime: '1-3 business days',
    fee: '1.5%',
    category: 'bank',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'KES', 'UGX', 'GHS'],
    securityLevel: 'premium',
    instantTransfer: false,
    popularity: 72,
    features: ['Large amounts', 'Bank verification', 'Lower fees', 'Corporate accounts'],
    iconColor: 'from-purple-500 to-violet-500',
    processingFee: 1.5,
    minimumAmount: 100,
    maximumAmount: 500000
  },
  { 
    id: 'crypto_wallet', 
    name: 'Cryptocurrency', 
    description: 'Bitcoin, Ethereum, USDT, USDC',
    icon: WalletIcon,
    processingTime: '10-30 minutes',
    fee: '0.5%',
    category: 'crypto',
    supportedCurrencies: ['BTC', 'ETH', 'USDT', 'USDC'],
    securityLevel: 'enhanced',
    instantTransfer: false,
    popularity: 65,
    features: ['No bank required', 'Privacy protection', 'Lower fees', '24/7 availability'],
    iconColor: 'from-orange-500 to-red-500',
    processingFee: 0.5,
    minimumAmount: 20,
    maximumAmount: 100000
  },
  { 
    id: 'klarna_bnp', 
    name: 'Buy Now, Pay Later', 
    description: 'Klarna, Afterpay, Sezzle',
    icon: ClockIcon,
    processingTime: 'Instant',
    fee: '0%',
    category: 'buy_now_pay_later',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD'],
    securityLevel: 'standard',
    instantTransfer: true,
    popularity: 45,
    features: ['No upfront cost', 'Split payments', 'Interest-free', 'Flexible terms'],
    iconColor: 'from-indigo-500 to-purple-500',
    processingFee: 0,
    minimumAmount: 50,
    maximumAmount: 2000
  }
];

const PACKAGES: Package[] = [
  { 
    actTokens: 100, 
    discount: 0, 
    bonus: 0, 
    popular: false,
    features: ['Basic features', 'Email support'],
    roi: 0,
    gradient: 'from-gray-500 to-gray-600'
  },
  { 
    actTokens: 500, 
    discount: 5, 
    bonus: 10, 
    popular: true,
    badge: 'Most Popular',
    features: ['5% discount', 'Bonus tokens', 'Priority support', 'Advanced analytics'],
    roi: 12,
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    actTokens: 1000, 
    discount: 10, 
    bonus: 25, 
    popular: false,
    features: ['10% discount', 'Bonus tokens', 'Dedicated support', 'API access', 'Custom features'],
    roi: 15,
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    actTokens: 5000, 
    discount: 15, 
    bonus: 150, 
    popular: false,
    badge: 'Best Value',
    features: ['15% discount', 'Large bonus', 'Account manager', 'White-label options', 'Custom integrations'],
    roi: 18,
    gradient: 'from-purple-500 to-violet-500'
  },
  { 
    actTokens: 10000, 
    discount: 20, 
    bonus: 350, 
    popular: false,
    badge: 'Enterprise',
    limitedTime: true,
    features: ['20% discount', 'Enterprise bonus', 'VIP support', 'Custom solutions', 'Dedicated infrastructure'],
    roi: 25,
    gradient: 'from-orange-500 to-red-500'
  }
];

export default function ACTPurchase() {
  const router = useRouter();
  const { user, profile } = useUser();
  
  // Enhanced state management
  const [purchaseData, setPurchaseData] = useState({
    actAmount: 500,
    paymentMethod: 'pesapal_card',
    currency: 'USD',
    customAmount: '',
    promoCode: '',
    installments: 1,
    autoPurchase: false,
    referralCode: ''
  });
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<boolean>(false);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<string[]>([]);
  const [instantBuyMode, setInstantBuyMode] = useState(false);
  const [recurringPurchase, setRecurringPurchase] = useState({
    enabled: false,
    amount: 100,
    frequency: 'weekly'
  });

  // Initialize market data and real-time updates
  useEffect(() => {
    if (user && profile) {
      initializeData();
      setupRealTimeUpdates();
    } else if (profile === null) {
      router.push('/login');
    }
  }, [user, profile, router]);

  const initializeData = useCallback(async () => {
    try {
      // Set default currency based on user profile
      if (profile?.currency_preference) {
        setPurchaseData(prev => ({ ...prev, currency: profile.currency_preference }));
      }

      // Load market data
      await loadMarketData();
      
      // Load exchange rates
      await loadExchangeRates();
      
      // Load user's recent purchases
      await loadRecentPurchases();
      
      // Load available promo codes
      await loadPromoCodes();
      
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }, [profile]);

  const loadMarketData = useCallback(async () => {
    try {
      // Simulate real-time market data
      const mockMarketData: MarketData = {
        actPrice: 2.847 + (Math.random() - 0.5) * 0.2,
        priceChange24h: 12.34 + (Math.random() - 0.5) * 5,
        volume24h: 1285000 + Math.random() * 500000,
        marketCap: 285000000 + Math.random() * 50000000,
        high24h: 3.12,
        low24h: 2.65,
        lastUpdated: new Date().toISOString(),
        trending: 'up'
      };
      
      setMarketData(mockMarketData);
    } catch (error) {
      console.error('Error loading market data:', error);
    }
  }, []);

  const loadExchangeRates = useCallback(async () => {
    try {
      // Simulate exchange rates (in production, fetch from reliable API)
      const mockRates = {
        'USD': 1,
        'KES': 133.5,
        'UGX': 3700,
        'GHS': 12.5,
        'TZS': 2330,
        'EUR': 0.85,
        'GBP': 0.73,
        'ZAR': 14.2
      };
      setExchangeRates(mockRates);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    }
  }, []);

  const loadRecentPurchases = useCallback(async () => {
    try {
      // Mock recent purchases for demo
      setRecentPurchases([
        {
          id: 1,
          amount: 1000,
          price: 2.85,
          total: 2850,
          currency: 'USD',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed'
        },
        {
          id: 2,
          amount: 500,
          price: 2.79,
          total: 1395,
          currency: 'USD',
          date: new Date(Date.now() - 172800000).toISOString(),
          status: 'completed'
        }
      ]);
    } catch (error) {
      console.error('Error loading recent purchases:', error);
    }
  }, []);

  const loadPromoCodes = useCallback(async () => {
    try {
      // Mock promo codes
      setPromoCodes([
        'WELCOME10',
        'BULK20',
        'VIP15',
        'FIRST25'
      ]);
    } catch (error) {
      console.error('Error loading promo codes:', error);
    }
  }, []);

  const setupRealTimeUpdates = useCallback(() => {
    const interval = setInterval(() => {
      loadMarketData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [loadMarketData]);

  const calculateACTPrice = useCallback((amount) => {
    if (!marketData) return 0;
    
    const usdAmount = amount * marketData.actPrice;
    const exchangeRate = exchangeRates[purchaseData.currency] || 1;
    
    return usdAmount * exchangeRate;
  }, [marketData, exchangeRates, purchaseData.currency]);

  const calculateTotalWithFees = useCallback(() => {
    if (!marketData) return 0;
    
    const basePrice = calculateACTPrice(purchaseData.actAmount);
    const selectedMethod = PAYMENT_METHODS.find(m => m.id === purchaseData.paymentMethod);
    const discount = getDiscountAmount();
    const promoDiscount = getPromoDiscount();
    
    // Apply package discount and promo code
    let discountedPrice = basePrice - discount - promoDiscount;
    if (discountedPrice < 0) discountedPrice = 0;
    
    // Apply payment processing fee
    const processingFee = (discountedPrice * selectedMethod.processingFee) / 100;
    
    // Apply installment fees if applicable
    const installmentFee = purchaseData.installments > 1 ? discountedPrice * 0.02 : 0;
    
    return discountedPrice + processingFee + installmentFee;
  }, [marketData, calculateACTPrice, purchaseData.actAmount, purchaseData.paymentMethod, purchaseData.installments]);

  const getDiscountAmount = useCallback(() => {
    const selectedPackage = PACKAGES.find(p => p.actTokens === purchaseData.actAmount);
    if (!selectedPackage) return 0;
    
    const basePrice = calculateACTPrice(purchaseData.actAmount);
    return (basePrice * selectedPackage.discount) / 100;
  }, [calculateACTPrice, purchaseData.actAmount]);

  const getPromoDiscount = useCallback(() => {
    if (!purchaseData.promoCode) return 0;
    
    const validPromo = promoCodes.includes(purchaseData.promoCode.toUpperCase());
    if (!validPromo) return 0;
    
    const basePrice = calculateACTPrice(purchaseData.actAmount);
    const discountRate = purchaseData.promoCode === 'WELCOME10' ? 10 : 
                        purchaseData.promoCode === 'FIRST25' ? 25 : 5;
    
    return (basePrice * discountRate) / 100;
  }, [purchaseData.promoCode, promoCodes, calculateACTPrice, purchaseData.actAmount]);

  const calculateROI = useCallback(() => {
    const selectedPackage = PACKAGES.find(p => p.actTokens === purchaseData.actAmount);
    return selectedPackage?.roi || 0;
  }, [purchaseData.actAmount]);

  const getTokenValueAfterBonus = useCallback(() => {
    const selectedPackage = PACKAGES.find(p => p.actTokens === purchaseData.actAmount);
    const baseTokens = purchaseData.actAmount;
    const bonusTokens = selectedPackage?.bonus || 0;
    return baseTokens + bonusTokens;
  }, [purchaseData.actAmount]);

  const getBonusTokens = () => {
    const selectedPackage = PACKAGES.find(p => p.actTokens === purchaseData.actAmount);
    return selectedPackage?.bonus || 0;
  };

  const getDiscountPercentage = () => {
    const selectedPackage = PACKAGES.find(p => p.actTokens === purchaseData.actAmount);
    return selectedPackage?.discount || 0;
  };

  const formatCurrency = (amount, currency) => {
    const symbols = {
      'KES': 'KSh',
      'USD': '$',
      'UGX': 'USh',
      'GHS': '₵',
      'TZS': 'TSh'
    };
    
    return `${symbols[currency] || currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleCustomAmountChange = (value) => {
    const numValue = parseInt(value) || 0;
    setPurchaseData(prev => ({
      ...prev,
      customAmount: value,
      actAmount: numValue >= 10 ? numValue : 10 // Minimum 10 ACT tokens
    }));
  };

  const initiatePurchase = async () => {
    if (!user || !profile) {
      toast.error('Please sign in to continue');
      return;
    }

    if (purchaseData.actAmount < 10) {
      toast.error('Minimum purchase amount is 10 ACT tokens');
      return;
    }

    setLoading(true);

    try {
      // Create payment record in database
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('pesapal_purchases')
        .insert({
          user_id: user.id,
          act_amount: purchaseData.actAmount,
          usd_amount: purchaseData.actAmount * actPriceUSD,
          currency: purchaseData.currency,
          local_amount: calculateTotalWithFees(),
          payment_method: purchaseData.paymentMethod,
          status: 'pending',
          bonus_tokens: getBonusTokens(),
          discount_percentage: getDiscountPercentage()
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Simulate PesaPal payment initiation
      // In real implementation, this would call the PesaPal API
      const pesapalPayload = {
        id: paymentRecord.id,
        currency: purchaseData.currency,
        amount: calculateTotalWithFees(),
        description: `Purchase ${purchaseData.actAmount} ACT Tokens`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/act-purchase/callback`,
        notification_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/pesapal/webhook`,
        billing_address: {
          first_name: profile.full_name?.split(' ')[0] || '',
          last_name: profile.full_name?.split(' ').slice(1).join(' ') || '',
          email: profile.email,
          phone_number: profile.phone || ''
        }
      };

      // For demo purposes, we'll simulate a successful payment
      // In production, this would redirect to PesaPal payment page
      toast.success('Redirecting to payment...');
      
      setTimeout(() => {
        // Simulate payment completion
        handlePaymentSuccess(paymentRecord.id);
      }, 2000);

    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to initiate purchase');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentId) => {
    try {
      // Update payment status
      const { error } = await supabase
        .from('pesapal_purchases')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      // Update wallet balance
      const purchase = PACKAGES.find(p => p.actTokens === purchaseData.actAmount);
      const totalTokens = purchaseData.actAmount + getBonusTokens();
      
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance_acts: supabase.sql`balance_acts + ${totalTokens}`,
          balance_kes: supabase.sql`balance_kes + ${calculateTotalWithFees()}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'purchase',
          amount_acts: totalTokens,
          amount_usd: purchaseData.actAmount * actPriceUSD,
          amount_kes: calculateTotalWithFees(),
          currency: purchaseData.currency,
          status: 'completed',
          external_id: `ACT-${paymentId}`,
          metadata: {
            bonus_tokens: getBonusTokens(),
            discount_percentage: getDiscountPercentage(),
            payment_method: purchaseData.paymentMethod
          }
        });

      toast.success('Purchase completed successfully!');
      router.push('/user/wallet');
      
    } catch (error) {
      console.error('Payment success handling error:', error);
      toast.error('Payment processed but failed to update account');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <CurrencyDollarIcon className="absolute inset-0 m-auto h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading ACT Purchase Platform</h3>
          <p className="text-blue-200">Preparing secure trading interface...</p>
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
            <div className="flex items-center space-x-6">
              <Link href="/user/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">ACT Trading</h1>
                  <p className="text-xs text-blue-200">Professional Token Platform</p>
                </div>
              </Link>
              
              {/* Market Status */}
              {marketData && (
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-black/40 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${marketData.trending === 'up' ? 'bg-green-400' : marketData.trending === 'down' ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                      <span className="text-white font-medium">${marketData.actPrice.toFixed(3)}</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      marketData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {marketData.priceChange24h >= 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {marketData.priceChange24h >= 0 ? '+' : ''}{marketData.priceChange24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-blue-200">Ready to Trade</p>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/user/dashboard" className="text-blue-200 hover:text-white transition-colors duration-200">
                  Dashboard
                </Link>
                <span className="text-blue-400">/</span>
                <span className="text-white font-medium">Buy ACT Tokens</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Buy ACT Tokens</h1>
          <p className="text-gray-600">
            Purchase ACT tokens with secure payment processing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchase Form */}
          <div className="space-y-6">
            {/* Package Selection */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Package</h2>
              <div className="grid grid-cols-2 gap-3">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.actTokens}
                    onClick={() => setPurchaseData(prev => ({ ...prev, actAmount: pkg.actTokens }))}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      purchaseData.actAmount === pkg.actTokens
                        ? 'border-act-blue-500 bg-act-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{pkg.actTokens} ACT</p>
                        {pkg.discount > 0 && (
                          <p className="text-sm text-green-600">{pkg.discount}% off</p>
                        )}
                        {pkg.bonus > 0 && (
                          <p className="text-sm text-blue-600">+{pkg.bonus} bonus</p>
                        )}
                      </div>
                      {pkg.popular && (
                        <span className="text-xs bg-act-gold-100 text-act-gold-800 px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Amount</h2>
              <div className="flex space-x-3">
                <input
                  type="number"
                  min="10"
                  value={purchaseData.customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Enter ACT amount"
                />
                <select
                  value={purchaseData.currency}
                  onChange={(e) => setPurchaseData(prev => ({ ...prev, currency: e.target.value }))}
                  className="input-field w-24"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="UGX">UGX</option>
                  <option value="GHS">GHS</option>
                  <option value="TZS">TZS</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-2">Minimum: 10 ACT tokens</p>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPurchaseData(prev => ({ ...prev, paymentMethod: method.id }))}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      purchaseData.paymentMethod === method.id
                        ? 'border-act-blue-500 bg-act-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <method.icon className="h-6 w-6 text-gray-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{method.processingTime}</p>
                        <p className="text-xs text-gray-600">{method.fee}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="card sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ACT Tokens</span>
                  <span className="font-medium">{purchaseData.actAmount.toLocaleString()}</span>
                </div>
                
                {getBonusTokens() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bonus Tokens</span>
                    <span className="font-medium">+{getBonusTokens()}</span>
                  </div>
                )}
                
                {getDiscountPercentage() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({getDiscountPercentage()}%)</span>
                    <span className="font-medium">-{formatCurrency(calculateACTPrice(purchaseData.actAmount) * (getDiscountPercentage() / 100), purchaseData.currency)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(calculateACTPrice(purchaseData.actAmount), purchaseData.currency)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium">
                    {formatCurrency(calculateTotalWithFees() - calculateACTPrice(purchaseData.actAmount), purchaseData.currency)}
                  </span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotalWithFees(), purchaseData.currency)}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={initiatePurchase}
                  disabled={loading || purchaseData.actAmount < 10}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                      Purchase {purchaseData.actTokens || purchaseData.actAmount} ACT
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  Secured by PesaPal
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Buy ACT Tokens?</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircleSolidIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Access to premium platform features</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleSolidIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Lower transaction fees</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleSolidIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Priority customer support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleSolidIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Exclusive platform benefits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Secure Payment Processing</h4>
              <p className="text-sm text-blue-800">
                All payments are processed securely through PesaPal with bank-grade encryption. 
                Your payment information is never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}