'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminWebSocket } from '../../hooks/useWebSocket';
import { SystemHealth, TransactionEvent } from '../../services/websocket-client';

// Real-time admin dashboard component
export default function RealTimeAdminDashboard() {
  const {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    dashboardData,
    alerts,
    systemHealth,
    recentTransactions
  } = useAdminWebSocket({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001',
    auth: {
      adminId: 'bknglabs.dev@gmail.com',
      role: 'admin'
    }
  });

  // Local state for UI
  const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions' | 'system' | 'alerts'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Auto-refresh dashboard data
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isConnected]);

  // Connection management
  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }, [connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Get status color for health indicators
  const getHealthColor = (value: number, thresholds: { warning: number; critical: number }): string => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Render connection status
  const renderConnectionStatus = () => {
    const statusConfig = {
      connected: { color: 'bg-green-500', text: 'Connected', icon: '🔗' },
      connecting: { color: 'bg-yellow-500', text: 'Connecting...', icon: '⏳' },
      disconnected: { color: 'bg-gray-500', text: 'Disconnected', icon: '⚪' },
      error: { color: 'bg-red-500', text: 'Error', icon: '❌' }
    };

    const status = isConnected ? 'connected' : isConnecting ? 'connecting' : connectionError ? 'error' : 'disconnected';
    const config = statusConfig[status];

    return (
      <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${config.color} text-white`}>
        <span className="mr-2">{config.icon}</span>
        {config.text}
        {status === 'connected' && (
          <button
            onClick={handleDisconnect}
            className="ml-2 text-xs underline hover:no-underline"
          >
            Disconnect
          </button>
        )}
        {(status === 'disconnected' || status === 'error') && (
          <button
            onClick={handleConnect}
            className="ml-2 text-xs underline hover:no-underline"
          >
            Reconnect
          </button>
        )}
      </div>
    );
  };

  // Render system health metrics
  const renderSystemHealth = () => {
    if (!systemHealth) {
      return (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              <div className="h-3 bg-gray-300 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
          <div className="text-sm text-gray-500">
            Last updated: {systemHealth.timestamp.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Connections */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">👥</div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(systemHealth.connections.total)}
                </div>
                <div className="text-sm text-gray-600">Active Connections</div>
                <div className="text-xs text-gray-500 mt-1">
                  {systemHealth.connections.admins} admins, {systemHealth.connections.users} users
                </div>
              </div>
            </div>
          </div>

          {/* CPU Usage */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💻</div>
              <div>
                <div className={`text-2xl font-bold ${getHealthColor(systemHealth.performance.cpuUsage, { warning: 70, critical: 90 })}`}>
                  {systemHealth.performance.cpuUsage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">CPU Usage</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${systemHealth.performance.cpuUsage >= 90 ? 'bg-red-500' : systemHealth.performance.cpuUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(systemHealth.performance.cpuUsage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🧠</div>
              <div>
                <div className={`text-2xl font-bold ${getHealthColor(systemHealth.performance.memoryUsage, { warning: 400, critical: 600 })}`}>
                  {systemHealth.performance.memoryUsage.toFixed(0)}MB
                </div>
                <div className="text-sm text-gray-600">Memory Usage</div>
                <div className="text-xs text-gray-500 mt-1">
                  {((systemHealth.performance.memoryUsage / 1024) * 100).toFixed(1)}% of 1GB
                </div>
              </div>
            </div>
          </div>

          {/* Message Rate */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📡</div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(systemHealth.performance.messageRate)}
                </div>
                <div className="text-sm text-gray-600">Messages/sec</div>
                <div className="text-xs text-gray-500 mt-1">Real-time traffic</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        {systemHealth.alerts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Alerts</h3>
            <div className="space-y-2">
              {systemHealth.alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'border-red-500 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{alert.message}</div>
                      <div className="text-sm text-gray-600">
                        {alert.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.type === 'error' ? 'bg-red-200 text-red-800' :
                      alert.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render dashboard overview
  const renderOverview = () => (
    <div className="space-y-6">
      {renderSystemHealth()}
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-refresh
            </label>
            <span className="text-sm text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <div>No recent transactions</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.slice(0, 10).map((transaction, index) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {transaction.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-200 text-green-800' :
                        transaction.status === 'failed' ? 'bg-red-200 text-red-800' :
                        transaction.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.timestamp.toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Render real-time notifications
  const renderNotifications = () => {
    if (alerts.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">🔔</div>
            <div>No recent alerts</div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Alerts</h2>
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.type === 'error' ? 'border-red-500 bg-red-50' :
              alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{alert.message}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {alert.timestamp.toLocaleString()}
                  </div>
                  {alert.metadata && (
                    <div className="text-xs text-gray-500 mt-2 font-mono">
                      {JSON.stringify(alert.metadata, null, 2)}
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  alert.type === 'error' ? 'bg-red-200 text-red-800' :
                  alert.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {alert.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🚀 ARKHAM Real-Time Dashboard</h1>
              <p className="text-gray-600 mt-1">Phase 1: Real-Time Madness</p>
            </div>
            <div className="flex items-center space-x-4">
              {renderConnectionStatus()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'transactions', name: 'Transactions', icon: '💰' },
              { id: 'system', name: 'System Health', icon: '🏥' },
              { id: 'alerts', name: 'Alerts', icon: '🚨' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'transactions' && renderOverview()}
        {selectedTab === 'system' && renderSystemHealth()}
        {selectedTab === 'alerts' && renderNotifications()}
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">Connection Error</div>
              <div className="text-sm mt-1">{connectionError}</div>
            </div>
            <button
              onClick={handleConnect}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}