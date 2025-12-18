/**
 * Trading Service
 * Handles trading operations, order management, and market interactions
 */
import { createClient } from "@/lib/supabase/client"

export interface Order {
  id: string
  user_id: string
  pair_id: string
  order_type: 'market' | 'limit'
  side: 'buy' | 'sell'
  quantity: number
  price?: number
  filled_quantity: number
  status: 'pending' | 'partial' | 'filled' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  order_id: string
  user_id: string
  price: number
  quantity: number
  total: number
  fee: number
  created_at: string
}

export interface OrderBook {
  bids: Array<{ price: number; quantity: number }>
  asks: Array<{ price: number; quantity: number }>
  last_updated: string
}

class TradingService {
  private supabase = createClient()

  /**
   * Place a new order
   */
  async placeOrder(orderData: {
    pair_id: string
    order_type: 'market' | 'limit'
    side: 'buy' | 'sell'
    quantity: number
    price?: number
  }): Promise<Order | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return null

      // Validate user has sufficient balance
      const hasBalance = await this.validateUserBalance(orderData.side, orderData.quantity, orderData.price)
      if (!hasBalance) {
        throw new Error('Insufficient balance')
      }

      const { data, error } = await this.supabase
        .from('orders')
        .insert({
          user_id: user.id,
          ...orderData,
          filled_quantity: 0,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error placing order:', error)
      return null
    }
  }

  /**
   * Get user's order history
   */
  async getUserOrders(limit: number = 50): Promise<Order[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          pair:trading_pairs(
            base_currency,
            quote_currency
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user orders:', error)
      return []
    }
  }

  /**
   * Get order book for a trading pair
   */
  async getOrderBook(pairId: string): Promise<OrderBook | null> {
    try {
      // Get buy orders (bids)
      const { data: buyOrders } = await this.supabase
        .from('orders')
        .select('price, quantity, filled_quantity')
        .eq('pair_id', pairId)
        .eq('side', 'buy')
        .eq('status', 'pending')
        .order('price', { ascending: false })

      // Get sell orders (asks)
      const { data: sellOrders } = await this.supabase
        .from('orders')
        .select('price, quantity, filled_quantity')
        .eq('pair_id', pairId)
        .eq('side', 'sell')
        .eq('status', 'pending')
        .order('price', { ascending: true })

      const bids = buyOrders?.map(order => ({
        price: order.price,
        quantity: order.quantity - order.filled_quantity
      })).filter(order => order.quantity > 0) || []

      const asks = sellOrders?.map(order => ({
        price: order.price,
        quantity: order.quantity - order.filled_quantity
      })).filter(order => order.quantity > 0) || []

      return {
        bids,
        asks,
        last_updated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching order book:', error)
      return null
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      const { error } = await this.supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error cancelling order:', error)
      return false
    }
  }

  /**
   * Get user's trade history
   */
  async getUserTrades(limit: number = 50): Promise<Trade[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await this.supabase
        .from('trades')
        .select(`
          *,
          order:orders(
            pair:trading_pairs(
              base_currency,
              quote_currency
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user trades:', error)
      return []
    }
  }

  /**
   * Calculate trading fee
   */
  calculateTradingFee(amount: number, userVolume: number): number {
    // Fee tiers based on 30-day volume
    let feeRate = 0.001 // 0.1% default
    
    if (userVolume >= 1000000) feeRate = 0.0002 // 0.02% VIP
    else if (userVolume >= 100000) feeRate = 0.0004 // 0.04% Premium
    else if (userVolume >= 10000) feeRate = 0.0006 // 0.06% Advanced
    else if (userVolume >= 1000) feeRate = 0.0008 // 0.08% Basic
    
    return amount * feeRate
  }

  /**
   * Validate user balance for trading
   */
  private async validateUserBalance(
    side: 'buy' | 'sell',
    quantity: number,
    price?: number
  ): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      // Get user wallet balance
      const { data: wallet } = await this.supabase
        .from('wallets')
        .select('balances')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!wallet) return false

      if (side === 'sell') {
        // Check if user has enough of the base currency
        // This would need the actual pair data to determine the base currency
        return true // Placeholder - implement based on actual pair
      } else {
        // For buy orders, check if user has enough of the quote currency
        const totalCost = price ? quantity * price : quantity
        const quoteCurrencyBalance = wallet.balances['USD'] || 0 // Adjust based on pair
        return quoteCurrencyBalance >= totalCost
      }
    } catch (error) {
      console.error('Error validating user balance:', error)
      return false
    }
  }
}

export const tradingService = new TradingService()
export default tradingService