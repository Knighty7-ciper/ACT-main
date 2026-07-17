-- ============================================
-- PROFILES TABLE
-- Stores user profile information
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Anyone can create profiles (handled by trigger)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public read access to basic profile info
CREATE POLICY "Public can view basic profile info"
  ON profiles FOR SELECT
  USING (
    id IS NOT NULL 
    AND email IS NOT NULL
  );


-- ============================================
-- WALLETS TABLE
-- Stores user cryptocurrency wallets
-- ============================================

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('pesa-afrik', 'bitcoin', 'ethereum', 'usdt', 'custom')),
  wallet_address TEXT UNIQUE NOT NULL,
  wallet_name TEXT,
  balance DECIMAL(30, 18) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_transaction_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallets_type ON wallets(wallet_type);
CREATE INDEX IF NOT EXISTS idx_wallets_created_at ON wallets(created_at DESC);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets
-- Users can view their own wallets
CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Users can create wallets
CREATE POLICY "Users can create wallets"
  ON wallets FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Users can update their own wallets
CREATE POLICY "Users can update own wallets"
  ON wallets FOR UPDATE
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Users can delete their own wallets
CREATE POLICY "Users can delete own wallets"
  ON wallets FOR DELETE
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));


-- ============================================
-- TRANSACTIONS TABLE
-- Stores all cryptocurrency transactions
-- ============================================

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('send', 'receive', 'swap', 'buy', 'sell', 'deposit', 'withdrawal', 'airdrop', 'reward', 'fee')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'rejected')),
  amount DECIMAL(30, 18) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PESA',
  fee DECIMAL(30, 18) DEFAULT 0,
  exchange_rate DECIMAL(30, 18),
  from_address TEXT,
  to_address TEXT,
  tx_hash TEXT UNIQUE,
  block_number BIGINT,
  confirmations INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Users can create transactions
CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Users can update their own transactions (only pending ones)
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (
    user_id IN (SELECT id FROM profiles WHERE id = auth.uid())
    AND status = 'pending'
  );


-- ============================================
-- TRIGGERS
-- Auto-create profile on user signup
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    NOW()
  );
  
  -- Create default Pesa-Afrik wallet for new users
  INSERT INTO public.wallets (user_id, wallet_type, wallet_name, is_primary)
  VALUES (
    NEW.id,
    'pesa-afrik',
    'Main Wallet',
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- FUNCTION: Update wallet balance after transaction
-- ============================================

CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the wallet balance based on transaction type
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.transaction_type IN ('receive', 'deposit', 'buy', 'swap', 'airdrop', 'reward') THEN
      UPDATE wallets
      SET balance = balance + NEW.amount,
          updated_at = NOW(),
          last_transaction_at = NOW()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.transaction_type IN ('send', 'withdrawal', 'sell', 'swap') THEN
      UPDATE wallets
      SET balance = balance - NEW.amount - COALESCE(NEW.fee, 0),
          updated_at = NOW(),
          last_transaction_at = NOW()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS on_transaction_status_change ON transactions;
CREATE TRIGGER on_transaction_status_change
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_balance();


-- ============================================
-- VIEWS
-- ============================================

-- User dashboard view
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.country,
  p.avatar_url,
  COUNT(w.id) as wallet_count,
  SUM(w.balance) as total_balance,
  COUNT(t.id) as total_transactions,
  COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_transactions,
  COUNT(t.id) FILTER (WHERE t.created_at > NOW() - INTERVAL '24 hours') as transactions_24h,
  MAX(t.created_at) as last_transaction
FROM profiles p
LEFT JOIN wallets w ON w.user_id = p.id AND w.is_active = true
LEFT JOIN transactions t ON t.user_id = p.id
GROUP BY p.id, p.email, p.full_name, p.country, p.avatar_url;

-- Transaction history with wallet details
CREATE OR REPLACE VIEW transaction_history AS
SELECT 
  t.id,
  t.user_id,
  t.wallet_id,
  w.wallet_name,
  t.transaction_type,
  t.status,
  t.amount,
  t.currency,
  t.fee,
  t.tx_hash,
  t.description,
  t.created_at,
  t.completed_at,
  p.full_name as user_name,
  p.email as user_email
FROM transactions t
LEFT JOIN wallets w ON w.id = t.wallet_id
LEFT JOIN profiles p ON p.id = t.user_id;


-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Note: Only insert seed data if tables are empty
-- Comment this out in production

-- INSERT INTO profiles (id, email, full_name, country, is_verified)
-- SELECT 
--   gen_random_uuid(),
--   'demo@pesa-afrik.com',
--   'Demo User',
--   'Kenya',
--   true
-- WHERE NOT EXISTS (SELECT 1 FROM profiles LIMIT 1);
