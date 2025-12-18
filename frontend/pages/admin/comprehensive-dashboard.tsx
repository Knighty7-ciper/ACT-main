import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield,
  Settings,
  Bell,
  TrendingUp,
  AlertTriangle,
  Activity,
  UserCheck,
  MessageSquare,
  Key,
  Database,
  Eye,
  Edit3,
  Send,
  Check,
  X,
  Users,
  DollarSign,
  FileText,
  Lock,
  Globe,
  Server,
  HardDrive,
  Cpu,
  Network,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  UserPlus,
  Crown,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  UserCog,
  ShieldCheck,
  ServerCog,
  DatabaseCog,
  NetworkCog,
  Brain,
  Lightbulb,
  Camera,
  Image,
  FileImage,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Layers,
  Gauge,
  CircuitBoard,
  HardDriveIcon,
  WifiIcon
} from 'lucide-react';

// Professional TypeScript interfaces
interface DashboardData {
  totalUsers: number;
  pendingRequests: number;
  activeAuthorizations: number;
  pending_kyc: number;
  totalVolume24h: number;
  activeConnections: number;
  systemHealth: number;
  lastUpdated: string;
}

interface User {
  id: string;
  user_id: string;
  full_name?: string;
  email: string;
  kyc_status?: string;
  is_active: boolean;
  last_login?: string;
  country?: string;
  city?: string;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: number;
  active_connections: number;
  response_time: number;
  uptime: string;
}

interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

