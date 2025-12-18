import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StandardNav from "@/components/standard-nav"
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Send, 
  History, 
  Calculator,
  Eye,
  Copy,
  CreditCard,
  Star,
  BarChart3,
  Globe,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { userService, type UserProfile, type UserWallet, type Transaction } from "@/lib/services/user.service"
import { marketDataService } from "@/lib/services/market-data.service"
import ACTPurchaseHistory from "@/components/act-purchase-history"

async function getDashboardData() {
  const supabase = await createClient()
  
  // Get current authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  try {
    // Fetch user's profile
    const profile = await userService.getCurrentUser()
    
    // Fetch user's wallet
    const wallet = await userService.getUserWallet()
    
    // Fetch transaction history
    const transactionHistory = await userService.getUserTransactions(10)
    
    // Get market data for display
    const marketStats = await marketDataService.getMarketStats()
    
    return {
      user,
      profile,
      wallet,
      transactionHistory,
      marketStats
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      user,
      profile: null,
      wallet: null,
      transactionHistory: [],
      marketStats: null
    }
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()
  
  const { user, profile, wallet, transactionHistory, marketStats } = dashboardData

  // Format balance display
  const formatBalance = (balance: number, currency: string = 'USD') => {
    const decimals = balance < 1 ? 8 : 2
    return `${balance.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${currency}`
  }

  // Get total portfolio value
  const getTotalValue = () => {
    if (!wallet?.balance) return 0
    // Convert ACT balance to USD using current rate
    const ACT_RATE_USD = 1.24
    return wallet.balance * ACT_RATE_USD
  }

  const totalValue = getTotalValue()

  // Transaction type formatting
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'receive':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />
      case 'swap':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      default:
        return <History className="h-4 w-4 text-binance-light-gray" />
    }
  }

  const getTransactionAmount = (transaction: Transaction) => {
    const isOutgoing = transaction.transaction_type === 'send'
    return `${isOutgoing ? '-' : '+'}${transaction.amount.toFixed(8)} ${transaction.currency}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="glassmorphism-container">
      <StandardNav 
        user={{ 
          email: user?.email || '', 
          isAdmin: user?.user_metadata?.isAdmin || false 
        }} 
        isAuthenticated={true} 
      />

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {profile?.first_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-xl text-binance-light-gray">
            Here's your financial overview
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="binance-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-binance-light-gray text-sm">Portfolio Value</p>
                  <p className="text-3xl font-bold text-white">
                    ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-binance-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="binance-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-binance-light-gray text-sm">24h Change</p>
                  <p className="text-2xl font-bold text-green-400">
                    +2.5%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="binance-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-binance-light-gray text-sm">Active Currencies</p>
                  <p className="text-2xl font-bold text-white">
                    {wallet?.balances ? Object.keys(wallet.balances).length : 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-binance-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="binance-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-binance-light-gray text-sm">KYC Status</p>
                  <p className="text-2xl font-bold text-white">
                    {profile?.kyc_status ? profile.kyc_status.charAt(0).toUpperCase() + profile.kyc_status.slice(1) : 'Pending'}
                  </p>
                </div>
                <Star className={`h-8 w-8 ${profile?.kyc_status === 'verified' ? 'text-green-500' : 'text-yellow-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Balances */}
          <div className="lg:col-span-2">
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-binance-gold" />
                  Portfolio Balance
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Your currency holdings and balances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {wallet ? (
                  <div className="flex items-center justify-between p-4 bg-binance-dark-gray/30 rounded-lg border border-binance-dark-gray/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-binance-gold to-yellow-600 flex items-center justify-center">
                        <span className="text-binance-black font-bold text-sm">AC</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">ACT Tokens</h3>
                        <p className="text-sm text-binance-light-gray">Stellar Wallet</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        {formatBalance(wallet.balance, 'ACT')}
                      </p>
                      <p className="text-sm text-binance-light-gray">
                        ≈ ${(wallet.balance * 1.24).toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-16 w-16 text-binance-light-gray mx-auto mb-4" />
                    <p className="text-binance-light-gray">No balances yet</p>
                    <p className="text-sm text-binance-light-gray mt-2">Your balances will appear here once you receive payments</p>
                  </div>
                )}

                <div className="pt-4 border-t border-binance-dark-gray">
                  <div className="flex gap-3">
                    <Link href="/send" className="flex-1">
                      <Button className="w-full binance-button">
                        <Send className="h-4 w-4 mr-2" />
                        Send Money
                      </Button>
                    </Link>
                    <Link href="/receive" className="flex-1">
                      <Button variant="outline" className="w-full border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Receive
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-binance-gold" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Latest transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactionHistory.length > 0 ? (
                  transactionHistory.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-lg bg-binance-dark-gray/30 border border-binance-dark-gray/50">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">
                          {transaction.transaction_type === 'send' ? 'Sent' : 
                           transaction.transaction_type === 'receive' ? 'Received' : 
                           transaction.transaction_type === 'swap' ? 'Swapped' : 
                           transaction.transaction_type === 'buy' ? 'Bought' : 'Sold'} {transaction.currency}
                        </p>
                        <p className="text-xs text-binance-light-gray">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {getTransactionAmount(transaction)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <History className="h-12 w-12 text-binance-light-gray mx-auto mb-3" />
                    <p className="text-binance-light-gray">No recent activity</p>
                    <p className="text-sm text-binance-light-gray mt-1">Transaction history will appear here</p>
                  </div>
                )}

                <Link href="/transactions" className="block pt-2">
                  <Button variant="outline" className="w-full border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                    View All Transactions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ACT Token Purchase History */}
        <div className="mt-8">
          <Card className="binance-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-binance-gold" />
                  ACT Token Purchases
                </div>
                <Link href="/buy-act">
                  <Button size="sm" className="bg-binance-gold hover:bg-binance-gold/90 text-black">
                    Buy More ACT
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription className="text-binance-light-gray">
                Your recent ACT token purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ACTPurchaseHistory userId={user.id} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="binance-card hover:border-binance-gold/30 transition-colors">
            <CardContent className="p-6 text-center">
              <Calculator className="h-12 w-12 text-binance-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Currency Converter</h3>
              <p className="text-binance-light-gray mb-4">
                Convert between different currencies instantly
              </p>
              <Link href="/converter">
                <Button className="binance-button">
                  Convert Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="binance-card hover:border-binance-gold/30 transition-colors">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Trading Markets</h3>
              <p className="text-binance-light-gray mb-4">
                Access live trading markets and charts
              </p>
              <Link href="/markets">
                <Button className="binance-button">
                  Start Trading
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="binance-card hover:border-binance-gold/30 transition-colors">
            <CardContent className="p-6 text-center">
              <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Global Payments</h3>
              <p className="text-binance-light-gray mb-4">
                Send money across borders instantly
              </p>
              <Link href="/send">
                <Button className="binance-button">
                  Send Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}