import express from 'express';
import { body, param, query } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authenticate, rateLimiter } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('countryCode').optional().isLength({ min: 2, max: 3 }).isUppercase()
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const validateRefresh = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

const validateWalletLink = [
  body('walletAddress').notEmpty().withMessage('Wallet address is required'),
  body('publicKey').optional().isString()
];

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', validateRefresh, authController.refreshToken);

// Protected routes
router.get('/profile', authenticate, rateLimiter, authController.getProfile);
router.put('/profile', authenticate, rateLimiter, [
  body('countryCode').optional().isLength({ min: 2, max: 3 }).isUpperCase(),
  body('language').optional().isLength({ min: 2, max: 10 }),
  body('riskTolerance').optional().isIn(['low', 'medium', 'high'])
], authController.updateProfile);

router.post('/link-wallet', authenticate, rateLimiter, validateWalletLink, authController.linkWallet);

router.put('/change-password', authenticate, rateLimiter, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
], authController.changePassword);

router.post('/logout', authenticate, authController.logout);

export default router;
