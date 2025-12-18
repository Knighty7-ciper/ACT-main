/**
 * ACT Token Purchase Service - PesaPal Integration
 * 
 * This service handles the complete ACT token purchasing flow using PesaPal payment gateway.
 * PesaPal is specifically designed for African markets with mobile money integration.
 */

import { createClient } from '@supabase/supabase-js';

// Environment configuration
const config = {
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  ACT_PRICE_USD: 1.24,
  
  // Exchange rates (should be fetched from API)
  EXCHANGE_RATES: {
    USD: 1.0,
    KES: 133.5,
    UGX: 3700.0,
    GHS: 12.5,
    TZS: 2330.0
  }
};

export interface ACTPurchaseRequest {
  userId: string;
  actAmount: number;
  fiatAmount: number;
  fiatCurrency: 'KES' | 'UGX' | 'GHS' | 'TZS' | 'USD';
  paymentMethod: 'mpesa' | 'mtn' | 'airtel' | 'vodafone' | 'card' | 'bank_transfer';
  customerInfo: {
    email: string;
    phoneNumber: string;
    name: string;
  };
}

export interface PesaPalPaymentResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  status: string;
  message: string;
}

export interface PesaPalTransactionStatus {
  payment_status_description: string;
  payment_method: string;
  confirmation_code?: string;
  message: string;
  description?: string;
}

export interface ACTPurchaseRecord {
  id: string;
  user_id: string;
  fiat_amount: number;
  act_amount: number;
  fiat_currency: string;
  payment_method: string;
  pesapal_order_tracking_id?: string;
  pesapal_status: string;
  payment_status: string;
  expires_at: string;
  created_at: string;
}

export interface Currency {
  KES: string;
  UGX: string;
  GHS: string;
  TZS: string;
  USD: string;
}

