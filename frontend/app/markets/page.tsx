import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StandardNav from "@/components/standard-nav"
import { ArrowLeft, TrendingUp, Users, DollarSign, Star, Globe, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { marketDataService, type MarketPair, type Currency, type MarketStats } from "@/lib/services/market-data.service"

export default function MarketsPage() {
  const [marketPairs, setMarketPairs] = useState<MarketPair[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMarketData()
  }, [])

  const loadMarketData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [pairsData, currenciesData, statsData] = await Promise.all([
        marketDataService.getActivePairs(),
        marketDataService.getSupportedCurrencies(),
        marketDataService.getMarketStats()
      ])

      setMarketPairs(pairsData)
      setCurrencies(currenciesData)
      setMarketStats(statsData)
    } catch (err) {
      setError('Failed to load market data')
      console.error('Error loading market data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(1)}B`
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`
    }
    return `$${volume.toFixed(2)}`
  }

  const formatPercentage = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  return (
    <div className="glassmorphism-container">
      <StandardNav />
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline" className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-binance-light-gray hover:text-binance-gold transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Markets</h1>
          <p className="text-xl text-binance-light-gray">Live trading pairs and market data</p>
        </div>

        {/* Market Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="binance-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-600 rounded w-24"></div>
                      <div className="h-8 bg-gray-700 rounded w-16"></div>
                    </div>
                    <Loader2 className="h-8 w-8 text-binance-gold animate-spin" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={loadMarketData} variant="outline" className="border-binance-gold text-binance-gold">
              Retry
            </Button>
          </div>
        ) : marketStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="binance-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-binance-light-gray text-sm">Total Volume</p>
                    <p className="text-2xl font-bold text-white">{formatVolume(marketStats.total_volume)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-binance-gold" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="binance-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-binance-light-gray text-sm">Active Pairs</p>
                    <p className="text-2xl font-bold text-white">{marketStats.active_pairs}</p>
                  </div>
                  <Star className="h-8 w-8 text-binance-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="binance-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-binance-light-gray text-sm">24h Trades</p>
                    <p className="text-2xl font-bold text-white">{marketStats.total_trades_24h.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-binance-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="binance-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-binance-light-gray text-sm">Top Gainer</p>
                    <p className="text-2xl font-bold text-green-400">{formatPercentage(marketStats.top_gainer.change)}</p>
                    <p className="text-xs text-binance-light-gray">{marketStats.top_gainer.pair}</p>
                  </div>
                  <Globe className="h-8 w-8 text-binance-gold" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Trading Pairs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">ACT Trading Pairs</h2>
          <Card className="binance-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-binance-dark-gray">
                      <th className="text-left p-4 text-binance-light-gray font-medium">Pair</th>
                      <th className="text-right p-4 text-binance-light-gray font-medium">Price</th>
                      <th className="text-right p-4 text-binance-light-gray font-medium">24h Change</th>
                      <th className="text-right p-4 text-binance-light-gray font-medium">24h Volume</th>
                      <th className="text-right p-4 text-binance-light-gray font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i} className="border-b border-binance-dark-gray">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
                              <div className="h-4 bg-gray-600 rounded w-20 animate-pulse"></div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-gray-600 rounded w-16 ml-auto animate-pulse"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-gray-600 rounded w-12 ml-auto animate-pulse"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-gray-600 rounded w-16 ml-auto animate-pulse"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-8 bg-gray-600 rounded w-16 ml-auto animate-pulse"></div>
                          </td>
                        </tr>
                      ))
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-red-400">
                          {error}
                        </td>
                      </tr>
                    ) : marketPairs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-binance-light-gray">
                          No trading pairs available
                        </td>
                      </tr>
                    ) : (
                      marketPairs.map((pair) => (
                        <tr key={pair.id} className="border-b border-binance-dark-gray hover:bg-binance-dark-gray/30">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-binance-gold to-yellow-600 rounded-full flex items-center justify-center">
                                <span className="text-binance-black font-bold text-sm">
                                  {pair.base_currency?.[0] || 'A'}
                                </span>
                              </div>
                              <span className="font-medium text-white">
                                {pair.base_currency}/{pair.quote_currency}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right font-mono text-white">
                            {formatPrice(pair.current_price)}
                          </td>
                          <td className="p-4 text-right">
                            <span className={pair.price_change_24h >= 0 ? "text-green-400" : "text-red-400"}>
                              {formatPercentage(pair.price_change_24h)}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono text-binance-light-gray">
                            {formatVolume(pair.volume_24h)}
                          </td>
                          <td className="p-4 text-right">
                            <Link href={`/trade?pair=${pair.base_currency}-${pair.quote_currency}`}>
                              <Button size="sm" className="bg-binance-gold text-binance-black hover:bg-binance-gold/90">
                                Trade
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Currency Coverage */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Supported Currencies</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="binance-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-600 rounded w-12 animate-pulse"></div>
                          <div className="h-3 bg-gray-600 rounded w-20 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-600 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-600 rounded w-16 animate-pulse"></div>
                      <div className="h-4 bg-gray-600 rounded w-12 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={loadMarketData} variant="outline" className="border-binance-gold text-binance-gold">
                Retry
              </Button>
            </div>
          ) : currencies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-binance-light-gray">No supported currencies available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currencies.map((currency) => (
                <Card key={currency.code} className="binance-card hover:border-binance-gold/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{currency.flag}</span>
                        <div>
                          <h3 className="font-semibold text-white">{currency.code}</h3>
                          <p className="text-sm text-binance-light-gray">{currency.name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-binance-gold/20 text-binance-gold">
                        {currency.trading_enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-binance-light-gray">Type</span>
                      <span className="font-semibold text-white">
                        {currency.is_fiat ? 'Fiat' : currency.is_crypto ? 'Crypto' : 'Other'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="binance-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Trading?</h2>
              <p className="text-binance-light-gray mb-6">
                Join thousands of traders using ACT for cross-border payments and currency exchange.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/sign-up">
                  <Button className="binance-button text-lg px-8 py-3">
                    Create Account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black text-lg px-8 py-3">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
