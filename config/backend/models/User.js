import db from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = {
  // Get database query function
  getDb() {
    return db.getDatabase ? db.getDatabase() : db;
  },

  // Find user by email
  async findByEmail(email) {
    try {
      const database = this.getDb();
      const result = await database.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      // In demo mode, try to handle gracefully
      if (db.isDemoMode()) {
        const database = this.getDb();
        return database.tables.users.find(u => u.email === email) || null;
      }
      throw error;
    }
  },

  // Find user by ID
  async findById(id) {
    try {
      const database = this.getDb();
      const result = await database.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      if (db.isDemoMode()) {
        const database = this.getDb();
        return database.tables.users.find(u => u.id === id) || null;
      }
      throw error;
    }
  },

  // Create new user
  async create(userData) {
    try {
      const { email, password, walletAddress, countryCode } = userData;
      const passwordHash = await bcrypt.hash(password, 12);
      
      const database = this.getDb();
      
      // Check if we're in demo mode
      if (db.isDemoMode()) {
        const newUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email,
          password_hash: passwordHash,
          wallet_address: walletAddress || null,
          public_key: null,
          country_code: countryCode || 'USA',
          language: 'en',
          risk_tolerance: 'medium',
          kyc_status: 'pending',
          email_verified: false,
          two_factor_enabled: false,
          two_factor_secret: null,
          preferences: {},
          last_login: null,
          login_attempts: 0,
          locked_until: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        database.tables.users.push(newUser);
        
        return {
          id: newUser.id,
          email: newUser.email,
          wallet_address: newUser.wallet_address,
          country_code: newUser.country_code,
          kyc_status: newUser.kyc_status,
          created_at: newUser.created_at
        };
      }
      
      // Real database mode
      const result = await database.query(
        `INSERT INTO users (
          email, password_hash, wallet_address, country_code, 
          language, risk_tolerance, kyc_status, email_verified,
          two_factor_enabled, preferences
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, email, wallet_address, country_code, kyc_status, created_at`,
        [
          email,
          passwordHash,
          walletAddress || null,
          countryCode || 'USA',
          'en',
          'medium',
          'pending',
          false,
          false,
          '{}'
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user profile
  async update(id, updates) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const index = database.tables.users.findIndex(u => u.id === id);
        if (index === -1) return null;
        
        const allowedFields = ['country_code', 'language', 'risk_tolerance', 'preferences'];
        
        for (const field of allowedFields) {
          if (updates[field] !== undefined) {
            database.tables.users[index][field] = updates[field];
          }
        }
        
        database.tables.users[index].updated_at = new Date().toISOString();
        
        return {
          id: database.tables.users[index].id,
          email: database.tables.users[index].email,
          wallet_address: database.tables.users[index].wallet_address,
          country_code: database.tables.users[index].country_code,
          kyc_status: database.tables.users[index].kyc_status,
          preferences: database.tables.users[index].preferences,
          updated_at: database.tables.users[index].updated_at
        };
      }
      
      // Real database mode
      const allowedFields = ['country_code', 'language', 'risk_tolerance', 'preferences'];
      const setClause = [];
      const values = [];
      let paramCount = 1;
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          setClause.push(`${field} = $${paramCount}`);
          values.push(updates[field]);
          paramCount++;
        }
      }
      
      if (setClause.length === 0) return null;
      
      setClause.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);
      
      const result = await database.query(
        `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING id, email, wallet_address, country_code, kyc_status, preferences, updated_at`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Update login attempts
  async updateLoginAttempts(id, success) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const index = database.tables.users.findIndex(u => u.id === id);
        if (index === -1) return;
        
        if (success) {
          database.tables.users[index].login_attempts = 0;
          database.tables.users[index].locked_until = null;
          database.tables.users[index].last_login = new Date().toISOString();
        } else {
          database.tables.users[index].login_attempts++;
          if (database.tables.users[index].login_attempts >= 4) {
            database.tables.users[index].locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          }
        }
        return;
      }
      
      // Real database mode
      if (success) {
        await database.query(
          'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = $1',
          [id]
        );
      } else {
        await database.query(
          `UPDATE users SET 
            login_attempts = login_attempts + 1,
            locked_until = CASE WHEN login_attempts >= 3 THEN CURRENT_TIMESTAMP + INTERVAL '30 minutes' ELSE locked_until END
           WHERE id = $1`,
          [id]
        );
      }
    } catch (error) {
      console.error('Error updating login attempts:', error);
      throw error;
    }
  },

  // Validate password
  async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  },

  // Set wallet address
  async setWalletAddress(id, walletAddress, publicKey) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const index = database.tables.users.findIndex(u => u.id === id);
        if (index === -1) return null;
        
        database.tables.users[index].wallet_address = walletAddress;
        database.tables.users[index].public_key = publicKey;
        database.tables.users[index].updated_at = new Date().toISOString();
        
        return {
          id: database.tables.users[index].id,
          email: database.tables.users[index].email,
          wallet_address: database.tables.users[index].wallet_address
        };
      }
      
      const result = await database.query(
        'UPDATE users SET wallet_address = $1, public_key = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, wallet_address',
        [walletAddress, publicKey, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error setting wallet address:', error);
      throw error;
    }
  },

  // Delete user
  async delete(id) {
    try {
      const database = this.getDb();
      
      if (db.isDemoMode()) {
        const index = database.tables.users.findIndex(u => u.id === id);
        if (index === -1) return false;
        
        database.tables.users.splice(index, 1);
        return true;
      }
      
      const result = await database.query('DELETE FROM users WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default User;
