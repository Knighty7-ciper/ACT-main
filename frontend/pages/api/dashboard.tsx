/**
 * API Route - User Dashboard Data
 * Returns comprehensive dashboard data for authenticated users
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

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    // Fetch wallet data
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to fetch wallet' });
    }

    // Fetch recent transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) {
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    // Fetch pending requests
    const { data: requests, error: requestsError } = await supabase
      .from('kyc_requests')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved', 'in_progress'])
      .order('created_at', { ascending: false });

    if (requestsError) {
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    // Calculate statistics
    const stats = {
      totalTransactions: transactions?.length || 0,
      pendingRequests: requests?.filter(r => r.status === 'pending').length || 0,
      completedRequests: requests?.filter(r => r.status === 'completed').length || 0,
      walletValueUSD: wallet ? wallet.balance_usd || 0 : 0,
      actBalance: wallet ? wallet.balance_acts || 0 : 0
    };

    return res.status(200).json({
      profile,
      wallet,
      transactions: transactions || [],
      requests: requests || [],
      stats
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}