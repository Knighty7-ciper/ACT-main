/**
 * Market Data Service
 * Handles real-time market data from external APIs and database
 */
import { createClient } from "@/lib/supabase/client"

export interface MarketPair {
  id: string
  base_currency: string
  quote_currency: string
  current_price: number
  price_change_24h: number
  volume_24h: number
  market_cap: number
  last_updated: string
  is_active: boolean
}

export interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
  is_fiat: boolean
  is_crypto: boolean
  supported_countries: string[]
  trading_enabled: boolean
}

export interface MarketStats {
  total_volume: number
  active_pairs: number
  total_trades_24h: number
  top_gainer: {
    pair: string
    change: number
  }
}

class MarketDataService {
  private supabase = createClient()

  /**
   * Get all active trading pairs with current prices
   */
  async getActivePairs(): Promise<MarketPair[]> {
    try {
      const { data, error } = await this.supabase
        .from('trading_pairs')
        .select(`
          *,
          base_currency:currencies!trading_pairs_base_currency_fkey(*),
          quote_currency:currencies!trading_pairs_quote_currency_fkey(*)
        `)
        .eq('is_active', true)
        .order('volume_24h', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching active pairs:', error)
      return []
    }
  }

  /**
   * Get current price for a specific trading pair
   */
  async getPairPrice(baseCurrency: string, quoteCurrency: string): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('trading_pairs')
        .select('current_price')
        .eq('base_currency', baseCurrency)
        .eq('quote_currency', quoteCurrency)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data?.current_price || null
    } catch (error) {
      console.error('Error fetching pair price:', error)
      return null
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats(): Promise<MarketStats> {
    try {
      // Get aggregated statistics from trading_pairs table
      const { data: pairs, error } = await this.supabase
        .from('trading_pairs')
        .select('volume_24h, price_change_24h')
        .eq('is_active', true)

      if (error) throw error

      const totalVolume = pairs?.reduce((sum, pair) => sum + (pair.volume_24h || 0), 0) || 0
      const activePairs = pairs?.length || 0
      
      // Get top gainer
      const topGainer = pairs?.reduce((best, current) => 
        current.price_change_24h > best.price_change_24h ? current : best
      )

      // Get total trades (this would come from a separate trades table)
      const { data: trades } = await this.supabase
        .from('transactions')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      return {
        total_volume: totalVolume,
        active_pairs: activePairs,
        total_trades_24h: trades?.length || 0,
        top_gainer: {
          pair: topGainer ? `${topGainer.base_currency}/${topGainer.quote_currency}` : 'N/A',
          change: topGainer?.price_change_24h || 0
        }
      }
    } catch (error) {
      console.error('Error fetching market stats:', error)
      return {
        total_volume: 0,
        active_pairs: 0,
        total_trades_24h: 0,
        top_gainer: { pair: 'N/A', change: 0 }
      }
    }
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<Currency[]> {
    try {
      const { data, error } = await this.supabase
        .from('currencies')
        .select('*')
        .eq('trading_enabled', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching currencies:', error)
      return []
    }
  }

  /**
   * Update market data (for real-time updates)
   */
  async updateMarketData(): Promise<void> {
    try {
      // This would be called by a scheduled job or webhook
      // to update prices from external APIs like Binance, Coinbase, etc.
      
      // For now, this is a placeholder for the real implementation
      console.log('Market data update scheduled')
    } catch (error) {
      console.error('Error updating market data:', error)
    }
  }
}

export const marketDataService = new MarketDataService()
export default marketDataService