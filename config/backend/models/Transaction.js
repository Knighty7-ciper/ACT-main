import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Transaction = {
  // Create transaction table
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_hash VARCHAR(255) UNIQUE NOT NULL,
        transaction_type ENUM('transfer', 'swap', 'stake', 'unstake', 'reward', 'fee', 'oracle_update', 'adjustment') NOT NULL,
        sender_wallet_id UUID REFERENCES wallets(id),
        recipient_wallet_id UUID REFERENCES wallets(id),
        amount DECIMAL(20, 8) NOT NULL,
        fee_amount DECIMAL(20, 8) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'ACT',
        status ENUM('pending', 'confirmed', 'failed', 'cancelled') DEFAULT 'pending',
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
    `;
    return db.query(query);
  },

  // Create new transaction
  async create(transactionData) {
    const {
      transactionHash,
      transactionType,
      senderWalletId,
      recipientWalletId,
      amount,
      feeAmount,
      currency,
      memo,
      metadata
    } = transactionData;

    // Generate hash if not provided
    const hash = transactionHash || `0x${uuidv4().replace(/-/g, '')}`;

    const query = `
      INSERT INTO transactions (
        transaction_hash, transaction_type, sender_wallet_id, recipient_wallet_id,
        amount, fee_amount, currency, memo, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [
      hash,
      transactionType,
      senderWalletId,
      recipientWalletId,
      amount,
      feeAmount || 0,
      currency || 'ACT',
      memo,
      JSON.stringify(metadata || {})
    ]);

    return result.rows[0];
  },

  // Find transaction by hash
  async findByHash(transactionHash) {
    const query = `
      SELECT t.*,
             sw.wallet_address as sender_address,
             rw.wallet_address as recipient_address
      FROM transactions t
      LEFT JOIN wallets sw ON t.sender_wallet_id = sw.id
      LEFT JOIN wallets rw ON t.recipient_wallet_id = rw.id
      WHERE t.transaction_hash = $1
    `;
    const result = await db.query(query, [transactionHash]);
    return result.rows[0];
  },

  // Find transaction by ID
  async findById(id) {
    const query = `SELECT * FROM transactions WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Get transactions for wallet with pagination
  async getByWalletId(walletId, options = {}) {
    const { limit = 20, offset = 0, status, type } = options;
    
    let query = `
      SELECT t.*,
             sw.wallet_address as sender_address,
             rw.wallet_address as recipient_address
      FROM transactions t
      LEFT JOIN wallets sw ON t.sender_wallet_id = sw.id
      LEFT JOIN wallets rw ON t.recipient_wallet_id = rw.id
      WHERE t.sender_wallet_id = $1 OR t.recipient_wallet_id = $1
    `;
    
    const params = [walletId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      query += ` AND t.transaction_type = $${paramCount}`;
      params.push(type);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  },

  // Get transaction count for wallet
  async getCountByWalletId(walletId, options = {}) {
    const { status, type } = options;
    
    let query = `
      SELECT COUNT(*) as count
      FROM transactions 
      WHERE sender_wallet_id = $1 OR recipient_wallet_id = $1
    `;
    
    const params = [walletId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      query += ` AND transaction_type = $${paramCount}`;
      params.push(type);
    }

    const result = await db.query(query, params);
    return parseInt(result.rows[0].count);
  },

  // Update transaction status
  async updateStatus(id, status, additionalData = {}) {
    let query = `
      UPDATE transactions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    const params = [status];
    let paramCount = 1;

    if (status === 'confirmed') {
      paramCount++;
      query += `, confirmed_at = CURRENT_TIMESTAMP`;
    }

    if (additionalData.blockNumber) {
      paramCount++;
      query += `, block_number = $${paramCount}`;
      params.push(additionalData.blockNumber);
    }

    if (additionalData.gasUsed) {
      paramCount++;
      query += `, gas_used = $${paramCount}`;
      params.push(additionalData.gasUsed);
    }

    if (additionalData.metadata) {
      paramCount++;
      query += `, metadata = metadata || $${paramCount}::jsonb`;
      params.push(JSON.stringify(additionalData.metadata));
    }

    paramCount++;
    query += ` WHERE id = $${paramCount}`;
    params.push(id);

    const result = await db.query(query, params);
    return result.rows[0];
  },

  // Get recent transactions across all users (for public feed)
  async getRecentPublic(limit = 10) {
    const query = `
      SELECT t.transaction_hash, t.transaction_type, t.amount, t.currency,
             t.created_at, sw.wallet_address as sender, rw.wallet_address as recipient
      FROM transactions t
      LEFT JOIN wallets sw ON t.sender_wallet_id = sw.id
      LEFT JOIN wallets rw ON t.recipient_wallet_id = rw.id
      WHERE t.status = 'confirmed' AND t.transaction_type IN ('transfer', 'swap')
      ORDER BY t.created_at DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  },

  // Get statistics for dashboard
  async getStatistics(startDate, endDate) {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_transactions,
        SUM(amount) as total_volume,
        COUNT(DISTINCT sender_wallet_id) as unique_senders,
        COUNT(DISTINCT recipient_wallet_id) as unique_recipients,
        AVG(CASE WHEN status = 'confirmed' THEN amount END) as avg_transaction_size
      FROM transactions
      WHERE created_at BETWEEN $1 AND $2
    `;
    const result = await db.query(query, [startDate, endDate]);
    return result.rows[0];
  },

  // Get transaction volume by day
  async getVolumeByDay(days = 30) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as daily_volume
      FROM transactions
      WHERE status = 'confirmed' AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }
};

export default Transaction;
