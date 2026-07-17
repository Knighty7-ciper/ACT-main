// Database configuration for ACT COIN Platform
// Supports both real PostgreSQL and demo in-memory mode

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Check if we should use demo mode (when database is not reachable)
const USE_DEMO_MODE = process.env.USE_DEMO_MODE === 'true' || process.env.NODE_ENV === 'demo';

// Demo mode in-memory database
class DemoDatabase {
  constructor() {
    this.tables = {
      users: [],
      wallets: [],
      transactions: [],
      commodity_prices: [],
      ppp_values: []
    };
    
    this.idCounters = {
      users: 0,
      wallets: 0,
      transactions: 0,
      commodity_prices: 0,
      ppp_values: 0
    };
    
    this.seedData();
  }
  
  seedData() {
    // Seed demo users
    this.tables.users = [
      {
        id: 'demo-user-1',
        email: 'demo@actcoin.io',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.W7ry1qy5.fei7S', // password: demo1234
        wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fEb3',
        public_key: null,
        country_code: 'USA',
        language: 'en',
        risk_tolerance: 'medium',
        kyc_status: 'verified',
        email_verified: true,
        two_factor_enabled: false,
        two_factor_secret: null,
        preferences: {},
        last_login: new Date().toISOString(),
        login_attempts: 0,
        locked_until: null,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Seed demo wallets
    this.tables.wallets = [
      {
        id: 'demo-wallet-1',
        user_id: 'demo-user-1',
        wallet_type: 'hot',
        wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fEb3',
        public_key: 'pub_key_1',
        encrypted_private_key: 'encrypted_key_1',
        balance: 1250.50,
        reserved_balance: 0,
        is_default: true,
        is_active: true,
        last_synced_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    console.log('📦 Demo database initialized with seed data');
  }
  
  async query(sql, params = []) {
    // Simple query parser for demo mode
    const selectMatch = sql.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
    
    if (selectMatch) {
      const tableName = selectMatch[1];
      let results = [...(this.tables[tableName] || [])];
      
      // Handle WHERE clauses
      const whereMatches = sql.match(/WHERE\s+(\w+)\s*=\s*\$(\d+)/gi);
      if (whereMatches) {
        whereMatches.forEach(match => {
          const colMatch = match.match(/WHERE\s+(\w+)\s*=\s*\$(\d+)/i);
          if (colMatch) {
            const column = colMatch[1];
            const paramIndex = parseInt(colMatch[2]) - 1;
            if (params[paramIndex]) {
              results = results.filter(row => row[column] === params[paramIndex]);
            }
          }
        });
      }
      
      // Handle ORDER BY
      if (sql.includes('ORDER BY')) {
        const orderMatch = sql.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)/i);
        if (orderMatch) {
          const [_, column, direction] = orderMatch;
          results.sort((a, b) => {
            if (direction.toUpperCase() === 'DESC') {
              return b[column] > a[column] ? 1 : -1;
            }
            return a[column] > b[column] ? 1 : -1;
          });
        }
      }
      
      // Handle LIMIT
      const limitMatch = sql.match(/LIMIT\s+\$?(\d+)/i);
      if (limitMatch) {
        results = results.slice(0, parseInt(limitMatch[1]));
      }
      
      return { rows: results };
    }
    
    // Handle INSERT
    if (sql.includes('INSERT INTO')) {
      const tableMatch = sql.match(/INSERT INTO\s+(\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        // Generate ID if not provided
        const id = params[0] || `${tableName.slice(0, -1)}-${Date.now()}`;
        
        // For users table
        if (tableName === 'users') {
          const newUser = {
            id,
            email: params[0],
            password_hash: params[1],
            wallet_address: params[2] || null,
            public_key: params[3] || null,
            country_code: params[4] || 'USA',
            language: params[5] || 'en',
            risk_tolerance: params[6] || 'medium',
            kyc_status: params[7] || 'pending',
            email_verified: params[8] !== undefined ? params[8] : false,
            two_factor_enabled: params[9] !== undefined ? params[9] : false,
            two_factor_secret: null,
            preferences: params[10] || {},
            last_login: null,
            login_attempts: 0,
            locked_until: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          this.tables.users.push(newUser);
          return { rows: [newUser] };
        }
        
        // For wallets table
        if (tableName === 'wallets') {
          const newWallet = {
            id,
            user_id: params[0],
            wallet_type: params[1] || 'hot',
            wallet_address: params[2],
            public_key: params[3] || null,
            encrypted_private_key: params[4] || null,
            balance: params[5] || 0,
            reserved_balance: params[6] || 0,
            is_default: params[7] || false,
            is_active: params[8] !== undefined ? params[8] : true,
            last_synced_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          this.tables.wallets.push(newWallet);
          return { rows: [newWallet] };
        }
      }
    }
    
    // Handle UPDATE
    if (sql.includes('UPDATE')) {
      return { rows: [] };
    }
    
    // Handle DELETE
    if (sql.includes('DELETE FROM')) {
      return { rowCount: 1 };
    }
    
    return { rows: [] };
  }
  
  async transaction(callback) {
    return callback({
      query: (sql, params) => this.query(sql, params)
    });
  }
  
  pool = {
    query: (sql, params) => this.query(sql, params),
    connect: async () => ({
      query: (sql, params) => this.query(sql, params),
      release: () => {}
    }),
    end: () => {}
  };
}

// Real PostgreSQL pool
let pool = null;

const createPool = () => {
  return new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSLMODE === 'require' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
};

// Initialize database connection
let db;
let useDemoMode = USE_DEMO_MODE;

const initDatabase = async () => {
  if (useDemoMode) {
    console.log('📦 Using DEMO mode (in-memory database)');
    db = new DemoDatabase();
    return db;
  }
  
  try {
    pool = createPool();
    
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    console.log('✅ Connected to PostgreSQL database');
    
    db = {
      query: async (text, params) => pool.query(text, params),
      transaction: async (callback) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await callback(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      },
      pool: {
        query: (text, params) => pool.query(text, params),
        connect: () => pool.connect(),
        end: () => pool.end()
      }
    };
    
    return db;
  } catch (error) {
    console.warn('⚠️  Database connection failed, falling back to DEMO mode');
    console.warn('   Error:', error.message);
    useDemoMode = true;
    db = new DemoDatabase();
    return db;
  }
};

// Export database interface
export default {
  initDatabase,
  getDatabase: () => db,
  isDemoMode: () => useDemoMode,
  
  // For compatibility
  query: (...args) => db.query(...args),
  transaction: (...args) => db.transaction(...args),
  pool: db.pool,
  
  // Graceful shutdown
  async shutdown() {
    if (pool) {
      await pool.end();
      console.log('Database pool closed');
    }
  }
};

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (pool) await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  if (pool) await pool.end();
  process.exit(0);
});
