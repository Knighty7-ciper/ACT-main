/**
 * Supabase Client Configuration
 * Centralized configuration for all Supabase operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'act-platform-frontend'
    }
  }
});

// Database Types
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  phone?: string;
  full_name?: string;
  date_of_birth?: string;
  national_id?: string;
  passport_number?: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_level: 'basic' | 'intermediate' | 'full';
  country_code: string;
  currency_preference: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  verification_documents: {
    id_front?: string;
    id_back?: string;
    selfie?: string;
    address_proof?: string;
  };
  limits: {
    daily_limit: number;
    monthly_limit: number;
    annual_limit: number;
    current_daily_spent: number;
    current_monthly_spent: number;
    current_annual_spent: number;
  };
}

export interface Wallet {
  id: string;
  user_id: string;
  wallet_address: string;
  balance_acts: number;
  balance_usd: number;
  balance_kes: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_transaction_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  transaction_type: 'purchase' | 'transfer' | 'conversion';
  amount_acts: number;
  amount_usd: number;
  amount_kes: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_hash?: string;
  external_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface KYCRequest {
  id: string;
  user_id: string;
  request_type: string;
  title: string;
  description: string;
  requested_changes: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  completed_at?: string;
}