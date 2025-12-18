'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { StatsGrid, StatItem } from '@/components/ui/enhanced-stats';
import { LoadingSpinner, CardSkeleton, StatsSkeleton } from '@/components/ui/enhanced-loading';
import { EnhancedNav } from '@/components/ui/enhanced-nav';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  Wallet, 
  ArrowRight, 
  Activity,
  DollarSign,
  Globe,
  Shield,
  Zap,
  ChevronRight,
  Star,
  Award,
  Target,
  CheckCircle,
  PlayCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { marketDataService, type MarketPair, type MarketStats } from '@/lib/services/market-data.service';

export default function HomePage() {
  const [marketData, setMarketData] = useState<MarketPair[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomePageData();
  }, []);

  const loadHomePageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pairsData, statsData] = await Promise.all([
        marketDataService.getActivePairs(),
        marketDataService.getMarketStats()
      ]);

      setMarketData(pairsData.slice(0, 4));
      setStats(statsData);
    } catch (err) {
      setError('Failed to load market data');
      console.error('Error loading homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  const formatPercentage = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Transform stats data for the enhanced stats component
  const getStatsData = (): StatItem[] => {
    if (!stats) return [];

    return [
      {
        id: 'total-volume',
        title: 'Total Volume',
        value: formatVolume(stats.totalVolume),
        change: {
          value: 12.5,
          period: '24h',
          type: 'positive'
        },
        icon: <TrendingUp className="size-6" />,
        color: 'gold',
        animated: true
      },
      {
        id: 'active-users',
        title: 'Active Users',
        value: formatNumber(stats.activeUsers),
        change: {
          value: 8.2,
          period: '7d',
          type: 'positive'
        },
        icon: <Users className="size-6" />,
        color: 'green',
        animated: true
      },
      {
        id: 'transactions',
        title: 'Transactions',
        value: formatNumber(stats.transactions),
        change: {
          value: 5.1,
          period: '24h',
          type: 'positive'
        },
        icon: <Zap className="size-6" />,
        color: 'blue',
        animated: true
      },
      {
        id: 'success-rate',
        title: 'Success Rate',
        value: '99.8%',
        change: {
          value: 0.1,
          period: '24h',
          type: 'neutral'
        },
        icon: <Target className="size-6" />,
        color: 'purple',
        animated: false
      }
    ];
  };

  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Premium User'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-act-dark-900 via-act-dark-800 to-act-dark-900 african-pattern">
      <EnhancedNav 
        user={mockUser}
        notifications={3}
      />
      
      {/* Hero Section */}
      <section className="hero-section relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The Future of{' '}
              <span className="text-gradient animate-glow">African</span>{' '}
              Finance
            </h1>
            
            <p className="text-xl md:text-2xl text-act-dark-300 max-w-4xl mx-auto leading-relaxed">
              Trade, send, and manage African currencies with the power of blockchain technology. 
              Real-time rates for 13+ African currencies with instant settlement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <EnhancedButton 
                variant="premium" 
                size="xl" 
                leftIcon={<PlayCircle className="size-5" />}
                asChild
              >
                <Link href="/auth/sign-up">Start Trading Now</Link>
              </EnhancedButton>
              
              <EnhancedButton 
                variant="outline" 
                size="xl" 
                leftIcon={<BarChart3 className="size-5" />}
                asChild
              >
                <Link href="/markets">View Markets</Link>
              </EnhancedButton>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-act-gold-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-act-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-act-dark-200 mb-4">
              Platform Statistics
            </h2>
            <p className="text-act-dark-400 text-lg">
              Real-time metrics from our thriving ecosystem
            </p>
          </div>
          
          {loading ? (
            <StatsSkeleton count={4} />
          ) : error ? (
            <EnhancedCard variant="error" className="text-center p-8">
              <p className="text-act-red-400">{error}</p>
              <EnhancedButton 
                variant="outline" 
                className="mt-4" 
                onClick={loadHomePageData}
              >
                Retry
              </EnhancedButton>
            </EnhancedCard>
          ) : (
            <StatsGrid stats={getStatsData()} columns={4} />
          )}
        </div>
      </section>

      {/* Market Overview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-act-dark-800/50 to-act-dark-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-act-dark-200 mb-4">
              Market Overview
            </h2>
            <p className="text-act-dark-400 text-lg">
              Live rates and trending currency pairs
            </p>
          </div>
          
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EnhancedCard variant="error" className="text-center p-8">
              <p className="text-act-red-400">{error}</p>
            </EnhancedCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {marketData.map((pair, index) => (
                <EnhancedCard 
                  key={pair.symbol} 
                  variant="interactive" 
                  hover="scale"
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-act-dark-200">
                        {pair.symbol}
                      </h3>
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                        pair.change24h >= 0 
                          ? "text-act-green-400 bg-act-green-500/10" 
                          : "text-act-red-400 bg-act-red-500/10"
                      )}>
                        {pair.change24h >= 0 ? (
                          <TrendingUp className="size-3" />
                        ) : (
                          <TrendingDown className="size-3" />
                        )}
                        {formatPercentage(pair.change24h)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-act-gold-400 font-mono">
                        {formatPrice(pair.price)}
                      </p>
                      <p className="text-sm text-act-dark-400">
                        Volume: {formatVolume(pair.volume)}
                      </p>
                    </div>
                  </div>
                </EnhancedCard>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <EnhancedButton 
              variant="outline" 
              rightIcon={<ChevronRight className="size-4" />}
              asChild
            >
              <Link href="/markets">View All Markets</Link>
            </EnhancedButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-act-dark-200 mb-4">
              Why Choose Pesa-Afrik?
            </h2>
            <p className="text-act-dark-400 text-lg">
              Revolutionary features for the new African economy
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Zap className="size-8" />,
                title: 'Instant Settlement',
                description: 'Transactions settle in seconds using Stellar blockchain technology, eliminating traditional banking delays.',
                color: 'gold' as const
              },
              {
                icon: <Shield className="size-8" />,
                title: 'Bank-Grade Security',
                description: 'Multi-signature wallets, end-to-end encryption, and compliance with international financial standards.',
                color: 'green' as const
              },
              {
                icon: <Globe className="size-8" />,
                title: 'Pan-African Coverage',
                description: 'Support for 13+ African currencies with real-time exchange rates and cross-border payment capabilities.',
                color: 'blue' as const
              },
              {
                icon: <BarChart3 className="size-8" />,
                title: 'Advanced Analytics',
                description: 'Real-time market data, price alerts, and comprehensive trading tools for informed decision making.',
                color: 'purple' as const
              },
              {
                icon: <Users className="size-8" />,
                title: 'Community Driven',
                description: 'Built by Africans, for Africans. Join a thriving community of traders and entrepreneurs.',
                color: 'gold' as const
              },
              {
                icon: <Award className="size-8" />,
                title: 'Regulatory Compliance',
                description: 'Fully compliant with financial regulations across African markets with proper KYC/AML procedures.',
                color: 'green' as const
              }
            ].map((feature, index) => (
              <EnhancedCard 
                key={index}
                variant="glass" 
                hover="lift"
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <EnhancedCardContent className="p-8 space-y-4">
                  <div className={cn(
                    "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                    getIconColor(feature.color)
                  )}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-act-dark-200">
                    {feature.title}
                  </h3>
                  <p className="text-act-dark-400 leading-relaxed">
                    {feature.description}
                  </p>
                </EnhancedCardContent>
              </EnhancedCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-act-gold-500/10 to-act-gold-600/5">
        <div className="max-w-4xl mx-auto text-center">
          <EnhancedCard variant="premium" className="p-12">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-act-dark-200">
                Ready to Transform Your Finances?
              </h2>
              <p className="text-xl text-act-dark-300">
                Join thousands of users already trading African currencies on the blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <EnhancedButton 
                  variant="premium" 
                  size="xl"
                  leftIcon={<CheckCircle className="size-5" />}
                  asChild
                >
                  <Link href="/auth/sign-up">Get Started Free</Link>
                </EnhancedButton>
                <EnhancedButton 
                  variant="ghost" 
                  size="xl"
                  leftIcon={<Phone className="size-5" />}
                >
                  Contact Sales
                </EnhancedButton>
              </div>
            </div>
          </EnhancedCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-act-dark-900 border-t border-act-gold-500/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-act-gold-400 to-act-gold-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-bold text-xl text-gradient">Pesa-Afrik</span>
              </div>
              <p className="text-act-dark-400">
                The future of African finance is here. Trade, send, and manage African currencies with confidence.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-act-dark-200">Platform</h3>
              <ul className="space-y-2 text-act-dark-400">
                <li><Link href="/markets" className="hover:text-act-gold-400 transition-colors">Markets</Link></li>
                <li><Link href="/wallet" className="hover:text-act-gold-400 transition-colors">Wallet</Link></li>
                <li><Link href="/send" className="hover:text-act-gold-400 transition-colors">Send Money</Link></li>
                <li><Link href="/converter" className="hover:text-act-gold-400 transition-colors">Currency Converter</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-act-dark-200">Company</h3>
              <ul className="space-y-2 text-act-dark-400">
                <li><Link href="/about" className="hover:text-act-gold-400 transition-colors">About</Link></li>

                <li><Link href="/contact" className="hover:text-act-gold-400 transition-colors">Contact</Link></li>
                <li><Link href="/legal" className="hover:text-act-gold-400 transition-colors">Legal</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-act-dark-200">Support</h3>
              <ul className="space-y-2 text-act-dark-400">
                <li><Link href="/help" className="hover:text-act-gold-400 transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-act-gold-400 transition-colors">FAQ</Link></li>
                <li><Link href="/fees" className="hover:text-act-gold-400 transition-colors">Fees</Link></li>
                <li><Link href="/status" className="hover:text-act-gold-400 transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-act-gold-500/20 mt-8 pt-8 text-center text-act-dark-400">
            <p>&copy; 2025 Pesa-Afrik. All rights reserved. Built with ❤️ in Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function (should be moved to utils)
import { cn } from '@/lib/utils';
const getIconColor = (color: string) => {
  const colors = {
    gold: 'text-act-gold-400 bg-act-gold-500/10 border-act-gold-500/20',
    green: 'text-act-green-400 bg-act-green-500/10 border-act-green-500/20',
    red: 'text-act-red-400 bg-act-red-500/10 border-act-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };
  return colors[color as keyof typeof colors] || colors.gold;
};