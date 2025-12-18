'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { userService, type UserProfile, type UserWallet, type Transaction } from "@/lib/services/user.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StandardNav from "@/components/standard-nav"
import { Send, Download, ArrowLeftRight, Plus, Wallet, Eye, EyeOff, Shield, Star, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function WalletPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [wallet, setWallet] = useState<UserWallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [userData, walletData, transactionsData] = await Promise.all([
        userService.getCurrentUser(),
        userService.getUserWallet(),
        userService.getUserTransactions(20)
      ])

      if (!userData) {
        router.push("/auth/login")
        return
      }

      if (!walletData) {
        router.push("/dashboard")
        return
      }

      setUser(userData)
      setWallet(walletData)
      setTransactions(transactionsData)
    } catch (err) {
      setError('Failed to load wallet data')
      console.error('Error loading wallet data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-binance-black">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-binance-gold animate-spin" />
            <span className="ml-4 text-xl text-white">Loading wallet...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-binance-black">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Wallet</h2>
            <p className="text-binance-light-gray mb-6">{error}</p>
            <Button onClick={loadWalletData} className="bg-binance-gold text-binance-black hover:bg-binance-gold/90">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !wallet) {
    return (
      <div className="min-h-screen bg-binance-black">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Wallet Not Found</h2>
            <p className="text-binance-light-gray mb-6">Please ensure your account is properly set up.</p>
            <Link href="/dashboard">
              <Button className="bg-binance-gold text-binance-black hover:bg-binance-gold/90">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Convert wallet balances to display format
  const balanceEntries = wallet ? [{
    currency: 'ACT',
    balance: wallet.balance,
    formatted: wallet.balance.toFixed(8)
  }] : []

  const formatBalance = (balance: number, currency: string) => {
    const decimals = balance < 1 ? 8 : 2
    return `${balance.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${currency}`
  }

  // Calculate total USD value
  const ACT_RATE_USD = 1.24
  const totalUSDValue = wallet ? wallet.balance * ACT_RATE_USD : 0

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, className: "bg-yellow-500/20 text-yellow-500" },
      confirmed: { variant: "secondary" as const, className: "bg-green-500/20 text-green-500" },
      failed: { variant: "secondary" as const, className: "bg-red-500/20 text-red-500" }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  return (
    <div className="glassmorphism-container">
      <StandardNav 
        user={{ 
          email: user?.email || '', 
          isAdmin: user?.is_admin || false 
        }} 
        isAuthenticated={true} 
      />

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                My <span className="text-binance-gold">Wallet</span>
              </h1>
              <p className="text-binance-light-gray text-lg">
                Stellar blockchain address: {wallet.stellar_public_key}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-binance-light-gray">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-white">
                ${totalUSDValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button className="binance-button">
              <Plus className="h-4 w-4 mr-2" />
              Create New Wallet
            </Button>
            <Link href="/send">
              <Button variant="outline" className="border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                <Send className="h-4 w-4 mr-2" />
                Send Money
              </Button>
            </Link>
            <Link href="/exchange">
              <Button variant="outline" className="border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Exchange Currency
              </Button>
            </Link>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="binance-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-binance-light-gray">
                Active Wallets
              </CardTitle>
              <Wallet className="h-4 w-4 text-binance-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{wallet ? 1 : 0}</div>
              <p className="text-xs text-binance-light-gray">
                ACT token wallet
              </p>
            </CardContent>
          </Card>

          <Card className="binance-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-binance-light-gray">
                Total Balance
              </CardTitle>
              <Star className="h-4 w-4 text-binance-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${totalUSDValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-500">
                Live blockchain balance
              </p>
            </CardContent>
          </Card>

          <Card className="binance-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-binance-light-gray">
                Security Score
              </CardTitle>
              <Shield className="h-4 w-4 text-binance-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">98%</div>
              <p className="text-xs text-green-500">
                Excellent security
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallets List */}
          <div className="lg:col-span-2">
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-binance-gold" />
                  Your Wallets
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Manage your currency balances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {balanceEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-16 w-16 text-binance-light-gray mx-auto mb-4" />
                    <p className="text-binance-light-gray">No currency balances found</p>
                    <p className="text-sm text-binance-light-gray mt-2">Your balances will appear here once you receive payments</p>
                  </div>
                ) : (
                  balanceEntries.map((entry) => (
                    <div key={entry.currency} className="p-6 rounded-lg bg-binance-dark-gray/30 border border-binance-dark-gray/50 hover:border-binance-gold/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-binance-gold to-yellow-600 flex items-center justify-center">
                            <span className="text-binance-black font-bold">
                              {entry.currency.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{entry.currency}</h3>
                            <p className="text-sm text-binance-light-gray">Stellar Wallet Balance</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {formatBalance(entry.balance, entry.currency)}
                          </p>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
                            Active
                          </Badge>
                        </div>
                      </div>

                      {/* Wallet Address */}
                      <div className="bg-binance-dark-gray/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-binance-light-gray mb-1">Stellar Address</p>
                            <p className="text-sm text-white font-mono">
                              {wallet.stellar_public_key.slice(0, 8)}...{wallet.stellar_public_key.slice(-8)}
                            </p>
                          </div>
                        <Button size="sm" variant="ghost" className="text-binance-gold hover:text-binance-gold hover:bg-binance-gold/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" className="binance-button flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                      <Button size="sm" variant="outline" className="border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Receive
                      </Button>
                      <Button size="sm" variant="ghost" className="text-binance-gold hover:text-binance-gold hover:bg-binance-gold/10">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Create New Wallet */}
                <div className="p-6 rounded-lg border-2 border-dashed border-binance-dark-gray/50 hover:border-binance-gold/50 transition-colors">
                  <div className="text-center">
                    <Plus className="h-12 w-12 text-binance-light-gray mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">Create New Wallet</h3>
                    <p className="text-sm text-binance-light-gray mb-4">
                      Add another currency to your portfolio
                    </p>
                    <Button className="binance-button">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Wallet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Transfer */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="h-5 w-5 text-binance-gold" />
                  Quick Transfer
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Send money instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-binance-light-gray">From</label>
                    <select className="w-full p-2 rounded-lg bg-binance-dark-gray border border-binance-dark-gray text-white">
                      <option>USD Wallet</option>
                      <option>GHS Wallet</option>
                      <option>NGN Wallet</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-binance-light-gray">Amount</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full p-2 rounded-lg bg-binance-dark-gray border border-binance-dark-gray text-white"
                    />
                  </div>
                  <Link href="/send">
                    <Button className="w-full binance-button">
                      Continue to Send
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-binance-light-gray">No recent activity</p>
                    <p className="text-sm text-binance-light-gray mt-1">Transaction history will appear here</p>
                  </div>
                ) : (
                  transactions.slice(0, 5).map((transaction) => {
                    const statusConfig = getStatusBadge(transaction.status)
                    return (
                      <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-lg bg-binance-dark-gray/30 border border-binance-dark-gray/50">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.status === 'confirmed' ? 'bg-green-500' : 
                          transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            {transaction.transaction_type === 'send' ? 'Sent' : 
                             transaction.transaction_type === 'receive' ? 'Received' : 
                             transaction.transaction_type === 'swap' ? 'Swapped' : 
                             transaction.transaction_type === 'buy' ? 'Bought' : 'Sold'} {transaction.currency}
                          </p>
                          <p className="text-xs text-binance-light-gray">
                            {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white font-semibold">
                            {transaction.transaction_type === 'send' ? '-' : '+'}{transaction.amount.toFixed(8)} {transaction.currency}
                          </p>
                          <Badge variant={statusConfig.variant} className={statusConfig.className}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                )}

                <Link href="/transactions">
                  <Button variant="outline" className="w-full border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
                    View All Transactions
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card className="binance-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-binance-gold" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-binance-light-gray">2FA Enabled</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-binance-light-gray">Email Verified</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-binance-light-gray">KYC Status</span>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">Pending</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}