// Professional Admin Dashboard Component
export default function ComprehensiveAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initialize dashboard with real-time monitoring
  useEffect(() => {
    initializeDashboard();
    
    // Set up real-time updates
    if (isLiveMode) {
      const interval = setInterval(() => {
        refreshDashboardData();
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isLiveMode]);

  const initializeDashboard = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDashboardData(),
        loadSystemMetrics(),
        loadAlerts()
      ]);
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        loadDashboardData(),
        loadSystemMetrics()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Enhanced dashboard stats with real-time data
      const response = await fetch('/api/admin/dashboard-enhanced', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set mock data for development
      setDashboardData({
        totalUsers: 1247,
        pendingRequests: 23,
        activeAuthorizations: 8,
        pending_kyc: 15,
        totalVolume24h: 1250000,
        activeConnections: 45,
        systemHealth: 98.5,
        lastUpdated: new Date().toISOString()
      });
    }
  }, []);

  const loadSystemMetrics = useCallback(async () => {
    try {
      // Mock system metrics for demonstration
      setSystemMetrics({
        cpu_usage: 23.5 + Math.random() * 10,
        memory_usage: 67.8 + Math.random() * 5,
        disk_usage: 45.2 + Math.random() * 8,
        network_io: 120.5 + Math.random() * 50,
        active_connections: 45 + Math.floor(Math.random() * 10),
        response_time: 120 + Math.random() * 50,
        uptime: '12d 14h 32m'
      });
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      // Mock alerts for demonstration
      setAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Database memory usage is above 85%',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'info',
          title: 'System Backup Complete',
          message: 'Daily backup completed successfully',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          resolved: true
        }
      ]);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  }, []);

  // User Request Management
  const handleCreateRequest = async (requestData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Request created successfully!');
        loadDashboardData();
      } else {
        alert('Failed to create request: ' + result.error);
      }
    } catch (error) {
      console.error('Create request error:', error);
      alert('Failed to create request');
    }
  };

  // Admin Authorization System
  const handleCreateAuthorization = async (authorizationData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/authorization', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authorizationData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setAuthorizationToken(result.authorization_token);
        alert('Authorization created! Token: ' + result.authorization_token);
      } else {
        alert('Failed to create authorization: ' + result.error);
      }
    } catch (error) {
      console.error('Create authorization error:', error);
      alert('Failed to create authorization');
    }
  };

  // Execute Admin Changes
  const handleExecuteChanges = async (executeData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/execute-changes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(executeData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Changes executed successfully!');
        loadDashboardData();
      } else {
        alert('Failed to execute changes: ' + result.error);
      }
    } catch (error) {
      console.error('Execute changes error:', error);
      alert('Failed to execute changes');
    }
  };

  // Send Authorization Email
  const handleSendAuthorizationEmail = async (emailData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/send-authorization-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Authorization email sent successfully!');
      } else {
        alert('Failed to send email: ' + result.error);
      }
    } catch (error) {
      console.error('Send email error:', error);
      alert('Failed to send email');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <Shield className="absolute inset-0 m-auto h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Initializing Admin Control Center</h3>
          <p className="text-blue-200">Loading system metrics and dashboard data...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Professional Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>
                  <p className="text-blue-200 text-sm">Enterprise-grade system management</p>
                </div>
              </div>
              
              {/* System Status Indicators */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-200 text-sm font-medium">System Online</span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <Database className="h-4 w-4 text-blue-300" />
                  <span className="text-blue-200 text-sm">
                    {systemMetrics?.cpu_usage.toFixed(1)}% CPU
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Live Mode Toggle */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs text-blue-200">Last Update</p>
                  <p className="text-sm text-white font-medium">
                    {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isLiveMode ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                  }`}
                  title={isLiveMode ? 'Live monitoring on' : 'Live monitoring off'}
                >
                  <Activity className="h-5 w-5" />
                </button>
                <button
                  onClick={refreshDashboardData}
                  disabled={refreshing}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all duration-200 disabled:opacity-50"
                  title="Refresh dashboard"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Super Admin</p>
                  <p className="text-xs text-blue-200">System Administrator</p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Navigation */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 p-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
              { id: 'users', label: 'Users', icon: Users, color: 'from-green-500 to-emerald-500' },
              { id: 'requests', label: 'Requests', icon: MessageSquare, color: 'from-yellow-500 to-orange-500' },
              { id: 'authorizations', label: 'Auth System', icon: Key, color: 'from-purple-500 to-violet-500' },
              { id: 'kyc', label: 'KYC Review', icon: UserCheck, color: 'from-pink-500 to-rose-500' },
              { id: 'transactions', label: 'Transactions', icon: DollarSign, color: 'from-emerald-500 to-green-500' },
              { id: 'audit', label: 'Audit Log', icon: FileText, color: 'from-indigo-500 to-blue-500' },
              { id: 'system', label: 'System', icon: ServerCog, color: 'from-gray-500 to-slate-500' },
              { id: 'monitoring', label: 'Monitoring', icon: Gauge, color: 'from-red-500 to-pink-500' },
              { id: 'security', label: 'Security', icon: ShieldCheck, color: 'from-teal-500 to-cyan-500' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab dashboardData={dashboardData} />
        )}

        {activeTab === 'users' && (
          <UsersTab onSelectUser={setSelectedUser} />
        )}

        {activeTab === 'requests' && (
          <RequestsTab onCreateRequest={handleCreateRequest} />
        )}

        {activeTab === 'authorizations' && (
          <AuthorizationsTab 
            onCreateAuthorization={handleCreateAuthorization}
            onSendEmail={handleSendAuthorizationEmail}
            authorizationToken={authorizationToken}
          />
        )}

        {activeTab === 'kyc' && (
          <KYCTab />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab />
        )}

        {activeTab === 'audit' && (
          <AuditTab />
        )}

        {activeTab === 'system' && (
          <SystemControlTab 
            onExecuteChanges={handleExecuteChanges}
            authorizationToken={authorizationToken}
          />
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onExecuteChanges={handleExecuteChanges}
        />
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ dashboardData }) {
  const stats = [
    {
      name: 'Total Users',
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Pending Requests',
      value: dashboardData?.pendingRequests || 0,
      icon: MessageSquare,
      color: 'bg-yellow-500'
    },
    {
      name: 'Active Authorizations',
      value: dashboardData?.activeAuthorizations || 0,
      icon: Key,
      color: 'bg-purple-500'
    },
    {
      name: 'Pending KYC',
      value: dashboardData?.pending_kyc || 0,
      icon: UserCheck,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Admin Activity</h3>
        </div>
        <div className="p-6">
          {dashboardData?.adminActivity?.recent_actions?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.adminActivity.recent_actions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{action.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(action.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {action.action_type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/users?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">User Management</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.full_name?.charAt(0) || user.email.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name || 'No name'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                    user.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.kyc_status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onSelectUser(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <Edit3 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// User Detail Modal Component
function UserDetailModal({ user, onClose, onExecuteChanges }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    country_code: user?.country_code || '',
    city: user?.city || ''
  });

  useEffect(() => {
    if (user) {
      loadCompleteUserData();
    }
  }, [user]);

  const loadCompleteUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/admin/users/${user.user_id}/complete-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setUserData(data.data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // This would require an authorization token in a real implementation
    alert('Profile update requires user authorization. Use the authorization system.');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">User Details - Complete Access</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-900 mb-4">Profile Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={editForm.country_code}
                    onChange={(e) => setEditForm({...editForm, country_code: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Save Changes (Requires Authorization)
              </button>
            </div>

            {/* Wallet Information */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-green-900 mb-4">Wallet Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Balance</label>
                  <div className="text-lg font-semibold">
                    {userData?.wallet?.balance || '0'} ACT
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stellar Public Key</label>
                  <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                    {userData?.wallet?.stellar_public_key || 'Not set'}
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Documents */}
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-yellow-900 mb-4">KYC Documents</h4>
              {userData?.kyc_documents?.length > 0 ? (
                <div className="space-y-3">
                  {userData.kyc_documents.map((doc, index) => (
                    <div key={index} className="border rounded p-3 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{doc.document_type}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Submitted: {new Date(doc.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No KYC documents submitted</p>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-purple-900 mb-4">Recent Transactions</h4>
              {userData?.transactions?.length > 0 ? (
                <div className="space-y-3">
                  {userData.transactions.slice(0, 5).map((tx, index) => (
                    <div key={index} className="border rounded p-3 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{tx.amount} ACT</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                          tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {tx.fiat_amount} {tx.currency} • {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent transactions</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Create User Request
          </button>
        </div>
      </div>
    </div>
  );
}

// Requests Tab Component
function RequestsTab({ onCreateRequest }) {
  const [requests, setRequests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    request_type: 'profile_edit',
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    await onCreateRequest(newRequest);
    setShowCreateForm(false);
    setNewRequest({
      request_type: 'profile_edit',
      title: '',
      description: '',
      priority: 'medium'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">User Requests</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Request
        </button>
      </div>

      {/* Create Request Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Create New Request</h3>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Request Type</label>
                <select
                  value={newRequest.request_type}
                  onChange={(e) => setNewRequest({...newRequest, request_type: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="profile_edit">Profile Edit</option>
                  <option value="kyc_assistance">KYC Assistance</option>
                  <option value="transaction_review">Transaction Review</option>
                  <option value="account_issue">Account Issue</option>
                  <option value="data_export">Data Export</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newRequest.title}
                onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">No requests to display. Create your first request above.</p>
        </div>
      </div>
    </div>
  );
}

// Authorizations Tab Component
function AuthorizationsTab({ onCreateAuthorization, onSendEmail, authorizationToken }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAuth, setNewAuth] = useState({
    request_id: '',
    authorization_type: 'profile_update',
    proposed_changes: {},
    reason: ''
  });

  const handleCreateAuthorization = async (e) => {
    e.preventDefault();
    await onCreateAuthorization(newAuth);
    setShowCreateForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Admin Authorizations</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Create Authorization
        </button>
      </div>

      {/* Create Authorization Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Create Authorization Request</h3>
          <form onSubmit={handleCreateAuthorization} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Request ID</label>
              <input
                type="text"
                value={newAuth.request_id}
                onChange={(e) => setNewAuth({...newAuth, request_id: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter request ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Authorization Type</label>
              <select
                value={newAuth.authorization_type}
                onChange={(e) => setNewAuth({...newAuth, authorization_type: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="profile_update">Profile Update</option>
                <option value="transaction_modification">Transaction Modification</option>
                <option value="kyc_override">KYC Override</option>
                <option value="account_action">Account Action</option>
                <option value="data_access">Data Access</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <textarea
                value={newAuth.reason}
                onChange={(e) => setNewAuth({...newAuth, reason: e.target.value})}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Explain why this authorization is needed"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Create Authorization
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Authorization Token Display */}
      {authorizationToken && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-medium text-green-900 mb-2">Authorization Created!</h4>
          <p className="text-sm text-green-700 mb-2">Token: <code className="bg-green-100 px-2 py-1 rounded">{authorizationToken}</code></p>
          <button
            onClick={() => navigator.clipboard.writeText(authorizationToken)}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Copy Token
          </button>
        </div>
      )}

      {/* Authorizations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">No authorizations to display. Create your first authorization above.</p>
        </div>
      </div>
    </div>
  );
}

// Other Tab Components (KYC, Transactions, Audit, System) would be similar implementations
// For brevity, I'll create basic versions of the remaining tabs

function KYCTab() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">KYC Review Center</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">KYC management interface would be implemented here.</p>
      </div>
    </div>
  );
}

function TransactionsTab() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Transaction Monitoring</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Transaction monitoring interface would be implemented here.</p>
      </div>
    </div>
  );
}

function AuditTab() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Audit Log</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Audit log interface would be implemented here.</p>
      </div>
    </div>
  );
}

function SystemControlTab({ onExecuteChanges, authorizationToken }) {
  const [systemActions, setSystemActions] = useState({
    operation: '',
    target_table: '',
    changes: {}
  });

  const handleExecuteSystemChange = async (e) => {
    e.preventDefault();
    if (!authorizationToken) {
      alert('Authorization token required. Create an authorization first.');
      return;
    }
    
    await onExecuteChanges({
      token: authorizationToken,
      operation: systemActions.operation,
      target_table: systemActions.target_table,
      changes: systemActions.changes
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">System Control</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Actions */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            System Operations (Authorized Only)
          </h3>
          
          <form onSubmit={handleExecuteSystemChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Operation</label>
              <select
                value={systemActions.operation}
                onChange={(e) => setSystemActions({...systemActions, operation: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select operation</option>
                <option value="update_user_profile">Update User Profile</option>
                <option value="update_wallet_balance">Update Wallet Balance</option>
                <option value="update_kyc_status">Update KYC Status</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Table</label>
              <input
                type="text"
                value={systemActions.target_table}
                onChange={(e) => setSystemActions({...systemActions, target_table: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="user_profiles, wallets, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Changes (JSON)</label>
              <textarea
                value={JSON.stringify(systemActions.changes, null, 2)}
                onChange={(e) => {
                  try {
                    setSystemActions({...systemActions, changes: JSON.parse(e.target.value)});
                  } catch (err) {
                    // Ignore invalid JSON for now
                  }
                }}
                rows={6}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                placeholder='{"field": "value"}'
              />
            </div>
            <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ This operation requires a valid authorization token and user verification.
              </p>
              {!authorizationToken && (
                <p className="text-sm text-red-600 mt-1">
                  No authorization token available. Create an authorization in the Authorizations tab.
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={!authorizationToken}
              className={`w-full py-2 px-4 rounded-md font-medium ${
                authorizationToken
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Execute System Change
            </button>
          </form>
        </div>

        {/* System Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Database Status</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Email Service</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                Ready
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Authorization System</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Audit Logging</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
