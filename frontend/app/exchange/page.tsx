import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CurrencyConverter } from "@/components/currency-converter"
import { ExchangeRatesTable } from "@/components/exchange-rates-table"
import { getExchangeRates, getCurrencies } from "@/app/actions/exchange"
import StandardNav from "@/components/standard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Globe,
  Star,
  Zap,
  Shield,
  Clock
} from "lucide-react"
import Link from "next/link"

export default async function ExchangePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  const [ratesResult, currenciesResult] = await Promise.all([getExchangeRates(), getCurrencies()])

  const rates = ratesResult.data || []
  const currencies = currenciesResult.data || []

  // Mock some additional data for the Binance-style layout
  const marketStats = {
    totalVolume: '2.5B',
    dailyVolume: '45.2M',
    activePairs: rates.length,
    avgRate: '1.0023'
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={true} user={{ email: user.email!, isAdmin: profile?.role === "admin" }} />

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              Currency <span className="text-binance-gold">Exchange</span>
            </h1>
            <p className="text-xl text-binance-light-gray max-w-2xl mx-auto">
              Exchange African currencies with real-time rates and instant execution
            </p>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="binance-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">${marketStats.totalVolume}</div>
                <div className="text-sm text-binance-light-gray">Total Volume</div>
              </CardContent>
            </Card>
            <Card className="binance-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">${marketStats.dailyVolume}</div>
                <div className="text-sm text-binance-light-gray">24h Volume</div>
              </CardContent>
            </Card>
            <Card className="binance-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{marketStats.activePairs}</div>
                <div className="text-sm text-binance-light-gray">Active Pairs</div>
              </CardContent>
            </Card>
            <Card className="binance-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{marketStats.avgRate}</div>
                <div className="text-sm text-binance-light-gray">Avg Rate</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Exchange Interface */}
          <div className="xl:col-span-2">
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-binance-gold" />
                  Currency Exchange
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Instant currency conversion with real-time rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CurrencyConverter />
              </CardContent>
            </Card>

            {/* Exchange Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="binance-card">
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 text-binance-gold mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Instant Execution</h3>
                  <p className="text-sm text-binance-light-gray">Fast and secure transactions</p>
                </CardContent>
              </Card>
              <Card className="binance-card">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 text-binance-gold mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Secure Trading</h3>
                  <p className="text-sm text-binance-light-gray">Bank-level security</p>
                </CardContent>
              </Card>
              <Card className="binance-card">
                <CardContent className="p-4 text-center">
                  <Globe className="h-8 w-8 text-binance-gold mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Global Access</h3>
                  <p className="text-sm text-binance-light-gray">Trade from anywhere</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Live Rates Sidebar */}
          <div className="space-y-6">
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-binance-gold" />
                  Live Rates
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Real-time exchange rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExchangeRatesTable rates={rates} currencies={currencies} />
              </CardContent>
            </Card>

            {/* Market Trends */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-binance-gold" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-white">GHS/USD</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">0.1645</div>
                    <div className="text-xs text-green-500">+2.4%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-white">NGN/USD</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">0.0013</div>
                    <div className="text-xs text-red-500">-0.8%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-white">ZAR/USD</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">0.0567</div>
                    <div className="text-xs text-green-500">+1.2%</div>
                  </div>
                </div>

                <Link href="/dashboard">
                  <Button variant="outline" className="w-full border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                    View Full Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/converter">
                  <Button className="w-full binance-button justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Advanced Converter
                  </Button>
                </Link>
                <Link href="/wallet">
                  <Button className="w-full binance-button justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    View Wallets
                  </Button>
                </Link>
                <Link href="/transactions">
                  <Button className="w-full binance-button justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Transaction History
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}