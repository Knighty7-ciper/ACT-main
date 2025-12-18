import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyConverter } from "@/components/currency-converter"
import { ExchangeRatesTable } from "@/components/exchange-rates-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Star,
  ArrowLeftRight,
  Globe,
  Zap,
  Clock,
  Shield
} from "lucide-react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/server"

async function getConverterData() {
  try {
    const supabase = await createClient()
    const { data: currencies } = await supabase
      .from("currencies")
      .select("code,name,symbol")
      .eq("is_active", true)
      .order("code")

    const { data: rates } = await supabase
      .from("exchange_rates")
      .select("id,currency_code,rate_to_act,updated_at,currency(name,symbol)")
      .order("updated_at", { ascending: false })

    return {
      currencies: currencies || [],
      rates: rates || [],
    }
  } catch (e) {
    return { currencies: [], rates: [] }
  }
}

export default async function ConverterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { currencies, rates } = await getConverterData()

  // Mock data for Binance-style layout
  const conversionStats = {
    dailyConversions: '45.2K',
    avgRate: '1.0023',
    supportedCurrencies: currencies.length || 13,
    successRate: '99.8%'
  }

  const popularPairs = [
    { from: 'USD', to: 'GHS', rate: '16.45', change: '+2.4%' },
    { from: 'NGN', to: 'USD', rate: '0.0013', change: '-0.8%' },
    { from: 'ZAR', to: 'USD', rate: '0.0567', change: '+1.2%' },
    { from: 'KES', to: 'USD', rate: '0.0078', change: '+0.5%' }
  ]

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={!!user} user={user ? { email: user.email!, isAdmin: false } : undefined} />

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Currency <span className="text-binance-gold">Converter</span>
          </h1>
          <p className="text-xl text-binance-light-gray max-w-2xl mx-auto">
            Convert between African currencies and global currencies with real-time rates
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="binance-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{conversionStats.dailyConversions}</div>
              <div className="text-sm text-binance-light-gray">Daily Conversions</div>
            </CardContent>
          </Card>
          <Card className="binance-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{conversionStats.avgRate}</div>
              <div className="text-sm text-binance-light-gray">Avg Exchange Rate</div>
            </CardContent>
          </Card>
          <Card className="binance-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{conversionStats.supportedCurrencies}</div>
              <div className="text-sm text-binance-light-gray">Supported Currencies</div>
            </CardContent>
          </Card>
          <Card className="binance-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{conversionStats.successRate}</div>
              <div className="text-sm text-binance-light-gray">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Converter */}
          <div className="xl:col-span-2">
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-binance-gold" />
                  Real-time Currency Converter
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Get instant conversion rates with minimal fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CurrencyConverter />
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="binance-card">
                <CardContent className="p-6 text-center">
                  <Zap className="h-10 w-10 text-binance-gold mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">Instant Results</h3>
                  <p className="text-sm text-binance-light-gray">
                    Real-time rates updated every second for accurate conversions
                  </p>
                </CardContent>
              </Card>
              <Card className="binance-card">
                <CardContent className="p-6 text-center">
                  <Shield className="h-10 w-10 text-binance-gold mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">Secure & Safe</h3>
                  <p className="text-sm text-binance-light-gray">
                    Bank-level security ensures your transactions are protected
                  </p>
                </CardContent>
              </Card>
              <Card className="binance-card">
                <CardContent className="p-6 text-center">
                  <Globe className="h-10 w-10 text-binance-gold mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">Global Access</h3>
                  <p className="text-sm text-binance-light-gray">
                    Convert currencies from anywhere in the world
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Pairs */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-binance-gold" />
                  Popular Pairs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularPairs.map((pair, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-binance-dark-gray/30 hover:bg-binance-dark-gray/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-white">{pair.from}</span>
                        <ArrowLeftRight className="h-3 w-3 text-binance-gold" />
                        <span className="text-xs font-medium text-white">{pair.to}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{pair.rate}</div>
                      <div className={`text-xs ${pair.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {pair.change}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Live Exchange Rates */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-binance-gold" />
                  Live Rates
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Updated in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExchangeRatesTable rates={rates} currencies={currencies} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/exchange">
                  <Button className="w-full binance-button justify-start">
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Start Trading
                  </Button>
                </Link>
                <Link href="/wallet">
                  <Button className="w-full binance-button justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Manage Wallets
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="w-full binance-button justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Conversion History */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-binance-gold" />
                  Recent Conversions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-binance-dark-gray/30">
                  <div className="flex-1">
                    <p className="text-sm text-white">USD → GHS</p>
                    <p className="text-xs text-binance-light-gray">2 hours ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">$500 → ₵8,225</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-binance-dark-gray/30">
                  <div className="flex-1">
                    <p className="text-sm text-white">NGN → USD</p>
                    <p className="text-xs text-binance-light-gray">5 hours ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">₦100,000 → $130</p>
                  </div>
                </div>

                <Link href="/transactions">
                  <Button variant="outline" className="w-full border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                    View All History
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