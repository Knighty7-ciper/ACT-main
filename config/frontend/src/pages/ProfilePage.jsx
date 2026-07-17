import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Wallet, 
  History, 
  Settings, 
  LogOut, 
  Edit3, 
  Save, 
  X,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  RefreshCw,
  CreditCard,
  DollarSign,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, wallets, transactions, loading, isAuthenticated, logout, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Initialize edited profile when profile data loads
  useEffect(() => {
    if (profile) {
      setEditedProfile({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        city: profile.city || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSavingProfile(true);
    setProfileMessage(null);
    
    try {
      const result = await updateProfile(editedProfile);
      
      if (result.success) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditingProfile(false);
      } else {
        setProfileMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };
    
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'send':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'receive':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'swap':
        return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
      case 'buy':
      case 'deposit':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'sell':
      case 'withdrawal':
        return <DollarSign className="w-4 h-4 text-red-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: X }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'PESA') => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(amount) + ' ' + currency;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Pesa-Afrik</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {profile?.full_name || profile?.username || user?.email?.split('@')[0]}
          </h1>
          <p className="text-slate-600 mt-1">Manage your profile, wallets, and transactions</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'wallets', label: 'Wallets', icon: Wallet },
            { id: 'transactions', label: 'Transactions', icon: History },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
                
                {profileMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    profileMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {profileMessage.text}
                  </div>
                )}

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editedProfile.full_name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={editedProfile.country}
                        onChange={(e) => setEditedProfile({ ...editedProfile, country: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={editedProfile.city}
                        onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                      <textarea
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {savingProfile ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileMessage(null);
                          setEditedProfile({
                            full_name: profile?.full_name || '',
                            phone: profile?.phone || '',
                            country: profile?.country || '',
                            city: profile?.city || '',
                            bio: profile?.bio || ''
                          });
                        }}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{profile?.full_name || 'Not set'}</p>
                        <p className="text-sm text-slate-500">{profile?.email}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Phone</span>
                        <span className="text-slate-900">{profile?.phone || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Country</span>
                        <span className="text-slate-900">{profile?.country || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">City</span>
                        <span className="text-slate-900">{profile?.city || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Verified</span>
                        <span className={profile?.is_verified ? 'text-green-600' : 'text-slate-500'}>
                          {profile?.is_verified ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet Summary */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Total Balance</h2>
                  <Wallet className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-4">
                  {formatCurrency(totalBalance)}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Active Wallets</span>
                    <span className="text-slate-900 font-medium">{wallets.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Transactions</span>
                    <span className="text-slate-900 font-medium">{transactions.length}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('wallets')}
                  className="mt-4 w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium text-sm"
                >
                  View Wallets
                </button>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                  <History className="w-5 h-5 text-slate-400" />
                </div>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(tx.transaction_type)}
                          <div>
                            <p className="text-sm font-medium text-slate-900 capitalize">{tx.transaction_type}</p>
                            <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            tx.transaction_type === 'send' || tx.transaction_type === 'withdrawal' || tx.transaction_type === 'sell'
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {tx.transaction_type === 'send' || tx.transaction_type === 'withdrawal' || tx.transaction_type === 'sell' ? '-' : '+'}
                            {formatCurrency(tx.amount, tx.currency)}
                          </p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No transactions yet</p>
                  </div>
                )}
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="mt-4 w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium text-sm"
                >
                  View All Transactions
                </button>
              </div>
            </div>
          )}

          {/* Wallets Tab */}
          {activeTab === 'wallets' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Your Wallets</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium text-sm">
                  <Wallet className="w-4 h-4" />
                  Add Wallet
                </button>
              </div>
              
              {wallets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wallets.map((wallet) => (
                    <div key={wallet.id} className="border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <span className="text-emerald-600 font-bold">
                              {wallet.wallet_type === 'pesa-afrik' ? 'PESA' : wallet.wallet_type.substring(0, 3).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{wallet.wallet_name || 'Wallet'}</p>
                            <p className="text-xs text-slate-500 capitalize">{wallet.wallet_type}</p>
                          </div>
                        </div>
                        {wallet.is_primary && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="mb-3">
                        <p className="text-2xl font-bold text-slate-900">
                          {formatCurrency(wallet.balance, wallet.currency_code || 'PESA')}
                        </p>
                      </div>
                      {wallet.wallet_address && (
                        <div className="flex items-center gap-2 mb-3">
                          <code className="flex-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded truncate">
                            {wallet.wallet_address.substring(0, 10)}...{wallet.wallet_address.substring(wallet.wallet_address.length - 8)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(wallet.wallet_address)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 text-sm font-medium">
                          Send
                        </button>
                        <button className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 text-sm font-medium">
                          Receive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No wallets yet</h3>
                  <p className="text-slate-500 mb-4">Create your first wallet to start transacting</p>
                  <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
                    Create Wallet
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Transaction History</h2>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Fee</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.transaction_type)}
                              <span className="font-medium text-slate-900 capitalize">{tx.transaction_type}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 font-medium ${
                            tx.transaction_type === 'send' || tx.transaction_type === 'withdrawal' || tx.transaction_type === 'sell'
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {tx.transaction_type === 'send' || tx.transaction_type === 'withdrawal' || tx.transaction_type === 'sell' ? '-' : '+'}
                            {formatCurrency(tx.amount, tx.currency)}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {tx.fee > 0 ? formatCurrency(tx.fee, tx.currency) : '-'}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(tx.status)}
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-sm">
                            {formatDate(tx.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            {tx.tx_hash ? (
                              <div className="flex items-center gap-1">
                                <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                  {tx.tx_hash.substring(0, 8)}...
                                </code>
                                <button className="p-1 text-slate-400 hover:text-slate-600">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No transactions yet</h3>
                  <p className="text-slate-500 mb-4">Your transaction history will appear here</p>
                  <Link 
                    to="/swap" 
                    className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium"
                  >
                    Start Trading
                    <ArrowRightLeft className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Settings */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Security</h2>
                </div>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-slate-400" />
                      <div className="text-left">
                        <p className="font-medium text-slate-900">Change Password</p>
                        <p className="text-sm text-slate-500">Update your account password</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-400" />
                      <div className="text-left">
                        <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-500">Add extra security to your account</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                      Enable
                    </span>
                  </button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Email Notifications</p>
                      <p className="text-sm text-slate-500">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Transaction Alerts</p>
                      <p className="text-sm text-slate-500">Get notified for every transaction</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
                    Export Data
                  </button>
                  <button className="px-6 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Missing import
const Bell = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const Key = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default ProfilePage;