export interface PaymentMethod {
  mpesa: string;
  mtn: string;
  airtel: string;
  vodafone: string;
  card: string;
  bank_transfer: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class ACTPaymentService {
  // Supabase client
  private readonly supabase = config.SUPABASE_URL && config.SUPABASE_ANON_KEY 
    ? createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
    : null;

  constructor() {
    console.log('🚀 ACT Payment Service initialized');
    console.log('📡 Backend URL:', config.BACKEND_URL);
    console.log('💰 ACT Price:', config.ACT_PRICE_USD, 'USD');
  }

  /**
   * Initiate ACT token purchase via backend API
   */
  async initiatePurchase(purchaseData: ACTPurchaseRequest): Promise<PesaPalPaymentResponse> {
    try {
      console.log('🚀 Initiating ACT token purchase...');

      // 1. Validate purchase data
      if (!purchaseData.userId || !purchaseData.actAmount || !purchaseData.fiatAmount) {
        throw new Error('Invalid purchase data: missing required fields');
      }

      if (!purchaseData.customerInfo?.email) {
        throw new Error('Customer email is required');
      }

      // 2. Create purchase record in database (through backend)
      if (this.supabase) {
        const { error: purchaseError } = await this.supabase
          .from('token_purchases')
          .insert({
            user_id: purchaseData.userId,
            act_amount: purchaseData.actAmount,
            fiat_amount: purchaseData.fiatAmount,
            fiat_currency: purchaseData.fiatCurrency,
            payment_method: purchaseData.paymentMethod,
            phone_number: purchaseData.customerInfo.phoneNumber,
            customer_name: purchaseData.customerInfo.name,
            customer_email: purchaseData.customerInfo.email,
            payment_status: 'pending',
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          });

        if (purchaseError) {
          console.warn('⚠️ Failed to create purchase record, continuing with payment:', purchaseError.message);
        }
      }

      // 3. Call backend API to initiate payment
      const paymentData = {
        orderId: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: purchaseData.fiatAmount,
        currency: purchaseData.fiatCurrency,
        callbackUrl: config.BACKEND_URL,
        customerInfo: {
          email: purchaseData.customerInfo.email || '',
          phoneNumber: purchaseData.customerInfo.phoneNumber || '',
          firstName: purchaseData.customerInfo.name.split(' ')[0] || 'ACT',
          lastName: purchaseData.customerInfo.name.split(' ').slice(1).join(' ') || 'User'
        }
      };

      const response = await fetch(`${config.BACKEND_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Payment initiation failed');
      }

      console.log('✅ Payment initiated successfully:', result.order_tracking_id);

      return {
        order_tracking_id: result.order_tracking_id,
        merchant_reference: result.merchant_reference,
        redirect_url: result.redirect_url,
        status: 'success',
        message: result.message
      };

    } catch (error) {
      console.error('❌ ACT Purchase Initiation Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Payment initiation failed');
    }
  }

  /**
   * Verify payment status with PesaPal via backend API
   */
  async verifyPayment(orderTrackingId: string): Promise<PesaPalTransactionStatus> {
    try {
      console.log('🔍 Verifying payment status:', orderTrackingId);

      if (!orderTrackingId) {
        throw new Error('Order tracking ID is required');
      }

      const response = await fetch(`${config.BACKEND_URL}/api/payments/verify/${orderTrackingId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Payment verification failed');
      }

      console.log('✅ Payment verification successful:', result.payment_status);

      return {
        payment_status_description: result.payment_status,
        payment_method: result.payment_method || 'Unknown',
        confirmation_code: result.confirmation_code || '',
        message: result.message || 'Payment processed',
        description: result.description || ''
      };

    } catch (error) {
      console.error('❌ Payment Verification Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Payment verification failed');
    }
  }

  /**
   * Complete purchase after successful payment
   */
  async completePurchase(purchaseId: string, transactionStatus?: PesaPalTransactionStatus): Promise<boolean> {
    if (!this.supabase) {
      console.warn('⚠️ Supabase not initialized, skipping purchase completion');
      return false;
    }

    try {
      // Use the database function to process completed purchase and credit wallet
      const { data, error } = await this.supabase.rpc('process_completed_purchase', {
        p_purchase_id: purchaseId,
        p_confirmation_code: transactionStatus?.confirmation_code || null
      });

      if (error) {
        console.error('❌ Failed to process completed purchase:', error.message);
        throw new Error(`Failed to process purchase: ${error.message}`);
      }

      console.log('✅ Purchase completed and ACT tokens credited to wallet');
      return true;
    } catch (error) {
      console.error('❌ Error completing purchase:', error);
      throw error;
    }
  }

  /**
   * Get purchase history for user
   */
  async getPurchaseHistory(userId: string): Promise<ACTPurchaseRecord[]> {
    if (!this.supabase) {
      console.warn('⚠️ Supabase not initialized, returning empty history');
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('token_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch purchase history:', error.message);
        throw new Error(`Failed to fetch purchase history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching purchase history:', error);
      return [];
    }
  }

  /**
   * Cancel pending purchase
   */
  async cancelPurchase(purchaseId: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await this.supabase
      .from('token_purchases')
      .update({
        payment_status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .eq('payment_status', 'pending');

    if (error) {
      throw new Error(`Failed to cancel purchase: ${error.message}`);
    }
  }

  // Public helper methods

  /**
   * Calculate ACT tokens from fiat amount
   */
  calculateACTAmount(fiatAmount: number, currency: string): number {
    if (!fiatAmount || fiatAmount <= 0) {
      return 0;
    }

    const exchangeRates = config.EXCHANGE_RATES;
    const rate = exchangeRates[currency as keyof typeof exchangeRates] || 1.0;
    const usdAmount = fiatAmount / rate;
    const actAmount = usdAmount / config.ACT_PRICE_USD;
    
    // Return with 7 decimal places precision
    return Math.floor(actAmount * 10000000) / 10000000;
  }

  /**
   * Calculate fiat amount from ACT token amount
   */
  calculateFiatFromACT(actAmount: number, currency: string): number {
    if (!actAmount || actAmount <= 0) {
      return 0;
    }

    const exchangeRates = config.EXCHANGE_RATES;
    const rate = exchangeRates[currency as keyof typeof exchangeRates] || 1.0;
    const usdAmount = actAmount * config.ACT_PRICE_USD;
    const fiatAmount = usdAmount * rate;
    
    // Return with 2 decimal places for currency
    return Math.round(fiatAmount * 100) / 100;
  }

  /**
   * Calculate USD amount from ACT tokens
   */
  calculateUSDFromACT(actAmount: number): number {
    if (!actAmount || actAmount <= 0) {
      return 0;
    }
    return Math.round(actAmount * config.ACT_PRICE_USD * 100) / 100;
  }

  /**
   * Get exchange rate for currency
   */
  getExchangeRate(currency: string): number {
    const rate = config.EXCHANGE_RATES[currency as keyof typeof config.EXCHANGE_RATES];
    return rate || 1;
  }

  /**
   * Validate purchase amount consistency
   */
  validatePurchaseAmount(actAmount: number, fiatAmount: number, currency: string): {
    isValid: boolean;
    calculatedACT: number;
    difference: number;
    error?: string;
  } {
    const calculatedACT = this.calculateACTAmount(fiatAmount, currency);
    const difference = Math.abs(actAmount - calculatedACT);
    const tolerance = 0.0000001; // Allow for rounding differences

    if (difference > tolerance) {
      return {
        isValid: false,
        calculatedACT,
        difference,
        error: `Amount mismatch: Expected ${calculatedACT} ACT, got ${actAmount} ACT`
      };
    }

    return {
      isValid: true,
      calculatedACT,
      difference
    };
  }

  /**
   * Get supported currencies and payment methods
   */
  async getPaymentMethods(): Promise<any> {
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/payments/methods`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        // Return default methods if API call fails
        return {
          success: true,
          currencies: [
            { code: 'KES', name: 'Kenyan Shilling', country: 'Kenya' },
            { code: 'UGX', name: 'Ugandan Shilling', country: 'Uganda' },
            { code: 'GHS', name: 'Ghanaian Cedi', country: 'Ghana' },
            { code: 'TZS', name: 'Tanzanian Shilling', country: 'Tanzania' },
            { code: 'USD', name: 'US Dollar', country: 'International' }
          ],
          payment_methods: [
            { id: 'mpesa', name: 'M-Pesa', countries: ['KE'], currencies: ['KES'] },
            { id: 'mtn', name: 'MTN Mobile Money', countries: ['UG', 'GH'], currencies: ['UGX', 'GHS'] },
            { id: 'airtel', name: 'Airtel Money', countries: ['UG', 'TZ'], currencies: ['UGX', 'TZS'] },
            { id: 'vodafone', name: 'Vodafone Cash', countries: ['GH'], currencies: ['GHS'] },
            { id: 'card', name: 'Bank Card', countries: ['all'], currencies: ['all'] },
            { id: 'bank_transfer', name: 'Bank Transfer', countries: ['all'], currencies: ['all'] }
          ],
          exchange_rates: config.EXCHANGE_RATES,
          act_price_usd: config.ACT_PRICE_USD
        };
      }
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      return {
        success: false,
        error: 'Failed to load payment methods',
        currencies: [],
        payment_methods: []
      };
    }
  }

  /**
   * Test token calculation via backend
   */
  async testTokenCalculation(amount: number, currency: string): Promise<any> {
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/tokens/calculate/${amount}/${currency}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        // Fallback to local calculation
        const actTokens = this.calculateACTAmount(amount, currency);
        return {
          success: true,
          fiat_amount: amount,
          fiat_currency: currency,
          act_tokens: actTokens,
          usd_price: actTokens * config.ACT_PRICE_USD
        };
      }
    } catch (error) {
      console.error('Token calculation test failed:', error);
      // Return local calculation as fallback
      const actTokens = this.calculateACTAmount(amount, currency);
      return {
        success: true,
        fiat_amount: amount,
        fiat_currency: currency,
        act_tokens: actTokens,
        usd_price: actTokens * config.ACT_PRICE_USD
      };
    }
  }

  /**
   * Get complete wallet balance for user
   */
  async getWalletBalance(userId: string): Promise<WalletBalance | null> {
    if (!this.supabase) {
      console.warn('⚠️ Supabase not initialized, returning null balance');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('⚠️ Wallet not found for user, creating new wallet:', error.message);
        
        // Auto-create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await this.supabase
          .from('wallets')
          .insert({
            user_id: userId,
            balance: 0,
            currency: 'ACT',
            is_active: true
          })
          .select()
          .single();
          
        if (createError) {
          console.error('❌ Failed to create wallet:', createError);
          return null;
        }
        
        return newWallet;
      }

      return data || {
        balance: 0,
        currency: 'ACT',
        user_id: userId,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error fetching wallet balance:', error);
      return null;
    }
  }

  /**
   * Get just the numerical balance (backward compatibility)
   */
  async getWalletBalanceNumber(userId: string): Promise<number> {
    const wallet = await this.getWalletBalance(userId);
    return wallet?.balance || 0;
  }
}

// Initialize the payment service
const paymentService = new ACTPaymentService();
export default paymentService;

// Export class for testing
export { ACTPaymentService };