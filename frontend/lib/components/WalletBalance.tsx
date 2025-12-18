/**
 * Wallet Balance Component - Unified Wallet Display
 * 
 * This component provides a consistent wallet balance display throughout the platform.
 * It automatically fetches and displays the user's ACT token balance with real-time updates.
 */

import React, { useState, useEffect } from 'react';
import { actPaymentService, type WalletBalance } from '../services/act-payment.service';

interface WalletBalanceProps {
  userId: string;
  showHistory?: boolean;
  compact?: boolean;
  className?: string;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  userId, 
  showHistory = false, 
  compact = false,
  className = '' 
}) => {
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWalletBalance();
    
    // Refresh balance every 30 seconds
    const interval = setInterval(loadWalletBalance, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadWalletBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const walletData = await actPaymentService.getWalletBalance(userId);
      setWallet(walletData);
      
    } catch (err) {
      console.error('Failed to load wallet balance:', err);
      setError('Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: number): string => {
    return balance.toFixed(7);
  };

  const getStatusColor = (): string => {
    if (!wallet?.is_active) return 'text-red-500';
    if (wallet.balance > 0) return 'text-green-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <span className="text-red-500 mr-2">⚠️</span>
          <span className="text-red-700 text-sm">{error}</span>
        </div>
        <button 
          onClick={loadWalletBalance}
          className="mt-2 text-red-600 hover:text-red-800 text-xs underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <span className="text-yellow-700 text-sm">Wallet not found</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-2xl">💰</span>
        <span className={`font-mono font-bold ${getStatusColor()}`}>
          {formatBalance(wallet.balance)} ACT
        </span>
        {!wallet.is_active && (
          <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
            Inactive
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">My Wallet</h3>
        <button
          onClick={loadWalletBalance}
          className="text-blue-600 hover:text-blue-800 text-sm"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="text-center">
        <div className="text-4xl mb-2">💎</div>
        <div className={`text-3xl font-bold font-mono ${getStatusColor()}`}>
          {formatBalance(wallet.balance)}
        </div>
        <div className="text-gray-600 text-sm mt-1">ACT Tokens</div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Status:</span>
            <span className={`ml-2 font-medium ${wallet.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {wallet.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Currency:</span>
            <span className="ml-2 font-medium">{wallet.currency}</span>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Recent Activity</h4>
          <div className="text-xs text-gray-500">
            Last updated: {new Date(wallet.updated_at).toLocaleString()}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2">
        <button
          onClick={() => window.location.href = '/buy-act'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          💳 Buy ACT Tokens
        </button>
        <button
          onClick={() => window.location.href = '/transfer'}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          disabled={wallet.balance <= 0}
        >
          🚀 Transfer Tokens
        </button>
      </div>
    </div>
  );
};

export default WalletBalance;