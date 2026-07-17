import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { authenticate } from '../middleware/auth.js';

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, countryCode, walletAddress, publicKey } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Weak password',
        message: 'Password must be at least 8 characters long'
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User exists',
        message: 'An account with this email already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      walletAddress,
      countryCode
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // If wallet provided, link it
    if (walletAddress) {
      await Wallet.setWalletAddress(user.id, walletAddress, publicKey);
    }
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          countryCode: user.country_code,
          kycStatus: user.kyc_status
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }
    
    // Find user
    const user = await User.findByEmail(email);
    
    if (!user) {
      // Generic error message for security
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({
        success: false,
        error: 'Account locked',
        message: 'Account is temporarily locked. Please try again later.'
      });
    }
    
    // Validate password
    const isValid = await User.validatePassword(password, user.password_hash);
    
    if (!isValid) {
      await User.updateLoginAttempts(user.id, false);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified',
        message: 'Please verify your email before logging in'
      });
    }
    
    // Successful login
    await User.updateLoginAttempts(user.id, true);
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Get user's wallets
    const wallets = await Wallet.findByUserId(user.id);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          countryCode: user.country_code,
          kycStatus: user.kyc_status,
          twoFactorEnabled: user.two_factor_enabled
        },
        wallets: wallets.map(w => ({
          id: w.id,
          address: w.wallet_address,
          type: w.wallet_type,
          balance: w.balance,
          isDefault: w.is_default
        })),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing token',
        message: 'Refresh token is required'
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'Invalid refresh token'
        });
      }
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          message: 'User account no longer exists'
        });
      }
      
      const tokens = generateTokens(user.id);
      
      res.json({
        success: true,
        data: {
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          }
        }
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Refresh token has expired. Please log in again.'
      });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing token'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found'
      });
    }
    
    const wallets = await Wallet.findByUserId(req.userId);
    const totalBalance = await Wallet.getTotalBalance(req.userId);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          countryCode: user.country_code,
          language: user.language,
          kycStatus: user.kyc_status,
          emailVerified: user.email_verified,
          twoFactorEnabled: user.two_factor_enabled,
          preferences: user.preferences,
          createdAt: user.created_at
        },
        wallets: wallets.map(w => ({
          id: w.id,
          address: w.wallet_address,
          type: w.wallet_type,
          balance: w.balance,
          isDefault: w.is_default
        })),
        totalBalance
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile fetch failed',
      message: 'An error occurred while fetching profile'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { countryCode, language, riskTolerance, preferences } = req.body;
    
    const updates = {};
    if (countryCode) updates.country_code = countryCode;
    if (language) updates.language = language;
    if (riskTolerance) updates.risk_tolerance = riskTolerance;
    if (preferences) updates.preferences = JSON.stringify(preferences);
    
    const user = await User.update(req.userId, updates);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          countryCode: user.country_code,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Update failed',
      message: 'An error occurred while updating profile'
    });
  }
};

// Link wallet to account
export const linkWallet = async (req, res) => {
  try {
    const { walletAddress, publicKey } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing wallet address',
        message: 'Wallet address is required'
      });
    }
    
    // Check if wallet already linked
    const existingWallet = await Wallet.findByAddress(walletAddress);
    if (existingWallet) {
      return res.status(409).json({
        success: false,
        error: 'Wallet linked',
        message: 'This wallet is already linked to another account'
      });
    }
    
    const wallet = await Wallet.setWalletAddress(req.userId, walletAddress, publicKey);
    
    res.json({
      success: true,
      message: 'Wallet linked successfully',
      data: {
        wallet: {
          id: wallet.id,
          address: wallet.wallet_address
        }
      }
    });
  } catch (error) {
    console.error('Link wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Wallet link failed',
      message: 'An error occurred while linking wallet'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing passwords',
        message: 'Current and new password are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Weak password',
        message: 'New password must be at least 8 characters long'
      });
    }
    
    const user = await User.findByEmail(req.user.email);
    
    const isValid = await User.validatePassword(currentPassword, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    await import('../config/database.js').default.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, req.userId]
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password change failed',
      message: 'An error occurred while changing password'
    });
  }
};

// Logout (client-side token removal, but we can track it)
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

export default {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  linkWallet,
  changePassword,
  logout
};
