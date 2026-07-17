import db from '../config/database.js';

const Wallet = {
  // Get database query function
  getDb() {
    return db.getDatabase ? db.getDatabase() : db;
  },

  // Create new wallet for user
  async create(walletData) {
    try {
      const { userId, walletType, walletAddress, publicKey, encryptedPrivateKey, isDefault } = walletData;
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const newWallet = {
          id: `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          wallet_type: walletType || 'hot',
          wallet_address: walletAddress,
          public_key: publicKey || null,
          encrypted_private_key: encryptedPrivateKey || null,
          balance: 0,
          reserved_balance: 0,
          is_default: isDefault || false,
          is_active: true,
          last_synced_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        database.tables.wallets.push(newWallet);
        
        return {
          id: newWallet.id,
          user_id: newWallet.user_id,
          wallet_type: newWallet.wallet_type,
          wallet_address: newWallet.wallet_address,
          balance: newWallet.balance,
          is_default: newWallet.is_default,
          created_at: newWallet.created_at
        };
      }
      
      // Real database mode
      const result = await database.query(
        `INSERT INTO wallets (
          user_id, wallet_type, wallet_address, public_key, 
          encrypted_private_key, balance, reserved_balance, is_default, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, user_id, wallet_type, wallet_address, balance, is_default, created_at`,
        [
          userId,
          walletType || 'hot',
          walletAddress,
          publicKey || null,
          encryptedPrivateKey || null,
          0,
          0,
          isDefault || false,
          true
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  },

  // Find wallet by address
  async findByAddress(walletAddress) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const wallet = database.tables.wallets.find(w => w.wallet_address === walletAddress && w.is_active);
        if (!wallet) return null;
        
        const user = database.tables.users.find(u => u.id === wallet.user_id);
        return {
          ...wallet,
          email: user?.email,
          country_code: user?.country_code
        };
      }
      
      const result = await database.query(
        `SELECT w.*, u.email, u.country_code 
         FROM wallets w 
         JOIN users u ON w.user_id = u.id 
         WHERE w.wallet_address = $1 AND w.is_active`,
        [walletAddress]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding wallet by address:', error);
      throw error;
    }
  },

  // Find wallet by ID
  async findById(id) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        return database.tables.wallets.find(w => w.id === id && w.is_active) || null;
      }
      
      const result = await database.query(
        'SELECT * FROM wallets WHERE id = $1 AND is_active',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding wallet by ID:', error);
      throw error;
    }
  },

  // Find all wallets for a user
  async findByUserId(userId) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        return database.tables.wallets
          .filter(w => w.user_id === userId && w.is_active)
          .sort((a, b) => {
            if (a.is_default && !b.is_default) return -1;
            if (!a.is_default && b.is_default) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
          });
      }
      
      const result = await database.query(
        `SELECT * FROM wallets 
         WHERE user_id = $1 AND is_active 
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding wallets by user ID:', error);
      throw error;
    }
  },

  // Get default wallet for user
  async getDefaultWallet(userId) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        return database.tables.wallets.find(w => w.user_id === userId && w.is_default && w.is_active) || null;
      }
      
      const result = await database.query(
        'SELECT * FROM wallets WHERE user_id = $1 AND is_default AND is_active',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting default wallet:', error);
      throw error;
    }
  },

  // Update wallet balance
  async updateBalance(id, amountChange) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const index = database.tables.wallets.findIndex(w => w.id === id);
        if (index === -1) return null;
        
        database.tables.wallets[index].balance = parseFloat(database.tables.wallets[index].balance) + amountChange;
        database.tables.wallets[index].last_synced_at = new Date().toISOString();
        database.tables.wallets[index].updated_at = new Date().toISOString();
        
        return database.tables.wallets[index];
      }
      
      const result = await database.query(
        `UPDATE wallets 
         SET balance = balance + $1, 
             last_synced_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND is_active
         RETURNING *`,
        [amountChange, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  },

  // Update reserved balance
  async updateReservedBalance(id, amount) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const index = database.tables.wallets.findIndex(w => w.id === id);
        if (index === -1) return null;
        
        database.tables.wallets[index].reserved_balance = parseFloat(database.tables.wallets[index].reserved_balance) + amount;
        database.tables.wallets[index].updated_at = new Date().toISOString();
        
        return database.tables.wallets[index];
      }
      
      const result = await database.query(
        `UPDATE wallets 
         SET reserved_balance = reserved_balance + $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND is_active
         RETURNING *`,
        [amount, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating reserved balance:', error);
      throw error;
    }
  },

  // Set as default wallet
  async setAsDefault(walletId, userId) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        database.tables.wallets.forEach(w => {
          if (w.user_id === userId) {
            w.is_default = (w.id === walletId);
          }
        });
        
        return database.tables.wallets.find(w => w.id === walletId);
      }
      
      await database.query(
        'UPDATE wallets SET is_default = false WHERE user_id = $1 AND is_active',
        [userId]
      );
      
      const result = await database.query(
        'UPDATE wallets SET is_default = true WHERE id = $1 AND user_id = $2 AND is_active RETURNING *',
        [walletId, userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error setting default wallet:', error);
      throw error;
    }
  },

  // Transfer balance between wallets
  async transferBalance(fromWalletId, toWalletId, amount) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const fromIndex = database.tables.wallets.findIndex(w => w.id === fromWalletId);
        const toIndex = database.tables.wallets.findIndex(w => w.id === toWalletId);
        
        if (fromIndex === -1 || toIndex === -1) {
          throw new Error('Wallet not found');
        }
        
        const fromWallet = database.tables.wallets[fromIndex];
        if (parseFloat(fromWallet.balance) < amount) {
          throw new Error('Insufficient balance');
        }
        
        // Deduct from sender
        database.tables.wallets[fromIndex].balance = parseFloat(database.tables.wallets[fromIndex].balance) - amount;
        database.tables.wallets[fromIndex].updated_at = new Date().toISOString();
        
        // Add to receiver
        database.tables.wallets[toIndex].balance = parseFloat(database.tables.wallets[toIndex].balance) + amount;
        database.tables.wallets[toIndex].updated_at = new Date().toISOString();
        
        return database.tables.wallets[toIndex];
      }
      
      // Real database mode
      const result = await database.transaction(async (client) => {
        const senderCheck = await client.query(
          'SELECT balance FROM wallets WHERE id = $1 AND is_active FOR UPDATE',
          [fromWalletId]
        );
        
        if (!senderCheck.rows[0] || parseFloat(senderCheck.rows[0].balance) < amount) {
          throw new Error('Insufficient balance');
        }
        
        await client.query(
          'UPDATE wallets SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [amount, fromWalletId]
        );
        
        const result = await client.query(
          'UPDATE wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [amount, toWalletId]
        );
        
        return result.rows[0];
      });
      
      return result;
    } catch (error) {
      console.error('Error transferring balance:', error);
      throw error;
    }
  },

  // Deactivate wallet
  async deactivate(id) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const index = database.tables.wallets.findIndex(w => w.id === id);
        if (index === -1) return null;
        
        database.tables.wallets[index].is_active = false;
        database.tables.wallets[index].updated_at = new Date().toISOString();
        
        return database.tables.wallets[index];
      }
      
      const result = await database.query(
        'UPDATE wallets SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error deactivating wallet:', error);
      throw error;
    }
  },

  // Get total balance for user
  async getTotalBalance(userId) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const userWallets = database.tables.wallets.filter(w => w.user_id === userId && w.is_active);
        return userWallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);
      }
      
      const result = await database.query(
        'SELECT COALESCE(SUM(balance), 0) as total FROM wallets WHERE user_id = $1 AND is_active',
        [userId]
      );
      return parseFloat(result.rows[0].total) || 0;
    } catch (error) {
      console.error('Error getting total balance:', error);
      throw error;
    }
  },

  // Set wallet address for user
  async setWalletAddress(userId, walletAddress, publicKey) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const existing = await this.findByAddress(walletAddress);
        if (existing) {
          throw new Error('Wallet already linked to another account');
        }
        
        return await this.create({
          userId,
          walletType: 'view',
          walletAddress,
          publicKey,
          isDefault: true
        });
      }
      
      // Check if wallet already exists
      const existing = await this.findByAddress(walletAddress);
      if (existing) {
        throw new Error('Wallet already linked to another account');
      }
      
      return await this.create({
        userId,
        walletType: 'view',
        walletAddress,
        publicKey,
        isDefault: true
      });
    } catch (error) {
      console.error('Error setting wallet address:', error);
      throw error;
    }
  }
};

export default Wallet;
