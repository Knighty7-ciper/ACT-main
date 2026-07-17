-- ==========================================
-- PESA-AFRIK DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ==========================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create profiles table
-- This links to Supabase auth.users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    country_code TEXT DEFAULT 'ZA',
    preferred_currency TEXT DEFAULT 'ZAR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create wallets table
CREATE TABLE wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wallet_type TEXT NOT NULL DEFAULT 'main',
    balance DECIMAL(18, 8) DEFAULT 0,
    currency_code TEXT DEFAULT 'ZAR',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create transactions table
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    currency_code TEXT DEFAULT 'ZAR',
    ppp_value DECIMAL(18, 8),
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create PPP data table
CREATE TABLE ppp_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    country_code TEXT NOT NULL,
    currency_code TEXT NOT NULL,
    ppp_conversion_rate DECIMAL(18, 8) NOT NULL,
    inflation_rate DECIMAL(5, 2) DEFAULT 0,
    total_ppp_value DECIMAL(18, 8) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_code, currency_code)
);

-- Step 6: Create baskets table
CREATE TABLE baskets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_currency TEXT DEFAULT 'ZAR',
    items JSONB NOT NULL DEFAULT '[]',
    total_ppp_value DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppp_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE baskets ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PROFILES RLS POLICIES
-- ==========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- WALLETS RLS POLICIES
-- ==========================================

-- Users can view their own wallets
CREATE POLICY "Users can view own wallets" ON wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own wallets
CREATE POLICY "Users can insert own wallets" ON wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own wallets
CREATE POLICY "Users can update own wallets" ON wallets
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own wallets
CREATE POLICY "Users can delete own wallets" ON wallets
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- TRANSACTIONS RLS POLICIES
-- ==========================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- PPP DATA RLS POLICIES (Reference data)
-- ==========================================

-- Anyone can view PPP data
CREATE POLICY "Anyone can view PPP data" ON ppp_data
    FOR SELECT USING (true);

-- Only authenticated users can modify PPP data
CREATE POLICY "Admins can modify PPP data" ON ppp_data
    FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- BASKETS RLS POLICIES (Reference data)
-- ==========================================

-- Anyone can view baskets
CREATE POLICY "Anyone can view baskets" ON baskets
    FOR SELECT USING (true);

-- Authenticated users can create baskets
CREATE POLICY "Auth users can create baskets" ON baskets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- ADD SAMPLE PPP DATA
-- ==========================================

INSERT INTO ppp_data (country_code, currency_code, ppp_conversion_rate, inflation_rate, total_ppp_value) VALUES
('ZAF', 'ZAR', 18.50, 5.8, 2800),
('NGA', 'NGN', 1450.00, 18.5, 125000),
('KEN', 'KES', 155.00, 7.2, 18500),
('GHA', 'GHS', 15.20, 8.5, 920),
('EGY', 'EGP', 48.50, 12.5, 7500),
('MAR', 'MAD', 9.80, 4.2, 950),
('ETH', 'ETB', 58.00, 8.0, 4500),
('TZA', 'TZS', 2450.00, 6.5, 180000);

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX idx_profiles_user_id ON profiles(id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_ppp_data_country ON ppp_data(country_code);

-- ==========================================
-- AUTO-CREATE PROFILE FUNCTION
-- Trigger to auto-create profile when user signs up
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, country_code, preferred_currency)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'country_code', 'ZA'),
        'ZAR'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- AUTO-CREATE DEFAULT WALLET FUNCTION
-- Trigger to auto-create wallet when profile is created
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, wallet_type, balance, currency_code, is_active)
    VALUES (
        NEW.id,
        'main',
        0,
        COALESCE(NEW.preferred_currency, 'ZAR'),
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new profile
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ==========================================
-- VERIFICATION
-- ==========================================

SELECT '✅ Database setup complete!' as status;

-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
