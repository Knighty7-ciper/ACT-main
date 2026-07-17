import express from 'express';
import { param, body, query } from 'express-validator';
import * as transactionController from '../controllers/transactionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get transactions for a wallet
router.get('/', [
  query('walletId').notEmpty().withMessage('Wallet ID is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('sortBy').optional().isIn(['created_at', 'amount', 'type']),
  query('sortOrder').optional().isIn(['ASC', 'DESC']),
  query('status').optional().isIn(['pending', 'confirmed', 'failed', 'cancelled']),
  query('type').optional().isIn(['transfer', 'swap', 'stake', 'unstake', 'reward', 'fee'])
], requireAuth, transactionController.getTransactions);

// Execute a swap transaction
router.post('/swap', [
  body('walletId').notEmpty().withMessage('Wallet ID is required'),
  body('fromCurrency').notEmpty().isString(),
  body('toCurrency').notEmpty().isString(),
  body('fromAmount').isFloat({ min: 0.00000001 }),
  body('toAmount').isFloat({ min: 0.00000001 }),
  body('exchangeRate').optional().isFloat({ min: 0 }),
  body('slippage').optional().isFloat({ min: 0, max: 100 })
], requireAuth, transactionController.executeSwap);

// Get transaction by hash
router.get('/hash/:hash', [
  param('hash').isLength({ min: 64, max: 66 }).isHexadecimal()
], transactionController.getTransactionByHash);

// Get transaction statistics
router.get('/stats', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], transactionController.getTransactionStats);

// Get recent public transactions
router.get('/recent', [
  query('limit').optional().isInt({ min: 1, max: 50 })
], transactionController.getRecentTransactions);

export default router;
