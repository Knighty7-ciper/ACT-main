/**
 * Admin Panel - User Management & KYC Administration
 * 
 * Complete administrative interface for managing users, KYC verification,
 * transactions, and system oversight with real-time monitoring.
 */

import React, { useState, useEffect } from 'react';
import { userService, type UserProfile, type KYCDocument } from '../services/user.service';
import { actPaymentService, type WalletBalance } from '../services/act-payment.service';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
}

interface AdminPanelProps {
  adminUser: AdminUser;
}

interface DashboardStats {
  totalUsers: number;
  pendingKYC: number;
  verifiedUsers: number;
  rejectedKYC: number;
  todayTransactions: number;
  totalRevenue: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface PendingKYC {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  document_type: string;
  submitted_at: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ adminUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [pendingKYC, setPendingKYC] = useState<PendingKYC[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState<KYCDocument | null>(null);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'kyc', label: 'KYC Verification', icon: '🛡️' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  useEffect(() => {
    loadDashboardData();
    loadPendingKYC();
    loadUsers();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate dashboard stats loading
      const stats: DashboardStats = {
        totalUsers: 1247,
        pendingKYC: 23,
        verifiedUsers: 1089,
        rejectedKYC: 12,
        todayTransactions: 89,
        totalRevenue: 456780.50,
        activeUsers: 934,
        systemHealth: 'healthy'
      };
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingKYC = async () => {
    try {
      // This would fetch all pending KYC documents from database
      const mockPendingKYC: PendingKYC[] = [
        {
          id: '1',
          user_id: 'user1',
          user_email: 'john@example.com',
          user_name: 'John Doe',
          document_type: 'national_id',
          submitted_at: '2025-10-27T10:30:00Z',
          status: 'reviewing',
          priority: 'high'
        },
        {
          id: '2',
          user_id: 'user2',
          user_email: 'jane@example.com',
          user_name: 'Jane Smith',
          document_type: 'passport',
          submitted_at: '2025-10-27T09:15:00Z',
          status: 'uploaded',
          priority: 'medium'
        }
      ];
      setPendingKYC(mockPendingKYC);
    } catch (error) {
      console.error('Error loading pending KYC:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // This would fetch users from database with pagination
      const mockUsers: UserProfile[] = [
        {
          id: '1',
          user_id: 'user1',
          email: 'john@example.com',
          phone: '+254712345678',
          full_name: 'John Doe',
          date_of_birth: '1990-01-01',
          kyc_status: 'pending',
          kyc_level: 'basic',
          country_code: 'KE',
          currency_preference: 'KES',
          is_active: true,
          created_at: '2025-10-01T00:00:00Z',
          updated_at: '2025-10-27T10:30:00Z',
          verification_documents: {},
          limits: {
            daily_limit: 10000,
            monthly_limit: 50000,
            annual_limit: 200000,
            current_daily_spent: 2500,
            current_monthly_spent: 12000,
            current_annual_spent: 45000
          }
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleKYCApproval = async (kycId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      // This would call the backend API to update KYC status
      console.log(`KYC ${kycId} ${status}:`, notes);
      
      // Update local state
      setPendingKYC(prev => prev.filter(item => item.id !== kycId));
      
      alert(`KYC ${status} successfully!`);
    } catch (error) {
      console.error('Error updating KYC status:', error);
      alert('Failed to update KYC status');
    }
  };

  const handleUserSuspension = async (userId: string, suspended: boolean, reason?: string) => {
    try {
      // This would call the backend API to suspend/unsuspend user
      console.log(`User ${userId} ${suspended ? 'suspended' : 'activated'}:`, reason);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, is_active: !suspended }
          : user
      ));
      
      alert(`User ${suspended ? 'suspended' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    const symbols: { [key: string]: string } = {
      'KES': 'KSh',
      'UGX': 'USh',
      'GHS': '₵',
      'TZS': 'TSh',
      'USD': '$'
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol} ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': case 'reviewing': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">User Management & KYC Administration</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {adminUser.email} ({adminUser.role})
              </span>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                dashboardStats.systemHealth === 'healthy' ? 'bg-green-100 text-green-800' :
                dashboardStats.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                System: {dashboardStats.systemHealth.toUpperCase()}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Verified Users</h3>
                    <p className="text-2xl font-bold text-green-600">{dashboardStats.verifiedUsers.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{dashboardStats.pendingKYC} pending KYC</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Today's Transactions</h3>
                    <p className="text-2xl font-bold text-blue-600">{dashboardStats.todayTransactions}</p>
                    <p className="text-xs text-gray-500">Revenue: {formatCurrency(dashboardStats.totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                    <p className="text-2xl font-bold text-purple-600">{dashboardStats.activeUsers.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">75% of total users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm text-gray-900">New user registered</p>
                        <p className="text-xs text-gray-500">john@example.com • 2 minutes ago</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">+1</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm text-gray-900">KYC document uploaded</p>
                        <p className="text-xs text-gray-500">jane@example.com • 5 minutes ago</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Doc</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm text-gray-900">Payment processed</p>
                        <p className="text-xs text-gray-500">Transaction #12345 • 8 minutes ago</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">KSh 5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.kyc_status)}`}>
                          {user.kyc_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.limits ? formatCurrency(user.limits.current_daily_spent) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleUserSuspension(user.user_id, user.is_active, 'Admin action')}
                          className={`${user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {user.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
              <div className="flex space-x-4">
                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Documents</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* KYC Queue */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Pending Review</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {pendingKYC.map((kyc) => (
                      <div key={kyc.id} className="p-6 hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-sm font-medium text-gray-900">{kyc.user_name}</h4>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(kyc.priority)}`}>
                                {kyc.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{kyc.user_email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-400">{kyc.document_type}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(kyc.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedKYC(kyc as any)}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleKYCApproval(kyc.id, 'approved')}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleKYCApproval(kyc.id, 'rejected')}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KYC Details Panel */}
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending Review</span>
                      <span className="text-sm font-medium">{pendingKYC.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Approved Today</span>
                      <span className="text-sm font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rejected Today</span>
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Review Time</span>
                      <span className="text-sm font-medium">2.3 hours</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Document Preview</h3>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-500">Select a document to review</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Transaction Monitoring</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Volume</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today's Transactions</span>
                    <span className="text-lg font-bold">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Volume</span>
                    <span className="text-lg font-bold">{formatCurrency(456780.50)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-lg font-bold text-green-600">98.7%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">ACT Purchase</p>
                      <p className="text-xs text-gray-500">john@example.com</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(5000)}</p>
                      <p className="text-xs text-green-600">Completed</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">ACT Purchase</p>
                      <p className="text-xs text-gray-500">jane@example.com</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(2500)}</p>
                      <p className="text-xs text-yellow-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500">User Growth Chart</p>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Analysis</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500">Revenue Chart</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">KYC Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Auto-approval Threshold</label>
                  <select className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded-md">
                    <option>Manual Review</option>
                    <option>Low Risk Only</option>
                    <option>Medium Risk Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Retention (days)</label>
                  <input 
                    type="number" 
                    defaultValue="365" 
                    className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">KYC Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.kyc_status)}`}>
                      {selectedUser.kyc_status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => handleUserSuspension(selectedUser.user_id, selectedUser.is_active, 'Admin action')}
                      className={`px-4 py-2 rounded-md ${selectedUser.is_active ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                      {selectedUser.is_active ? 'Suspend User' : 'Activate User'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;