-- ============================================
-- PPP DATA TABLE
-- Stores purchasing power parity data for Pesa-Afrik valuation
-- ============================================

-- Create ppp_data table
CREATE TABLE IF NOT EXISTS ppp_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_name TEXT NOT NULL,
  basket_value_usd DECIMAL(20, 2) NOT NULL,
  inflation_rate DECIMAL(10, 4) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'Pesa-Afrik Oracle',
  is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ppp_country_code ON ppp_data(country_code);
CREATE INDEX IF NOT EXISTS idx_ppp_currency ON ppp_data(currency_code);
CREATE INDEX IF NOT EXISTS idx_ppp_updated ON ppp_data(last_updated DESC);

-- Enable RLS
ALTER TABLE ppp_data ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read, only service role can write
CREATE POLICY "Anyone can read PPP data"
  ON ppp_data FOR SELECT
  USING (true);

CREATE POLICY "Service role can update PPP data"
  ON ppp_data FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================
-- BASKET ITEMS TABLE
-- Stores individual basket items for PPP calculation
-- ============================================

CREATE TABLE IF NOT EXISTS basket_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  unit TEXT,
  country_code TEXT NOT NULL,
  price_local DECIMAL(20, 2) NOT NULL,
  price_usd DECIMAL(20, 2),
  source_url TEXT,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_basket_category ON basket_items(category);
CREATE INDEX IF NOT EXISTS idx_basket_country ON basket_items(country_code);

-- RLS
ALTER TABLE basket_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read basket items"
  ON basket_items FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can insert basket items"
  ON basket_items FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'service_role'));


-- ============================================
-- EXCHANGE RATES TABLE
-- Cache for exchange rates (optional, for faster reads)
-- ============================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate DECIMAL(30, 18) NOT NULL,
  source TEXT NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(base_currency, target_currency)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exchange_base ON exchange_rates(base_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_fetched ON exchange_rates(fetched_at DESC);

-- RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exchange rates"
  ON exchange_rates FOR SELECT
  USING (true);

CREATE POLICY "Service can update exchange rates"
  ON exchange_rates FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================
-- USER ACTIVITY LOG
-- Track user login and activity
-- ============================================

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'logout', 'transaction', 'wallet_created', 'profile_updated', 'settings_changed')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity(activity_type);

-- RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON user_activity FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own activity"
  ON user_activity FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM profiles WHERE id = auth.uid())
    OR auth.role() = 'service_role'
  );


-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get user's total portfolio value
CREATE OR REPLACE FUNCTION get_user_portfolio(user_uuid UUID)
RETURNS TABLE(
  wallet_id UUID,
  wallet_name TEXT,
  wallet_type TEXT,
  balance DECIMAL(30, 18),
  value_usd DECIMAL(30, 18)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.wallet_name,
    w.wallet_type,
    w.balance,
    -- For now, return balance as-is (would need exchange rates for USD conversion)
    w.balance as value_usd
  FROM wallets w
  WHERE w.user_id = user_uuid
    AND w.is_active = true
  ORDER BY w.is_primary DESC, w.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate PPP-based Pesa-Afrik value
CREATE OR REPLACE FUNCTION calculate_pesa_value(country_code TEXT, amount DECIMAL)
RETURNS DECIMAL(20, 8) AS $$
DECLARE
  basket_value DECIMAL(20, 2);
  usd_rate DECIMAL(20, 8);
BEGIN
  -- Get the basket value for the country
  SELECT pd.basket_value_usd INTO basket_value
  FROM ppp_data pd
  WHERE pd.country_code = country_code
    AND pd.is_active = true
  LIMIT 1;
  
  IF basket_value IS NULL THEN
    -- Default to Kenya if country not found
    SELECT pd.basket_value_usd INTO basket_value
    FROM ppp_data pd
    WHERE pd.country_code = 'KE'
      AND pd.is_active = true
    LIMIT 1;
  END IF;
  
  IF basket_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate Pesa value: amount / basket_value
  -- This gives you how much Pesa-Afrik equals the amount in local purchasing power
  RETURN amount / basket_value;
END;
$$ LANGUAGE plpgsql;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_ip INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity (user_id, activity_type, ip_address, user_agent, metadata)
  VALUES (p_user_id, p_activity_type, p_ip, p_user_agent, p_metadata);
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- SEED DATA: Default PPP data for African countries
-- ============================================

INSERT INTO ppp_data (country_code, country_name, currency_code, currency_name, basket_value_usd, inflation_rate, source) VALUES
('KE', 'Kenya', 'KES', 'Kenyan Shilling', 100.00, 4.5, 'Pesa-Afrik Oracle'),
('NG', 'Nigeria', 'NGN', 'Nigerian Naira', 85000.00, 18.0, 'Pesa-Afrik Oracle'),
('ZA', 'South Africa', 'ZAR', 'South African Rand', 1800.00, 5.2, 'Pesa-Afrik Oracle'),
('GH', 'Ghana', 'GHS', 'Ghanaian Cedi', 1200.00, 12.5, 'Pesa-Afrik Oracle'),
('TZ', 'Tanzania', 'TZS', 'Tanzanian Shilling', 250000.00, 3.8, 'Pesa-Afrik Oracle'),
('UG', 'Uganda', 'UGX', 'Ugandan Shilling', 380000.00, 2.8, 'Pesa-Afrik Oracle'),
('MA', 'Morocco', 'MAD', 'Moroccan Dirham', 1000.00, 2.5, 'Pesa-Afrik Oracle'),
('EG', 'Egypt', 'EGP', 'Egyptian Pound', 30000.00, 15.0, 'Pesa-Afrik Oracle'),
('ET', 'Ethiopia', 'ETB', 'Ethiopian Birr', 55000.00, 20.0, 'Pesa-Afrik Oracle'),
('RW', 'Rwanda', 'RWF', 'Rwandan Franc', 100000.00, 4.2, 'Pesa-Afrik Oracle')
ON CONFLICT (country_code) DO NOTHING;


-- ============================================
-- STORAGE BUCKET (for avatar uploads)
-- ============================================

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar upload for authenticated users"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
