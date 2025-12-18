import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../lib/hooks/useUser';
import { adminAPI } from '../../lib/services/adminAPI';
import { 
  BanknotesIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  UserIcon,
  CreditCardIcon,
  LockClosedIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  BookOpenIcon,
  PencilSquareIcon,
  PhoneIcon,
  ClockIcon,
  CurrencyEthIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  wallet_balance: number;
  token_balance: number;
  kyc_status: string;
  [key: string]: any;
}

interface RecentRequest {
  id: string;
  title: string;
  description: string;
  request_type: string;
  status: string;
  requested_at: string;
}

export default function EnhancedUserDashboard() {
  const router = useRouter();
  const { user, userToken } = useUser();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (user && userToken) {
      fetchDashboardData();
      fetchRecentRequests();
      setTimeout(() => setAnimationPhase(1), 300);
      setTimeout(() => setAnimationPhase(2), 600);
      setTimeout(() => setAnimationPhase(3), 900);
    }
  }, [user, userToken]);

  const fetchDashboardData = async () => {
    try {
      // Get user dashboard data
      const response = await fetch('/api/user/dashboard', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const response = await adminAPI.getUserRequests(userToken, { limit: 5 });
      setRecentRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch recent requests:', error);
    }
  };

  const handleCreateRequest = (type: string) => {
    router.push('/user/request-admin-help', { 
      query: { 
        type: type,
        prefill: true 
      } 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'approved': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'in_progress': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getRequestTypeInfo = (type: string) => {
    const types: Record<string, { icon: React.ComponentType<any>; name: string; color: string; bgColor: string }> = {
      profile_edit: { icon: UserIcon, name: 'Profile Update', color: 'text-blue-700', bgColor: 'bg-blue-50' },
      kyc_assistance: { icon: DocumentTextIcon, name: 'KYC Assistance', color: 'text-purple-700', bgColor: 'bg-purple-50' },
      transaction_review: { icon: CreditCardIcon, name: 'Transaction Review', color: 'text-green-700', bgColor: 'bg-green-50' },
      account_issue: { icon: LockClosedIcon, name: 'Account Issue', color: 'text-red-700', bgColor: 'bg-red-50' },
      data_export: { icon: ArrowPathIcon, name: 'Data Export', color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
      other: { icon: InformationCircleIcon, name: 'Other Assistance', color: 'text-gray-700', bgColor: 'bg-gray-50' }
    };
    return types[type] || types.other;
  };

  const quickActions = [
    {
      title: 'Update Profile',
      description: 'Change personal information',
      icon: UserIcon,
      type: 'profile_edit',
      color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'KYC Help',
      description: 'Document verification issues',
      icon: DocumentTextIcon,
      type: 'kyc_assistance',
      color: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Transaction Issues',
      description: 'Payment or token problems',
      icon: CreditCardIcon,
      type: 'transaction_review',
      color: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Account Access',
      description: 'Login or access problems',
      icon: LockClosedIcon,
      type: 'account_issue',
      color: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Export Data',
      description: 'Download your information',
      icon: ArrowPathIcon,
      type: 'data_export',
      color: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Other Help',
      description: 'General assistance needed',
      icon: InformationCircleIcon,
      type: 'other',
      color: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
      bgColor: 'bg-gray-50'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-2">Loading Your Dashboard</div>
          <div className="text-gray-600">Please wait while we fetch your information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-100/20 to-blue-100/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative p-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 transform transition-all duration-1000 ${animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl">
                  <SparklesIcon className="w-20 h-20 text-blue-600 mx-auto animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 mb-4 bg-clip-text text-transparent">
                Welcome back, {user?.full_name || 'User'}! 👋
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Need help? Our dedicated admin team is here to assist you with any issues or changes you need.
                Select a category below to get started.
              </p>
            </div>

            {/* User Stats */}
            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { 
                    title: 'Wallet Balance', 
                    value: `$${dashboardData.wallet_balance?.toFixed(2) || '0.00'}`, 
                    icon: BanknotesIcon, 
                    color: 'text-blue-600', 
                    bgColor: 'bg-blue-50',
                    gradient: 'from-blue-500 to-blue-600'
                  },
                  { 
                    title: 'ACT Tokens', 
                    value: dashboardData.token_balance || '0', 
                    icon: CurrencyEthIcon, 
                    color: 'text-purple-600', 
                    bgColor: 'bg-purple-50',
                    gradient: 'from-purple-500 to-purple-600'
                  },
                  { 
                    title: 'Support Requests', 
                    value: recentRequests.length, 
                    icon: DocumentTextIcon, 
                    color: 'text-green-600', 
                    bgColor: 'bg-green-50',
                    gradient: 'from-green-500 to-green-600'
                  },
                  { 
                    title: 'KYC Status', 
                    value: dashboardData.kyc_status || 'Not Verified', 
                    icon: CheckCircleIcon, 
                    color: 'text-orange-600', 
                    bgColor: 'bg-orange-50',
                    gradient: 'from-orange-500 to-orange-600'
                  }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={stat.title} className={`${stat.bgColor} p-6 rounded-2xl text-center border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.gradient} mb-4`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className={`text-2xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                      <div className="text-sm font-semibold text-gray-700">{stat.title}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Help Section */}
          <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 transform transition-all duration-1000 delay-300 ${animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <PencilSquareIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Quick Admin Assistance
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                Click on any category below to create a support request with our admin team
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.type}
                    onClick={() => handleCreateRequest(action.type)}
                    className={`bg-gradient-to-r ${action.color} text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-left group`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                        <p className="text-sm opacity-90 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/user/request-admin-help')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
              >
                📝 View All Request Options
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Recent Requests */}
            <div className="xl:col-span-2 space-y-8">
              <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-1000 delay-500 ${animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                      <DocumentTextIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Recent Requests</h2>
                  </div>
                  <button
                    onClick={() => router.push('/user/request-status')}
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors px-4 py-2 rounded-xl hover:bg-blue-50"
                  >
                    View All →
                  </button>
                </div>

                {recentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-6 bg-gray-50 rounded-3xl mb-6">
                      <DocumentTextIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No Support Requests Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      You haven't created any support requests. Get started by selecting a category above or creating your first request.
                    </p>
                    <button
                      onClick={() => router.push('/user/request-admin-help')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Create Your First Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentRequests.map((request) => {
                      const requestTypeInfo = getRequestTypeInfo(request.request_type);
                      const IconComponent = requestTypeInfo.icon;
                      
                      return (
                        <div
                          key={request.id}
                          className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                          onClick={() => router.push(`/user/request-details/${request.id}`)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{request.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{request.description}</p>
                              </div>
                            </div>
                            <span className={`px-4 py-2 rounded-2xl text-xs font-bold border-2 ${getStatusColor(request.status)}`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200/50">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4" />
                              <span>{new Date(request.requested_at).toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs font-mono text-gray-400">
                              #{request.id.slice(-8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Account Quick Info */}
            <div className="space-y-8">
              <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-1000 delay-600 ${animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  Account Information
                </h2>
                
                <div className="space-y-4 mb-8">
                  {[
                    { label: 'Full Name', value: user?.full_name || 'Not set' },
                    { label: 'Email', value: user?.email || 'Not set' },
                    { label: 'Phone', value: user?.phone || 'Not set' },
                    { label: 'Country', value: user?.country_code || 'Not set' },
                    { label: 'KYC Status', value: dashboardData?.kyc_status || 'Not Verified' },
                    { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown' }
                  ].map((item, index) => (
                    <div key={item.label} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className={`font-bold ${item.label === 'KYC Status' && dashboardData?.kyc_status === 'verified' ? 'text-green-600' : 'text-gray-900'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/user/profile')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                  >
                    <UserIcon className="w-5 h-5" />
                    👤 Edit Profile
                  </button>
                  
                  <button
                    onClick={() => router.push('/user/kyc')}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    📄 KYC Documents
                  </button>
                </div>
              </div>

              {/* Other Help Options */}
              <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-1000 delay-700 ${animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                    <PhoneIcon className="w-6 h-6 text-white" />
                  </div>
                  Other Ways to Get Help
                </h2>
                
                <div className="space-y-4">
                  {[
                    {
                      title: 'Live Chat',
                      description: 'Get instant help from our support team',
                      icon: ChatBubbleLeftRightIcon,
                      color: 'from-blue-500 to-blue-600',
                      action: () => window.open('/chat', '_blank')
                    },
                    {
                      title: 'Email Support',
                      description: 'Send us a detailed message',
                      icon: EnvelopeIcon,
                      color: 'from-green-500 to-green-600',
                      action: () => window.open('mailto:support@act-main.com')
                    },
                    {
                      title: 'Help Center',
                      description: 'Browse our knowledge base',
                      icon: BookOpenIcon,
                      color: 'from-purple-500 to-purple-600',
                      action: () => router.push('/user/help-center')
                    }
                  ].map((helpOption, index) => {
                    const IconComponent = helpOption.icon;
                    return (
                      <button
                        key={helpOption.title}
                        onClick={helpOption.action}
                        className={`w-full bg-gradient-to-r ${helpOption.color} text-white p-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-left flex items-center gap-4`}
                      >
                        <IconComponent className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <div className="font-bold">{helpOption.title}</div>
                          <div className="text-sm opacity-90">{helpOption.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}