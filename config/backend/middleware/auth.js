import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid authentication token'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch fresh user data
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          message: 'User account no longer exists'
        });
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return res.status(423).json({
          success: false,
          error: 'Account locked',
          message: 'Account is temporarily locked due to multiple failed login attempts'
        });
      }

      // Attach user to request
      req.user = user;
      req.userId = user.id;
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'Authentication token is invalid'
        });
      }
      
      throw jwtError;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check specific role or permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: `This action requires ${permission} permission`
      });
    }

    next();
  };
};

// Rate limiting per user
const userRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max requests per window
};

const rateLimitMap = new Map();

const rateLimiter = (req, res, next) => {
  const userId = req.userId || req.ip;
  const now = Date.now();
  
  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, { count: 0, resetTime: now + userRateLimit.windowMs });
  }
  
  const userLimit = rateLimitMap.get(userId);
  
  if (now > userLimit.resetTime) {
    // Reset window
    userLimit.count = 0;
    userLimit.resetTime = now + userRateLimit.windowMs;
  }
  
  userLimit.count++;
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', userRateLimit.max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, userRateLimit.max - userLimit.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(userLimit.resetTime / 1000));
  
  if (userLimit.count > userRateLimit.max) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  next();
};

export { authenticate, optionalAuth, requirePermission, rateLimiter };
