/**
 * API Route - ACT Token Purchase Operations
 * Handle ACT token purchases and payment processing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (req.method === 'POST') {
      // Create ACT purchase record
      const {
        act_amount,
        currency,
        payment_method,
        bonus_tokens = 0,
        discount_percentage = 0
      } = req.body;

      const usd_amount = act_amount * 1.24; // ACT price in USD

      // Calculate total with fees
      const base_amount = usd_amount;
      let fee_percentage = 0;

      switch (payment_method) {
        case 'pesapal_card':
          fee_percentage = 2.9;
          break;
        case 'pesapal_mobile':
          fee_percentage = 3.5;
          break;
        case 'pesapal_bank':
          fee_percentage = 1.5;
          break;
        default:
          fee_percentage = 2.9;
      }

      const fee_amount = base_amount * (fee_percentage / 100);
      const total_amount = base_amount + fee_amount;

      // Convert to local currency
      const exchange_rates = {
        'KES': 133.5,
        'USD': 1,
        'UGX': 3700,
        'GHS': 12.5,
        'TZS': 2330
      };

      const local_amount = total_amount * (exchange_rates[currency] || 133.5);

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('pesapal_purchases')
        .insert({
          user_id: user.id,
          act_amount,
          usd_amount,
          currency,
          local_amount,
          payment_method,
          status: 'pending',
          bonus_tokens,
          discount_percentage,
          metadata: {
            fee_percentage,
            fee_amount,
            exchange_rate: exchange_rates[currency] || 133.5
          }
        })
        .select()
        .single();

      if (purchaseError) {
        return res.status(500).json({ error: 'Failed to create purchase record' });
      }

      // For demo purposes, simulate successful payment
      // In production, this would integrate with PesaPal API
      const { error: updateError } = await supabase
        .from('pesapal_purchases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          external_id: `PESAPAL-${purchase.id}-${Date.now()}`
        })
        .eq('id', purchase.id);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update purchase status' });
      }

      // Get or create wallet
      let { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!wallet) {
        // Create wallet if doesn't exist
        const walletAddress = `GB${Math.random().toString(36).substr(2, 56)}`;
        
        const { data: newWallet, error: walletError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            wallet_address: walletAddress,
            balance_acts: 0,
            balance_usd: 0,
            balance_kes: 0,
            currency: 'KES',
            is_active: true
          })
          .select()
          .single();

        if (walletError) {
          return res.status(500).json({ error: 'Failed to create wallet' });
        }
        wallet = newWallet;
      }

      // Calculate new balance
      const totalTokens = act_amount + bonus_tokens;
      const discountAmount = (act_amount * discount_percentage) / 100;
      const finalTokens = totalTokens - discountAmount;

      // Update wallet balance
      const { error: balanceError } = await supabase
        .from('wallets')
        .update({
          balance_acts: wallet.balance_acts + finalTokens,
          balance_usd: wallet.balance_usd + usd_amount,
          balance_kes: wallet.balance_kes + local_amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (balanceError) {
        return res.status(500).json({ error: 'Failed to update wallet balance' });
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          transaction_type: 'purchase',
          amount_acts: finalTokens,
          amount_usd: usd_amount,
          amount_kes: local_amount,
          currency,
          status: 'completed',
          external_id: `PESAPAL-${purchase.id}`,
          metadata: {
            purchase_id: purchase.id,
            bonus_tokens,
            discount_amount: discountAmount,
            payment_method,
            fee_percentage,
            fee_amount
          }
        });

      if (transactionError) {
        return res.status(500).json({ error: 'Failed to create transaction record' });
      }

      return res.status(200).json({
        success: true,
        purchase_id: purchase.id,
        act_tokens_received: finalTokens,
        bonus_tokens,
        payment_id: `PESAPAL-${purchase.id}`,
        wallet_balance: wallet.balance_acts + finalTokens
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('ACT Purchase API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}