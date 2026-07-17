import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import { v4 as uuidv4 } from 'uuid';

// Get transactions for a wallet
export const getTransactions = async (req, res) => {
  try {
    const { walletId, limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'DESC', status, type } = req.query;
    
    if (!walletId) {
      return res.status(400).json({
        success: false,
        error: 'Missing wallet ID',
        message: 'Wallet ID is required'
      });
    }
    
    // Verify wallet belongs to user
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Wallet not found'
      });
    }
    
    // Check if wallet belongs to authenticated user
    if (req.user && req.user.id !== wallet.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have access to this wallet'
      });
    }
    
    // Get transactions
    const transactions = await Transaction.getByWalletId(walletId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      type
    });
    
    const totalCount = await Transaction.getCountByWalletId(walletId, { status, type });
    
    // Format transactions for frontend
    const formatted = transactions.map(tx => ({
      id: tx.id,
      type: tx.transaction_type,
      amount: parseFloat(tx.amount),
      value: parseFloat(tx.amount),
      currency: tx.currency,
      status: tx.status,
      from: tx.sender_address,
      to: tx.recipient_address,
      date: tx.created_at,
      createdAt: tx.created_at,
      hash: tx.transaction_hash,
      memo: tx.memo
    }));
    
    res.json({
      success: true,
      data: {
        transactions: formatted,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + transactions.length
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching transactions'
    });
  }
};

// Execute a swap transaction
export const executeSwap = async (req, res) => {
  try {
    const { walletId, fromCurrency, toCurrency, fromAmount, toAmount, exchangeRate, slippage } = req.body;
    
    // Validate required fields
    if (!walletId || !fromCurrency || !toCurrency || !fromAmount || !toAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameters',
        message: 'walletId, fromCurrency, toCurrency, fromAmount, and toAmount are required'
      });
    }
    
    // Verify wallet belongs to authenticated user
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Wallet not found'
      });
    }
    
    if (!req.user || req.user.id !== wallet.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have access to this wallet'
      });
    }
    
    // Check balance
    const balance = parseFloat(wallet.balance || 0);
    if (balance < parseFloat(fromAmount)) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance',
        message: 'You do not have enough ACT to perform this swap'
      });
    }
    
    // Calculate fee (0.1%)
    const feeAmount = parseFloat(fromAmount) * 0.001;
    const netAmount = parseFloat(fromAmount) - feeAmount;
    
    // Update wallet balance
    await Wallet.updateBalance(walletId, -parseFloat(fromAmount));
    
    // Create swap transaction record
    const swapTransaction = await Transaction.create({
      transactionHash: `0x${uuidv4().replace(/-/g, '')}`,
      transactionType: 'swap',
      senderWalletId: walletId,
      recipientWalletId: walletId, // Same wallet for internal swap
      amount: parseFloat(fromAmount),
      feeAmount,
      currency: fromCurrency,
      memo: `Swap ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}`,
      metadata: {
        fromCurrency,
        toCurrency,
        toAmount: parseFloat(toAmount),
        exchangeRate,
        slippage,
        netAmount
      }
    });
    
    // Create a "receive" record for the swap (to track in transaction history)
    const receiveTransaction = await Transaction.create({
      transactionHash: `0x${uuidv4().replace(/-/g, '')}`,
      transactionType: 'transfer',
      senderWalletId: walletId,
      recipientWalletId: walletId,
      amount: parseFloat(toAmount),
      feeAmount: 0,
      currency: toCurrency,
      memo: `Swap receive: ${toAmount} ${toCurrency}`,
      metadata: {
        relatedTransactionId: swapTransaction.id,
        swapFrom: fromCurrency,
        exchangeRate,
        slippage
      }
    });
    
    res.json({
      success: true,
      data: {
        transaction: {
          id: swapTransaction.id,
          hash: swapTransaction.transaction_hash,
          type: 'swap',
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(toAmount),
          fromCurrency,
          toCurrency,
          exchangeRate,
          slippage,
          fee: feeAmount,
          status: 'confirmed',
          createdAt: swapTransaction.created_at
        }
      }
    });
  } catch (error) {
    console.error('Execute swap error:', error);
    res.status(500).json({
      success: false,
      error: 'Swap failed',
      message: error.message || 'An error occurred while processing the swap'
    });
  }
};

// Get transaction by hash
export const getTransactionByHash = async (req, res) => {
  try {
    const { hash } = req.params;
    
    const transaction = await Transaction.findByHash(hash);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        transaction: {
          id: transaction.id,
          hash: transaction.transaction_hash,
          type: transaction.transaction_type,
          amount: parseFloat(transaction.amount),
          currency: transaction.currency,
          status: transaction.status,
          sender: transaction.sender_address,
          recipient: transaction.recipient_address,
          fee: parseFloat(transaction.fee_amount),
          memo: transaction.memo,
          metadata: transaction.metadata,
          createdAt: transaction.created_at,
          confirmedAt: transaction.confirmed_at
        }
      }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching transaction'
    });
  }
};

// Get transaction statistics
export const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();
    
    const stats = await Transaction.getStatistics(start, end);
    
    res.json({
      success: true,
      data: {
        totalTransactions: parseInt(stats.total_transactions || 0),
        confirmedTransactions: parseInt(stats.confirmed_transactions || 0),
        totalVolume: parseFloat(stats.total_volume || 0),
        uniqueSenders: parseInt(stats.unique_senders || 0),
        uniqueRecipients: parseInt(stats.unique_recipients || 0),
        avgTransactionSize: parseFloat(stats.avg_transaction_size || 0)
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching statistics'
    });
  }
};

// Get recent public transactions
export const getRecentTransactions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const transactions = await Transaction.getRecentPublic(parseInt(limit));
    
    const formatted = transactions.map(tx => ({
      hash: tx.transaction_hash,
      type: tx.transaction_type,
      amount: parseFloat(tx.amount),
      currency: tx.currency,
      sender: tx.sender?.slice(0, 6) + '...' + tx.sender?.slice(-4),
      recipient: tx.recipient?.slice(0, 6) + '...' + tx.recipient?.slice(-4),
      createdAt: tx.created_at
    }));
    
    res.json({
      success: true,
      data: {
        transactions: formatted
      }
    });
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching recent transactions'
    });
  }
};

export default {
  getTransactions,
  executeSwap,
  getTransactionByHash,
  getTransactionStats,
  getRecentTransactions
};
