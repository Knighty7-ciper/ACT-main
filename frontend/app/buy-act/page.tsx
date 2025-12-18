'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wallet, Phone, CreditCard, Building, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import StandardNav from '@/components/standard-nav'

interface PurchaseData {
  id: string
  act_amount: number
  fiat_amount: number
  fiat_currency: string
  payment_method: string
  status: string
  payment_url: string
}

const PAYMENT_METHODS = [
  {
    id: 'mpesa',
    name: 'MPESA',
    description: 'Pay with M-PESA (Kenya)',
    icon: Phone,
    currency: 'KES',
    flag: '🇰🇪'
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    description: 'Pay with MTN Mobile Money',
    icon: Phone,
    currency: 'UGX',
    flag: '🇺🇬'
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    description: 'Pay with Airtel Money',
    icon: Phone,
    currency: 'UGX',
    flag: '🇺🇬'
  },
  {
    id: 'vodafone',
    name: 'Vodafone Cash',
    description: 'Pay with Vodafone Cash',
    icon: Phone,
    currency: 'GHS',
    flag: '🇬🇭'
  },
  {
    id: 'bank_card',
    name: 'Bank Card',
    description: 'Pay with Visa/Mastercard',
    icon: CreditCard,
    currency: 'KES',
    flag: '💳'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: Building,
    currency: 'KES',
    flag: '🏦'
  }
]

const ACT_RATE_USD = 1.24
const KES_TO_USD = 130 // Approximate rate

export default function BuyACTPage() {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [error, setError] = useState('')

  // Calculate ACT tokens user will receive
  const calculateACTAmount = () => {
    const fiatAmount = parseFloat(amount) || 0
    const usdAmount = fiatAmount / KES_TO_USD
    return usdAmount / ACT_RATE_USD
  }

  const handlePurchase = async () => {
    if (!user) {
      setError('Please login to purchase ACT tokens')
      return
    }

    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }

    if (!phoneNumber && selectedMethod !== 'bank_card' && selectedMethod !== 'bank_transfer') {
      setError('Please enter your phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_method: selectedMethod,
          phone_number: phoneNumber
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed')
      }

      setPurchaseData(data.purchase)
      // Redirect to payment confirmation page
      window.location.href = `/buy-act/confirm/${data.purchase.id}`
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (purchaseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="binance-card border-binance-gold/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Purchase Confirmed
              </CardTitle>
              <div className="w-16 h-16 bg-binance-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-black" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-binance-dark border border-binance-gold/20 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-binance-light-gray">ACT Tokens</p>
                    <p className="text-xl font-bold text-binance-gold">
                      {purchaseData.act_amount.toFixed(7)}
                    </p>
                  </div>
                  <div>
                    <p className="text-binance-light-gray">Payment Amount</p>
                    <p className="text-xl font-bold text-white">
                      {purchaseData.fiat_amount} {purchaseData.fiat_currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-binance-light-gray">Payment Method</p>
                    <p className="text-white font-semibold">{selectedMethod.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-binance-light-gray">Status</p>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      {purchaseData.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-binance-light-gray mb-4">
                  Your ACT tokens will be added to your wallet once payment is confirmed.
                </p>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-binance-gold hover:bg-binance-gold/90 text-black"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav 
        isAuthenticated={!!user} 
        user={user ? { email: user.email!, isAdmin: false } : undefined} 
      />
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Buy ACT Tokens</h1>
          <p className="text-binance-light-gray">
            Purchase African Currency Tokens with your local payment methods
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-binance-gold/10 border border-binance-gold/20 rounded-lg px-4 py-2">
            <span className="text-binance-light-gray">Current Rate:</span>
            <span className="text-binance-gold font-bold">1 ACT = ${ACT_RATE_USD} USD</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Purchase Form */}
          <Card className="binance-card border-binance-gold/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-binance-gold" />
                Purchase ACT Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Amount to Pay</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-binance-dark border-binance-gold/20 text-white pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-binance-light-gray text-sm">
                    KES
                  </div>
                </div>
                {amount && (
                  <div className="text-sm text-binance-light-gray">
                    ≈ ${((parseFloat(amount) || 0) / KES_TO_USD).toFixed(2)} USD
                  </div>
                )}
              </div>

              {/* ACT Token Display */}
              {amount && (
                <div className="bg-binance-dark border border-binance-gold/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-binance-light-gray">You will receive:</span>
                    <span className="text-2xl font-bold text-binance-gold">
                      {calculateACTAmount().toFixed(7)} ACT
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div className="space-y-4">
                <Label className="text-white">Payment Method</Label>
                <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                  <div className="grid gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon
                      return (
                        <div key={method.id} className="flex items-center space-x-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label 
                            htmlFor={method.id} 
                            className="flex-1 cursor-pointer flex items-center gap-3 p-3 rounded-lg border border-binance-gold/20 hover:border-binance-gold/40 transition-colors"
                          >
                            <Icon className="h-5 w-5 text-binance-gold" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{method.name}</span>
                                <span className="text-sm">{method.flag}</span>
                              </div>
                              <p className="text-sm text-binance-light-gray">{method.description}</p>
                            </div>
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>
              </div>

              {/* Phone Number for Mobile Money */}
              {selectedMethod && selectedMethod !== 'bank_card' && selectedMethod !== 'bank_transfer' && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    {selectedMethod.toUpperCase()} Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="254 700 000 000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-binance-dark border-binance-gold/20 text-white"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Purchase Button */}
              <Button
                onClick={handlePurchase}
                disabled={!amount || !selectedMethod || isLoading}
                className="w-full bg-binance-gold hover:bg-binance-gold/90 text-black text-lg py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Buy {calculateACTAmount().toFixed(7)} ACT Tokens
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="binance-card border-binance-gold/20">
            <CardHeader>
              <CardTitle className="text-white">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-binance-light-gray">ACT Token Rate</span>
                  <span className="text-white">${ACT_RATE_USD} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-binance-light-gray">Processing Time</span>
                  <span className="text-white">1-5 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-binance-light-gray">Network Fee</span>
                  <span className="text-green-400">Free</span>
                </div>
              </div>

              <div className="border-t border-binance-gold/20 pt-4">
                <h4 className="text-white font-medium mb-2">Supported Countries</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>🇰🇪</span>
                    <span className="text-binance-light-gray">Kenya - MPESA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🇺🇬</span>
                    <span className="text-binance-light-gray">Uganda - MTN, Airtel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🇬🇭</span>
                    <span className="text-binance-light-gray">Ghana - MTN, Vodafone Cash</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-binance-gold/20 pt-4">
                <h4 className="text-white font-medium mb-2">Security</h4>
                <p className="text-binance-light-gray text-sm">
                  All payments are processed securely through encrypted connections. 
                  Your ACT tokens will be delivered to your wallet immediately after payment confirmation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}