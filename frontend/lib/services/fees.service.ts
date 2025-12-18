/**
 * Fees Service
 * Handles fee structures, trading costs, and VIP tier management
 */
import { createClient } from "@/lib/supabase/client"

export interface FeeStructure {
  id: string
  fee_type: 'trading' | 'withdrawal' | 'transfer' | 'deposit'
  maker_fee: number
  taker_fee: number
  base_fee: number
  currency?: string
  is_active: boolean
  effective_date: string
}

export interface VIPTier {
  id: string
  tier_name: string
  tier_level: number
  minimum_volume: number
  maker_discount: number
  taker_discount: number
  withdrawal_discount: number
  benefits: string[]
  is_active: boolean
}

export interface UserFeeInfo {
  current_tier: VIPTier | null
  monthly_volume: number
  estimated_fees: {
    trading: number
    withdrawal: number
    transfer: number
  }
}

class FeesService {
  private supabase = createClient()

  /**
   * Get all active fee structures
   */
  async getFeeStructures(): Promise<FeeStructure[]> {
    try {
      const { data, error } = await this.supabase
        .from('fee_structures')
        .select('*')
        .eq('is_active', true)
        .order('fee_type')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching fee structures:', error)
      return []
    }
  }

  /**
   * Get all active VIP tiers
   */
  async getVIPTiers(): Promise<VIPTier[]> {
    try {
      const { data, error } = await this.supabase
        .from('vip_tiers')
        .select('*')
        .eq('is_active', true)
        .order('tier_level')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching VIP tiers:', error)
      return []
    }
  }

  /**
   * Calculate user's current fee tier based on volume
   */
  async getUserFeeInfo(userId?: string): Promise<UserFeeInfo> {
    try {
      // Get VIP tiers
      const tiers = await this.getVIPTiers()
      
      // Calculate user's monthly trading volume
      let monthlyVolume = 0
      if (userId) {
        const { data: trades } = await this.supabase
          .from('trades')
          .select('total')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        monthlyVolume = trades?.reduce((sum, trade) => sum + trade.total, 0) || 0
      }

      // Find current tier
      const currentTier = tiers.find(tier => monthlyVolume >= tier.minimum_volume) || tiers[0]

      // Calculate estimated fees based on tier
      const feeStructures = await this.getFeeStructures()
      const tradingFee = feeStructures.find(f => f.fee_type === 'trading')
      const withdrawalFee = feeStructures.find(f => f.fee_type === 'withdrawal')
      const transferFee = feeStructures.find(f => f.fee_type === 'transfer')

      return {
        current_tier: currentTier,
        monthly_volume: monthlyVolume,
        estimated_fees: {
          trading: tradingFee ? 
            (tradingFee.base_fee * (1 - (currentTier?.maker_discount || 0) / 100)) : 0,
          withdrawal: withdrawalFee ? 
            (withdrawalFee.base_fee * (1 - (currentTier?.withdrawal_discount || 0) / 100)) : 0,
          transfer: transferFee ? 
            (transferFee.base_fee * (1 - (currentTier?.taker_discount || 0) / 100)) : 0
        }
      }
    } catch (error) {
      console.error('Error calculating user fees:', error)
      return {
        current_tier: null,
        monthly_volume: 0,
        estimated_fees: { trading: 0, withdrawal: 0, transfer: 0 }
      }
    }
  }

  /**
   * Get user volume for fee calculation
   */
  private async getUserVolume(userId: string): Promise<number> {
    try {
      const { data: trades } = await this.supabase
        .from('trades')
        .select('total')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      return trades?.reduce((sum, trade) => sum + trade.total, 0) || 0
    } catch (error) {
      console.error('Error calculating user volume:', error)
      return 0
    }
  }

  /**
   * Update fee structure (admin only)
   */
  async updateFeeStructure(feeId: string, updates: Partial<FeeStructure>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('fee_structures')
        .update(updates)
        .eq('id', feeId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating fee structure:', error)
      return false
    }
  }

  /**
   * Calculate trading fee for specific amount
   */
  calculateTradingFee(amount: number, userVolume: number, feeStructure: FeeStructure): {
    makerFee: number
    takerFee: number
    effectiveFee: number
  } {
    // This would be more sophisticated in production
    // including VIP discounts, volume-based rates, etc.
    
    const baseMakerFee = amount * (feeStructure.maker_fee / 100)
    const baseTakerFee = amount * (feeStructure.taker_fee / 100)
    
    return {
      makerFee: baseMakerFee,
      takerFee: baseTakerFee,
      effectiveFee: Math.min(baseMakerFee, baseTakerFee)
    }
  }
}

export const feesService = new FeesService()
export default feesService