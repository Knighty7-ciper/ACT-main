'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, ArrowLeft, Download } from 'lucide-react'
import StandardNav from '@/components/standard-nav'

interface PurchaseDetails {
  id: string
  user_id: string
  fiat_amount: number
  fiat_currency: string
  act_amount: number
  act_rate_usd: number
  payment_method: string
  payment_status: string
  payment_provider: string
  created_at: string
  completed_at?: string
}

export default function ConfirmPurchasePage() {
  const params = useParams()
  const router = useRouter()
  const [purchase, setPurchase] = useState<PurchaseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPurchaseDetails()
  }, [params.id])

  const fetchPurchaseDetails = async () => {
    try {
      const response = await fetch(`/api/purchase/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Purchase not found')
      }

      const data = await response.json()
      setPurchase(data.purchase)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentVerification = async () => {
    setProcessing(true)
    try {
      // In a real implementation, this would verify payment with Flutterwave
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 3000))

      const response = await fetch(`/api/purchase/${params.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Payment verification failed')
      }

      // Refresh purchase data
      await fetchPurchaseDetails()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-binance-gold mx-auto mb-4" />
          <p className="text-white">Loading purchase details...</p>
        </div>
      </div>
    )
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900 flex items-center justify-center">
        <Card className="binance-card border-red-500/20 max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Purchase Not Found</h2>
            <p className="text-binance-light-gray mb-4">{error}</p>
            <Button 
              onClick={() => router.push('/buy-act')}
              className="bg-binance-gold hover:bg-binance-gold/90 text-black"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Buy ACT
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment Confirmation</h1>
          <p className="text-binance-light-gray">Complete your ACT token purchase</p>
        </div>

        <Card className="binance-card border-binance-gold/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Purchase Details
              <Badge 
                variant={purchase.payment_status === 'completed' ? 'default' : 'secondary'}
                className={
                  purchase.payment_status === 'completed' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }
              >
                {purchase.payment_status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-binance-light-gray text-sm">ACT Tokens</p>
                <p className="text-2xl font-bold text-binance-gold">
                  {purchase.act_amount.toFixed(7)}
                </p>
              </div>
              <div>
                <p className="text-binance-light-gray text-sm">Payment Amount</p>
                <p className="text-2xl font-bold text-white">
                  {purchase.fiat_amount} {purchase.fiat_currency}
                </p>
              </div>
              <div>
                <p className="text-binance-light-gray text-sm">Payment Method</p>
                <p className="text-white font-semibold">{purchase.payment_method.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-binance-light-gray text-sm">ACT Rate</p>
                <p className="text-white font-semibold">${purchase.act_rate_usd} USD</p>
              </div>
            </div>

            <div className="border-t border-binance-gold/20 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-binance-light-gray">Created</span>
                <span className="text-white">
                  {new Date(purchase.created_at).toLocaleString()}
                </span>
              </div>
              {purchase.completed_at && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-binance-light-gray">Completed</span>
                  <span className="text-white">
                    {new Date(purchase.completed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Actions */}
        {purchase.payment_status === 'pending' && (
          <Card className="binance-card border-binance-gold/20 mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Complete Payment
                  </h3>
                  <p className="text-binance-light-gray text-sm">
                    Complete your payment through {purchase.payment_method.toUpperCase()} 
                    to receive your ACT tokens
                  </p>
                </div>

                <div className="bg-binance-dark border border-binance-gold/20 rounded-lg p-4">
                  <div className="text-center space-y-2">
                    <p className="text-binance-light-gray text-sm">
                      Payment will be processed through Flutterwave
                    </p>
                    <p className="text-white">
                      Amount: {purchase.fiat_amount} {purchase.fiat_currency}
                    </p>
                    <p className="text-binance-light-gray text-sm">
                      You will receive: {purchase.act_amount.toFixed(7)} ACT tokens
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push('/buy-act')}
                    variant="outline"
                    className="border-binance-gold/20 text-binance-light-gray hover:bg-binance-gold/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePaymentVerification}
                    disabled={processing}
                    className="bg-binance-gold hover:bg-binance-gold/90 text-black"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Verify Payment'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {purchase.payment_status === 'completed' && (
          <Card className="binance-card border-green-500/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Purchase Completed!
              </h3>
              <p className="text-binance-light-gray mb-6">
                Your ACT tokens have been added to your wallet
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-binance-gold hover:bg-binance-gold/90 text-black"
                >
                  View in Dashboard
                </Button>
                <Button 
                  variant="outline"
                  className="border-binance-gold/20 text-binance-light-gray hover:bg-binance-gold/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed State */}
        {purchase.payment_status === 'failed' && (
          <Card className="binance-card border-red-500/20">
            <CardContent className="p-6 text-center">
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Payment Failed
              </h3>
              <p className="text-binance-light-gray mb-6">
                Your payment could not be processed. Please try again.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={() => router.push('/buy-act')}
                  className="bg-binance-gold hover:bg-binance-gold/90 text-black"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  className="border-binance-gold/20 text-binance-light-gray hover:bg-binance-gold/10"
                  onClick={() => router.push('/support')}
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}