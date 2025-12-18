'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Download, Eye, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface Purchase {
  id: string
  act_amount: number
  fiat_amount: number
  fiat_currency: string
  payment_method: string
  payment_status: string
  created_at: string
  completed_at?: string
  purchase_receipts?: Array<{
    receipt_number: string
    pdf_url?: string
  }>
}

export default function ACTPurchaseHistory({ userId }: { userId: string }) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPurchases()
  }, [userId])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchase/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch purchase history')
      }

      const data = await response.json()
      setPurchases(data.purchases || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-binance-gold mx-auto mb-4" />
        <p className="text-binance-light-gray">Loading purchase history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchPurchases} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="h-16 w-16 text-binance-light-gray mx-auto mb-4" />
        <p className="text-binance-light-gray">No ACT token purchases yet</p>
        <p className="text-sm text-binance-light-gray mt-2 mb-4">
          Purchase ACT tokens to start using African currency tokens
        </p>
        <Link href="/buy-act">
          <Button className="bg-binance-gold hover:bg-binance-gold/90 text-black">
            Buy ACT Tokens
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="bg-binance-dark-gray/30 border border-binance-dark-gray/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {getPaymentMethodIcon(purchase.payment_method)}
              <div>
                <p className="text-sm text-white font-medium">
                  {purchase.act_amount.toFixed(7)} ACT Tokens
                </p>
                <p className="text-xs text-binance-light-gray">
                  {new Date(purchase.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {getStatusBadge(purchase.payment_status)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-binance-light-gray">Payment Amount</p>
              <p className="text-white font-semibold">
                {purchase.fiat_amount} {purchase.fiat_currency}
              </p>
            </div>
            <div>
              <p className="text-binance-light-gray">Payment Method</p>
              <p className="text-white font-semibold">
                {purchase.payment_method.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-binance-light-gray">ACT Rate</p>
              <p className="text-white font-semibold">$1.24 USD</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/buy-act/confirm/${purchase.id}`}>
                <Button size="sm" variant="outline" className="border-binance-gold/20 text-binance-gold hover:bg-binance-gold/10">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              {purchase.purchase_receipts?.[0] && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-binance-gold/20 text-binance-gold hover:bg-binance-gold/10"
                  onClick={() => {
                    // In production, this would download the PDF
                    alert(`Receipt: ${purchase.purchase_receipts[0].receipt_number}`)
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {purchase.payment_status === 'pending' && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                Your payment is being processed. You will receive your ACT tokens shortly.
              </p>
            </div>
          )}

          {purchase.payment_status === 'completed' && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                ✅ Purchase completed! Your ACT tokens have been added to your wallet.
                {purchase.completed_at && ` Completed on ${new Date(purchase.completed_at).toLocaleString()}`}
              </p>
            </div>
          )}
        </div>
      ))}

      {purchases.length > 5 && (
        <div className="text-center pt-4">
          <Link href="/transactions">
            <Button variant="outline" className="border-binance-gold text-binance-gold hover:bg-binance-gold hover:text-binance-black">
              View All Purchases
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}