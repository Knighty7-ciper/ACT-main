// Database migration runner
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'pg-d599dbf-bknglabs-56cd.i.aivencloud.com',
  port: parseInt(process.env.DB_PORT) || 18303,
  database: process.env.DB_NAME || 'defaultdb',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_-yimCiG__MNX0DyJhIv',
  ssl: { rejectUnauthorized: true, mode: 'require' }
});

const migrations = [
  // Create users table
  `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      wallet_address VARCHAR(255) UNIQUE,
      public_key TEXT,
      country_code VARCHAR(3) DEFAULT 'USA',
      language VARCHAR(10) DEFAULT 'en',
      risk_tolerance VARCHAR(10) DEFAULT 'medium',
      kyc_status VARCHAR(20) DEFAULT 'pending',
      email_verified BOOLEAN DEFAULT FALSE,
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      two_factor_secret TEXT,
      preferences JSONB DEFAULT '{}',
      last_login TIMESTAMP,
      login_attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
  `,

  // Create wallets table
  `
    CREATE TABLE IF NOT EXISTS wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      wallet_type VARCHAR(10) DEFAULT 'hot',
      wallet_address VARCHAR(255) UNIQUE NOT NULL,
      public_key TEXT,
      encrypted_private_key TEXT,
      balance DECIMAL(20, 8) DEFAULT 0,
      reserved_balance DECIMAL(20, 8) DEFAULT 0,
      is_default BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      last_synced_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
    CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(wallet_address);
  `,

  // Create transactions table
  `
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      transaction_hash VARCHAR(255) UNIQUE NOT NULL,
      transaction_type VARCHAR(30) NOT NULL,
      sender_wallet_id UUID REFERENCES wallets(id),
      recipient_wallet_id UUID REFERENCES wallets(id),
      amount DECIMAL(20, 8) NOT NULL,
      fee_amount DECIMAL(20, 8) DEFAULT 0,
      currency VARCHAR(10) DEFAULT 'ACT',
      status VARCHAR(20) DEFAULT 'pending',
      memo TEXT,
      metadata JSONB DEFAULT '{}',
      block_number INTEGER,
      gas_used DECIMAL(20, 8),
      gas_price DECIMAL(20, 8),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      confirmed_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
    CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_wallet_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_recipient ON transactions(recipient_wallet_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
  `,

  // Create commodity_prices table
  `
    CREATE TABLE IF NOT EXISTS commodity_prices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      commodity_type VARCHAR(50) NOT NULL,
      commodity_name VARCHAR(100) NOT NULL,
      quantity DECIMAL(10, 4) NOT NULL,
      unit VARCHAR(20) NOT NULL,
      country_code VARCHAR(3) NOT NULL,
      currency VARCHAR(3) NOT NULL,
      price DECIMAL(15, 4) NOT NULL,
      price_usd DECIMAL(15, 4),
      source VARCHAR(100) NOT NULL,
      source_url TEXT,
      collected_at TIMESTAMP NOT NULL,
      valid_from TIMESTAMP NOT NULL,
      valid_to TIMESTAMP,
      confidence_score DECIMAL(3, 2) DEFAULT 1.00,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(commodity_type, country_code, valid_from)
    );
    
    CREATE INDEX IF NOT EXISTS idx_commodity_prices_type ON commodity_prices(commodity_type);
    CREATE INDEX IF NOT EXISTS idx_commodity_prices_country ON commodity_prices(country_code);
    CREATE INDEX IF NOT EXISTS idx_commodity_prices_time ON commodity_prices(collected_at);
  `,

  // Create ppp_values table
  `
    CREATE TABLE IF NOT EXISTS ppp_values (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      country_code VARCHAR(3) NOT NULL,
      currency VARCHAR(3) NOT NULL,
      basket_total DECIMAL(15, 4) NOT NULL,
      basket_total_usd DECIMAL(15, 4) NOT NULL,
      token_value DECIMAL(15, 8) NOT NULL,
      token_value_usd DECIMAL(15, 8) NOT NULL,
      inflation_rate DECIMAL(8, 4),
      volatility_index DECIMAL(8, 4),
      stability_score DECIMAL(5, 2),
      calculation_method VARCHAR(50) DEFAULT 'geometric_mean',
      data_points INTEGER DEFAULT 0,
      benchmark_country VARCHAR(3) DEFAULT 'USA',
      confidence_score DECIMAL(3, 2) DEFAULT 1.00,
      calculation_timestamp TIMESTAMP NOT NULL,
      effective_from TIMESTAMP NOT NULL,
      effective_to TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(country_code, calculation_timestamp)
    );
    
    CREATE INDEX IF NOT EXISTS idx_ppp_values_country ON ppp_values(country_code);
    CREATE INDEX IF NOT EXISTS idx_ppp_values_time ON ppp_values(calculation_timestamp);
  `
];

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migrations...\n');
    
    for (let i = 0; i < migrations.length; i++) {
      const migrationName = `Migration ${i + 1}`;
      console.log(`Running ${migrationName}...`);
      
      await client.query(migrations[i]);
      console.log(`✅ ${migrationName} completed\n`);
    }
    
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if executed directly
runMigrations().catch(console.error);

module.exports = { runMigrations };
