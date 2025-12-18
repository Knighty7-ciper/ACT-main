import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, Calculator, ArrowLeftRight, DollarSign, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { marketDataService } from "@/lib/services/market-data.service"
import { tradingService } from "@/lib/services/trading.service"
import StandardNav from "@/components/standard-nav"

export default function TradePage() {
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [loading, setLoading] = useState(false)
  const [currentPair, setCurrentPair] = useState<string>("ACT/USD")
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [marketData, setMarketData] = useState<{
    volume: number
    high24h: number
    low24h: number
    change24h: number
  } | null>(null)

  useEffect(() => {
    // Get pair from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const pair = urlParams.get('pair') || 'ACT-USD'
    
    setCurrentPair(pair.replace('-', '/'))
    loadPairData(pair)
  }, [])

  const loadPairData = async (pair: string) => {
    try {
      const [base, quote] = pair.split('-')
      const priceData = await marketDataService.getPairPrice(base, quote)
      
      if (priceData) {
        setCurrentPrice(priceData)
        setPrice(priceData.toString())
        
        // Load additional market data for this pair
        // This would typically come from your market data service
        setMarketData({
          volume: 1200000, // Would be fetched from API
          high24h: priceData * 1.02, // Would be real high
          low24h: priceData * 0.98, // Would be real low
          change24h: 2.34 // Would be real change
        })
      }
    } catch (error) {
      console.error('Error loading pair data:', error)
    }
  }

  const handleTrade = async () => {
    if (!amount || !currentPrice) return
    
    setLoading(true)
    try {
      // Implementation would go here
      console.log('Placing trade:', { currentPair, orderType, amount, price })
      // await tradingService.placeOrder({...})
    } catch (error) {
      console.error('Trade failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/markets" className="inline-flex items-center text-binance-light-gray hover:text-binance-gold transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-binance-gold to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-binance-black font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">ACT/NGN</h1>
              <p className="text-xl text-binance-light-gray">African Currency Token / Nigerian Naira</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Chart & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Price */}
            <Card className="binance-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-white">${currentPrice}</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {marketData.change24h}
                      </Badge>
                    </div>
                    <p className="text-binance-light-gray">ACT/NGN</p>
                  </div>
                  <div className="text-right">
                    <p className="text-binance-light-gray">24h Volume</p>
                    <p className="text-lg font-semibold text-white">{marketData.volume}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-binance-light-gray">24h High</p>
                    <p className="text-white font-semibold">${marketData.high24h}</p>
                  </div>
                  <div>
                    <p className="text-binance-light-gray">24h Low</p>
                    <p className="text-white font-semibold">${marketData.low24h}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Chart Placeholder */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white">Price Chart</CardTitle>
                <CardDescription className="text-binance-light-gray">
                  ACT/NGN price movement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-binance-dark-gray/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-binance-gold mx-auto mb-2" />
                    <p className="text-binance-light-gray">Interactive chart coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white">Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-binance-light-gray">Price (NGN)</span>
                    <span className="text-binance-light-gray">Amount (ACT)</span>
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-red-400">{(currentPrice + (i * 0.1)).toFixed(2)}</span>
                      <span className="text-white">{(100 - i * 10).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-center border-t border-b border-binance-dark-gray pt-2 my-4">
                    <span className="font-semibold text-white">{currentPrice.toFixed(2)}</span>
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-green-400">{(currentPrice - (i * 0.1)).toFixed(2)}</span>
                      <span className="text-white">{(100 - i * 10).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Order Type */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-binance-gold" />
                  Trade ACT
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Buy or sell African Currency Tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={orderType === "buy" ? "default" : "outline"}
                    className={orderType === "buy" ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setOrderType("buy")}
                  >
                    Buy
                  </Button>
                  <Button
                    variant={orderType === "sell" ? "default" : "outline"}
                    className={orderType === "sell" ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => setOrderType("sell")}
                  >
                    Sell
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="order-type" className="text-white">Order Type</Label>
                    <select
                      id="order-type"
                      className="w-full mt-1 p-2 bg-binance-dark-gray border border-binance-dark-gray rounded text-white"
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as "market" | "limit")}
                    >
                      <option value="market">Market Order</option>
                      <option value="limit">Limit Order</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-white">Amount (ACT)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray"
                    />
                  </div>

                  {orderType === "limit" && (
                    <div>
                      <Label htmlFor="price" className="text-white">Price (NGN)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder={price}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-white">Total (NGN)</Label>
                    <div className="mt-1 p-2 bg-binance-dark-gray border border-binance-dark-gray rounded text-white">
                      {(parseFloat(amount) * parseFloat(price || currentPrice.toString())).toFixed(2)} NGN
                    </div>
                  </div>

                  <Button 
                    className={`w-full text-lg ${
                      orderType === "buy" 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {orderType === "buy" ? "Buy ACT" : "Sell ACT"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/converter" className="block">
                  <Button variant="outline" className="w-full border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Currency Converter
                  </Button>
                </Link>
                <Link href="/send" className="block">
                  <Button variant="outline" className="w-full border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Send Money
                  </Button>
                </Link>
                <Link href="/wallet" className="block">
                  <Button variant="outline" className="w-full border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                    My Wallets
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Account Balance */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white">Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-binance-light-gray">ACT Balance</span>
                    <span className="text-white font-semibold">1,250.00 ACT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-binance-light-gray">NGN Balance</span>
                    <span className="text-white font-semibold">₦156,780.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
