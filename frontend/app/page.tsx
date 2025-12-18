'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StandardNav from '@/components/standard-nav';
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
  Loader2
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

      // Take only top 4 pairs for homepage display
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

  return (
    <div className="glassmorphism-container">
      <StandardNav />
      

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6">
            The Future of <span className="text-yellow-400">African</span> Finance
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Trade African currencies instantly with ACT, the basket-backed stablecoin designed for cross-border payments and commerce across the continent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 text-lg px-8 py-4">
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="lg" variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-lg px-8 py-4">
                View Markets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Live Market Data</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-600 rounded animate-pulse"></div>
                      <div className="h-8 bg-gray-600 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={loadHomePageData} variant="outline" className="border-yellow-400 text-yellow-400">
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {marketData.map((pair) => (
                <Card key={pair.id} className="bg-gray-900/50 border-gray-700 hover:border-yellow-400/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-white">
                        {pair.base_currency}/{pair.quote_currency}
                      </h3>
                      {pair.price_change_24h >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(pair.current_price)}
                      </p>
                      <p className={`text-sm ${pair.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercentage(pair.price_change_24h)} (24h)
                      </p>
                      <p className="text-sm text-gray-400">
                        Vol: {formatVolume(pair.volume_24h)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Platform Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-gray-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {formatNumber(stats.total_trades_24h)}
                </div>
                <p className="text-gray-400">24h Trades</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {formatNumber(stats.active_pairs)}
                </div>
                <p className="text-gray-400">Active Pairs</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {formatVolume(stats.total_volume)}
                </div>
                <p className="text-gray-400">Total Volume</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {formatPercentage(stats.top_gainer.change)}
                </div>
                <p className="text-gray-400">Top Gainer</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose PESA-AFRIK?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <Globe className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Pan-African Reach</h3>
                <p className="text-gray-300">
                  Trade and transfer across 50+ African countries with local currency support and real-time settlement.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Secure & Transparent</h3>
                <p className="text-gray-300">
                  Built on Stellar blockchain with full transparency, audited smart contracts, and institutional-grade security.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Instant Settlement</h3>
                <p className="text-gray-300">
                  Send money across borders in seconds with minimal fees and maximum convenience for businesses and individuals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-400 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center text-black">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-xl mb-8">
            Join thousands of traders and businesses using ACT for cross-border payments and currency exchange.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-yellow-400 text-lg px-8 py-4">
                Explore Markets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold text-white">PESA-AFRIK</span>
              </Link>
              <p className="text-gray-400">
                The future of African finance starts here.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/trade" className="hover:text-yellow-400">Trading</Link></li>
                <li><Link href="/markets" className="hover:text-yellow-400">Markets</Link></li>
                <li><Link href="/converter" className="hover:text-yellow-400">Converter</Link></li>
                <li><Link href="/api" className="hover:text-yellow-400">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-yellow-400">About</Link></li>

                <li><Link href="/legal" className="hover:text-yellow-400">Legal</Link></li>
                <li><Link href="/contact" className="hover:text-yellow-400">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-yellow-400">Help Center</Link></li>
                <li><Link href="/status" className="hover:text-yellow-400">System Status</Link></li>
                <li><Link href="/fees" className="hover:text-yellow-400">Fees</Link></li>
                <li><Link href="/news" className="hover:text-yellow-400">News</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PESA-AFRIK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}