import { supabase } from '../lib/supabase'

export interface PaymentMethod {
  id: string
  name: string
  country: string
  currency: string
  enabled: boolean
  icon?: string
}

export interface PurchaseRequest {
  fiatAmount: number
  fiatCurrency: string
  paymentMethod: string
  phoneNumber?: string
}

export interface PurchaseResponse {
  id: string
  paymentUrl: string
  amount: number
  currency: string
  status: string
}

export interface PurchaseHistory {
  id: string
  amount: number
  currency: string
  actAmount: number
  paymentStatus: string
  paymentMethod: string
  createdAt: string
  completedAt?: string
}

export class PaymentService {
  
  // Get available payment methods for user's country
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    // In a real app, detect user's country from IP/location
    const defaultMethods: PaymentMethod[] = [
      {
        id: 'mpesa',
        name: 'M-PESA',
        country: 'Kenya',
        currency: 'KES',
        enabled: true,
        icon: '/icons/mpesa.svg'
      },
      {
        id: 'mtn',
        name: 'MTN Mobile Money',
        country: 'Uganda, Ghana',
        currency: 'UGX, GHS',
        enabled: true,
        icon: '/icons/mtn.svg'
      },
      {
        id: 'airtel',
        name: 'Airtel Money',
        country: 'Uganda, Tanzania',
        currency: 'UGX, TZS',
        enabled: true,
        icon: '/icons/airtel.svg'
      },
      {
        id: 'vodafone',
        name: 'Vodafone Cash',
        country: 'Ghana',
        currency: 'GHS',
        enabled: true,
        icon: '/icons/vodafone.svg'
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        country: 'International',
        currency: 'USD, EUR, GBP',
        enabled: true,
        icon: '/icons/card.svg'
      },
      {
        id: 'bank',
        name: 'Bank Transfer',
        country: 'All Countries',
        currency: 'All Currencies',
        enabled: true,
        icon: '/icons/bank.svg'
      }
    ]
    
    return defaultMethods
  }
  
  // Calculate ACT token amount from fiat
  static calculateActAmount(fiatAmount: number, currency: string): number {
    const exchangeRates = {
      'KES': 133.50,  // 1 USD = 133.50 KES
      'UGX': 3700.00, // 1 USD = 3700 UGX
      'GHS': 12.50,   // 1 USD = 12.50 GHS
      'TZS': 2330.00, // 1 USD = 2330 TZS
      'RWF': 1050.00, // 1 USD = 1050 RWF
      'ZAR': 18.75,   // 1 USD = 18.75 ZAR
      'USD': 1.00
    }
    
    const actPriceUSD = 1.24 // PPP-calculated ACT token value
    
    const usdAmount = fiatAmount / (exchangeRates[currency] || 1)
    return usdAmount / actPriceUSD
  }
  
  // Create new ACT token purchase
  static async createPurchase(request: PurchaseRequest): Promise<PurchaseResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      // Get user's wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (!wallet) throw new Error('Wallet not found')
      
      // Calculate ACT amount
      const actAmount = this.calculateActAmount(request.fiatAmount, request.fiatCurrency)
      
      // Create purchase record
      const { data: purchase, error } = await supabase
        .from('token_purchases')
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          payment_provider: 'flutterwave',
          payment_method: request.paymentMethod,
          fiat_amount: request.fiatAmount,
          fiat_currency: request.fiatCurrency,
          act_amount: actAmount,
          act_rate_usd: 1.24,
          payment_status: 'pending',
          phone_number: request.phoneNumber
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Generate Flutterwave payment URL
      const paymentUrl = await this.generatePaymentUrl(purchase, request)
      
      return {
        id: purchase.id,
        paymentUrl,
        amount: request.fiatAmount,
        currency: request.fiatCurrency,
        status: purchase.payment_status
      }
      
    } catch (error) {
      console.error('Error creating purchase:', error)
      throw error
    }
  }
  
  // Generate Flutterwave payment URL
  private static async generatePaymentUrl(purchase: any, request: PurchaseRequest): Promise<string> {
    // This would integrate with Flutterwave API
    // For demo, returning a mock payment URL
    return `/buy-act/confirm/${purchase.id}`
  }
  
  // Get user's purchase history
  static async getPurchaseHistory(): Promise<PurchaseHistory[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      const { data: purchases, error } = await supabase
        .from('token_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return purchases.map(p => ({
        id: p.id,
        amount: p.fiat_amount,
        currency: p.fiat_currency,
        actAmount: p.act_amount,
        paymentStatus: p.payment_status,
        paymentMethod: p.payment_method,
        createdAt: p.created_at,
        completedAt: p.completed_at
      }))
      
    } catch (error) {
      console.error('Error fetching purchase history:', error)
      throw error
    }
  }
  
  // Verify payment status
  static async verifyPayment(purchaseId: string): Promise<boolean> {
    try {
      const { data: purchase, error } = await supabase
        .from('token_purchases')
        .select('payment_status')
        .eq('id', purchaseId)
        .single()
      
      if (error) throw error
      
      return purchase.payment_status === 'completed'
      
    } catch (error) {
      console.error('Error verifying payment:', error)
      return false
    }
  }
  
  // Complete purchase after successful payment
  static async completePurchase(purchaseId: string, transactionHash?: string): Promise<boolean> {
    try {
      const { data: purchase, error } = await supabase
        .from('token_purchases')
        .select('*')
        .eq('id', purchaseId)
        .single()
      
      if (error) throw error
      
      // Update purchase status
      const { error: updateError } = await supabase
        .from('token_purchases')
        .update({
          payment_status: 'completed',
          transaction_hash: transactionHash,
          completed_at: new Date().toISOString()
        })
        .eq('id', purchaseId)
      
      if (updateError) throw updateError
      
      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: purchase.wallet?.balance + purchase.act_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchase.wallet_id)
      
      if (walletError) throw walletError
      
      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          to_user_id: purchase.user_id,
          to_wallet_id: purchase.wallet_id,
          amount: purchase.act_amount,
          transaction_type: 'deposit',
          status: 'completed',
          description: `ACT token purchase - ${purchaseId}`
        })
      
      return true
      
    } catch (error) {
      console.error('Error completing purchase:', error)
      return false
    }
  }
}
