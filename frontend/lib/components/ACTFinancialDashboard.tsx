/**
 * ACT Financial Dashboard - Complete Financial Overview
 * 
 * This component provides a comprehensive view of the user's financial status
 * including wallet balance, purchase history, and transaction management.
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import WalletBalance from './WalletBalance';
import { actPaymentService, type ACTPurchaseRecord, type WalletBalance as WalletBalanceType } from '../services/act-payment.service';

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

interface ACTFinancialDashboardProps {
  user: User;
}

const ACTFinancialDashboard: React.FC<ACTFinancialDashboardProps> = ({ user }) => {
  const [purchaseHistory, setPurchaseHistory] = useState<ACTPurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history' | 'stats'>('overview');

  useEffect(() => {
    loadPurchaseHistory();
  }, [user.id]);

  const loadPurchaseHistory = async () => {
    try {
      setLoading(true);
      const history = await actPaymentService.getPurchaseHistory(user.id);
      setPurchaseHistory(history);
    } catch (error) {
      console.error('Failed to load purchase history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalSpent = (): number => {
    return purchaseHistory
      .filter(p => p.payment_status === 'completed')
      .reduce((total, purchase) => total + purchase.fiat_amount, 0);
  };

  const getTotalTokens = (): number => {
    return purchaseHistory
      .filter(p => p.payment_status === 'completed')
      .reduce((total, purchase) => total + purchase.act_amount, 0);
  };

  const getPendingTransactions = (): number => {
    return purchaseHistory.filter(p => p.payment_status === 'pending').length;
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : undefined,
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
    };
    
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💰 ACT Financial Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.user_metadata?.full_name || user.email}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'history', label: '📜 Purchase History', icon: '📜' },
              { id: 'stats', label: '📈 Statistics', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">💳</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(getTotalSpent(), 'USD')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">💎</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Total ACT Tokens</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {getTotalTokens().toFixed(7)} ACT
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">⏳</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pending Transactions</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {getPendingTransactions()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Component */}
            <WalletBalance 
              userId={user.id} 
              showHistory={true} 
              className="max-w-md"
            />

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => window.location.href = '/buy-act'}
                  className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl mr-3">💳</span>
                  <div className="text-left">
                    <div className="font-medium text-blue-900">Buy ACT Tokens</div>
                    <div className="text-sm text-blue-700">Purchase more ACT with PesaPal</div>
                  </div>
                </button>

                <button
                  onClick={() => window.location.href = '/transfer'}
                  className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-2xl mr-3">🚀</span>
                  <div className="text-left">
                    <div className="font-medium text-green-900">Transfer Tokens</div>
                    <div className="text-sm text-green-700">Send ACT to other users</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase History Tab */}
        {selectedTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Purchase History</h3>
              <p className="text-sm text-gray-600">All your ACT token purchases</p>
            </div>

            <div className="overflow-x-auto">
              {purchaseHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">💸</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
                  <p className="text-gray-600 mb-6">Start by buying your first ACT tokens</p>
                  <button
                    onClick={() => window.location.href = '/buy-act'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buy ACT Tokens
                  </button>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACT Tokens
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseHistory.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {purchase.act_amount.toFixed(7)} ACT
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(purchase.fiat_amount, purchase.fiat_currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {purchase.payment_method.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(purchase.payment_status)}`}>
                            {purchase.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {selectedTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Spending Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Total Investment</h4>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(getTotalSpent(), 'USD')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Across {purchaseHistory.length} transactions
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Average Transaction</h4>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(
                      purchaseHistory.length > 0 ? getTotalSpent() / purchaseHistory.length : 0,
                      'USD'
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Per purchase
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Token Holdings</h3>
              
              <div className="text-center">
                <div className="text-6xl mb-4">💎</div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {getTotalTokens().toFixed(7)} ACT
                </div>
                <p className="text-gray-600">
                  Total ACT tokens in your wallet
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ACTFinancialDashboard;