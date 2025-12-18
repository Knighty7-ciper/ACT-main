import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, ArrowLeft, Check, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { feesService, type FeeStructure, type VIPTier, type UserFeeInfo } from "@/lib/services/fees.service"
import StandardNav from "@/components/standard-nav"

export default function FeesPage() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [vipTiers, setVipTiers] = useState<VIPTier[]>([])
  const [userFeeInfo, setUserFeeInfo] = useState<UserFeeInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeesData()
  }, [])

  const loadFeesData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [feeData, vipData, userFeeData] = await Promise.all([
        feesService.getFeeStructures(),
        feesService.getVIPTiers(),
        feesService.getUserFeeInfo() // User-specific fees if logged in
      ])

      setFeeStructures(feeData)
      setVipTiers(vipData)
      setUserFeeInfo(userFeeData)
    } catch (err) {
      setError('Failed to load fees data')
      console.error('Error loading fees data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatFee = (fee: number, currency?: string) => {
    if (currency === 'ACT') {
      return `${fee} ACT`
    }
    return `${fee.toFixed(2)}%`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `₦${(volume / 1000000000).toFixed(1)}B`
    } else if (volume >= 1000000) {
      return `₦${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `₦${(volume / 1000).toFixed(1)}K`
    }
    return `₦${volume.toFixed(0)}`
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-binance-light-gray hover:text-binance-gold transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Trading Fees</h1>
          <p className="text-xl text-binance-light-gray">Transparent fee structure for all our services</p>
        </div>

        {/* Fee Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="binance-card">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-binance-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Starting at 0.1%</h3>
              <p className="text-binance-light-gray">Low trading fees for all users</p>
            </CardContent>
          </Card>
          
          <Card className="binance-card">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Volume Discounts</h3>
              <p className="text-binance-light-gray">Reduce fees with higher volume</p>
            </CardContent>
          </Card>

          <Card className="binance-card">
            <CardContent className="p-6 text-center">
              <Check className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Hidden Fees</h3>
              <p className="text-binance-light-gray">What you see is what you pay</p>
            </CardContent>
          </Card>
        </div>

        {/* Fee Structure */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Fee Structure</h2>
          <Card className="binance-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-binance-dark-gray">
                      <th className="text-left p-4 text-binance-light-gray font-medium">Service Type</th>
                      <th className="text-center p-4 text-binance-light-gray font-medium">VIP 0</th>
                      <th className="text-center p-4 text-binance-light-gray font-medium">VIP 1</th>
                      <th className="text-center p-4 text-binance-light-gray font-medium">VIP 2</th>
                      <th className="text-left p-4 text-binance-light-gray font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="border-b border-binance-dark-gray">
                          <td className="p-4">
                            <div className="h-4 bg-gray-600 rounded w-24 animate-pulse"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-gray-600 rounded w-16 mx-auto animate-pulse"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-gray-600 rounded w-16 mx-auto animate-pulse"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-gray-600 rounded w-16 mx-auto animate-pulse"></div>
                          </td>
                          <td className="p-4">
                            <div className="h-4 bg-gray-600 rounded w-32 animate-pulse"></div>
                          </td>
                        </tr>
                      ))
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-red-400">
                          {error}
                        </td>
                      </tr>
                    ) : feeStructures.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-binance-light-gray">
                          No fee structures available
                        </td>
                      </tr>
                    ) : (
                      feeStructures.map((fee) => (
                        <tr key={fee.id} className="border-b border-binance-dark-gray hover:bg-binance-dark-gray/30">
                          <td className="p-4 font-medium text-white capitalize">{fee.fee_type}</td>
                          <td className="p-4 text-center text-white">{formatFee(fee.maker_fee, fee.currency)}</td>
                          <td className="p-4 text-center text-white">{formatFee(fee.taker_fee, fee.currency)}</td>
                          <td className="p-4 text-center text-white">{formatFee(fee.base_fee, fee.currency)}</td>
                          <td className="p-4 text-binance-light-gray">
                            {fee.fee_type === 'trading' ? 'Fees for buying and selling tokens' :
                             fee.fee_type === 'withdrawal' ? 'Fees for withdrawing funds from your wallet' :
                             fee.fee_type === 'transfer' ? 'Free transfers between PESA-AFRIK users' :
                             'Fees for depositing funds to your wallet'}
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

        {/* VIP Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">VIP Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="binance-card">
                  <CardHeader className="text-center">
                    <div className="h-6 bg-gray-600 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-600 rounded w-32 mx-auto animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="h-8 bg-gray-600 rounded w-16 mx-auto mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-600 rounded w-24 mx-auto animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex items-center">
                          <div className="h-4 w-4 bg-gray-600 rounded mr-2 animate-pulse"></div>
                          <div className="h-4 bg-gray-600 rounded flex-1 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={loadFeesData} variant="outline" className="border-binance-gold text-binance-gold">
                  Retry
                </Button>
              </div>
            ) : vipTiers.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-binance-light-gray">No VIP tiers available</p>
              </div>
            ) : (
              vipTiers.map((tier) => (
                <Card key={tier.id} className="binance-card hover:border-binance-gold/30 transition-colors">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">{tier.tier_name}</CardTitle>
                    <CardDescription className="text-binance-light-gray">
                      {formatVolume(tier.minimum_volume)} monthly volume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-binance-gold mb-2">
                        {formatFee(tier.maker_discount)}%
                      </div>
                      <p className="text-binance-light-gray">Trading Fee Discount</p>
                    </div>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center text-binance-light-gray">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Fee Calculator */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Fee Calculator</h2>
          <Card className="binance-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Trade Amount (ACT)</label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="w-full p-3 bg-binance-dark-gray border border-binance-dark-gray rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Trade Type</label>
                  <select className="w-full p-3 bg-binance-dark-gray border border-binance-dark-gray rounded text-white">
                    <option>Buy ACT</option>
                    <option>Sell ACT</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 p-4 bg-binance-dark-gray/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-binance-light-gray">Trading Fee</p>
                    <p className="text-white font-semibold">1.00 ACT (0.1%)</p>
                  </div>
                  <div>
                    <p className="text-binance-light-gray">Network Fee</p>
                    <p className="text-white font-semibold">0.01 ACT</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Notes */}
        <Card className="binance-card">
          <CardHeader>
            <CardTitle className="text-white">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <X className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-white font-medium">Trading Fees</p>
                <p className="text-binance-light-gray">Fees are calculated on the ACT/NGN pair and may vary based on market conditions.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <X className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-white font-medium">Network Fees</p>
                <p className="text-binance-light-gray">Stellar network fees are applied to all transactions and are not controlled by PESA-AFRIK.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-white font-medium">No Deposit Fees</p>
                <p className="text-binance-light-gray">Deposits to your PESA-AFRIK account are completely free.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-white font-medium">Transparent Pricing</p>
                <p className="text-binance-light-gray">All fees are clearly displayed before you confirm any transaction.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="binance-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Trading?</h2>
              <p className="text-binance-light-gray mb-6">
                Join thousands of users enjoying low fees and fast transactions on PESA-AFRIK.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/sign-up">
                  <Button className="binance-button text-lg px-8 py-3">
                    Create Account
                  </Button>
                </Link>
                <Link href="/markets">
                  <Button variant="outline" className="border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black text-lg px-8 py-3">
                    View Markets
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
