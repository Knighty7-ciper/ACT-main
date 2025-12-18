import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../lib/hooks/useUser';
import { adminAPI } from '../../lib/services/adminAPI';
import { 
  CogIcon, 
  DocumentTextIcon, 
  UserIcon, 
  CreditCardIcon, 
  LockClosedIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface RequestType {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  bgColor: string;
}

interface FormData {
  request_type: string;
  title: string;
  description: string;
  requested_changes: Record<string, any>;
  priority: string;
}

export default function RequestAdminHelp() {
  const router = useRouter();
  const { user, userToken } = useUser();
  const [loading, setLoading] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    request_type: '',
    title: '',
    description: '',
    requested_changes: {},
    priority: 'medium'
  });

  const requestTypes: RequestType[] = [
    { 
      value: 'profile_edit', 
      label: 'Profile Information Update', 
      icon: UserIcon, 
      description: 'Update your personal information and account details',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    { 
      value: 'kyc_assistance', 
      label: 'KYC Document Issues', 
      icon: DocumentTextIcon, 
      description: 'Help with identity verification and document submission',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50'
    },
    { 
      value: 'transaction_review', 
      label: 'Transaction Questions', 
      icon: CreditCardIcon, 
      description: 'Resolve payment issues, token problems, or transaction inquiries',
      color: 'text-green-700',
      bgColor: 'bg-green-50'
    },
    { 
      value: 'account_issue', 
      label: 'Account Access Issues', 
      icon: LockClosedIcon, 
      description: 'Login problems, account security, or access restrictions',
      color: 'text-red-700',
      bgColor: 'bg-red-50'
    },
    { 
      value: 'data_export', 
      label: 'Data Export Request', 
      icon: ArrowPathIcon, 
      description: 'Export your personal data in various formats',
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50'
    },
    { 
      value: 'other', 
      label: 'Other Assistance', 
      icon: InformationCircleIcon, 
      description: 'General inquiries or other support needs',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50'
    }
  ];

  useEffect(() => {
    if (user && userToken) {
      fetchRecentRequests();
      setTimeout(() => setAnimationPhase(1), 300);
      setTimeout(() => setAnimationPhase(2), 600);
    }
  }, [user, userToken]);

  const fetchRecentRequests = async () => {
    try {
      const response = await adminAPI.getUserRequests(userToken);
      setRecentRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch recent requests:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRequestTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      request_type: type,
      title: '',
      description: '',
      requested_changes: {}
    }));
  };

  const generateDynamicFields = () => {
    const { request_type } = formData;
    
    switch (request_type) {
      case 'profile_edit':
        return [
          { name: 'full_name', label: 'New Full Name', type: 'text', placeholder: 'Enter your full name' },
          { name: 'phone', label: 'New Phone Number', type: 'tel', placeholder: '+1234567890' },
          { name: 'date_of_birth', label: 'New Date of Birth', type: 'date' },
          { name: 'country_code', label: 'New Country', type: 'text', placeholder: 'Country code (e.g., US)' },
          { name: 'city', label: 'New City', type: 'text', placeholder: 'City name' }
        ];
      case 'kyc_assistance':
        return [
          { name: 'document_type', label: 'Document Type', type: 'select', 
            options: [
              { value: 'passport', label: 'Passport' },
              { value: 'national_id', label: 'National ID' },
              { value: 'drivers_license', label: 'Driver\'s License' },
              { value: 'utility_bill', label: 'Utility Bill' }
            ]
          },
          { name: 'issue_description', label: 'Issue Description', type: 'textarea', 
            placeholder: 'Describe the specific issue you are experiencing' }
        ];
      case 'transaction_review':
        return [
          { name: 'transaction_id', label: 'Transaction ID', type: 'text', placeholder: 'Enter transaction ID' },
          { name: 'issue_type', label: 'Issue Type', type: 'select',
            options: [
              { value: 'failed_payment', label: 'Failed Payment' },
              { value: 'missing_tokens', label: 'Missing Tokens' },
              { value: 'incorrect_amount', label: 'Incorrect Amount' },
              { value: 'refund_needed', label: 'Refund Needed' }
            ]
          },
          { name: 'transaction_date', label: 'Transaction Date', type: 'date' }
        ];
      case 'account_issue':
        return [
          { name: 'issue_category', label: 'Issue Category', type: 'select',
            options: [
              { value: 'login_problem', label: 'Login Problem' },
              { value: 'wallet_access', label: 'Wallet Access' },
              { value: 'account_locked', label: 'Account Locked' },
              { value: 'email_change_needed', label: 'Email Change Needed' }
            ]
          },
          { name: 'last_successful_login', label: 'Last Successful Login', type: 'datetime-local' }
        ];
      case 'data_export':
        return [
          { name: 'data_types', label: 'Data to Export', type: 'checkbox',
            options: [
              { value: 'profile_data', label: 'Profile Data' },
              { value: 'transaction_history', label: 'Transaction History' },
              { value: 'wallet_balances', label: 'Wallet Balances' },
              { value: 'kyc_documents', label: 'KYC Documents' }
            ]
          },
          { name: 'export_format', label: 'Preferred Format', type: 'select',
            options: [
              { value: 'json', label: 'JSON' },
              { value: 'csv', label: 'CSV' },
              { value: 'pdf', label: 'PDF' }
            ]
          }
        ];
      default:
        return [];
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      requested_changes: {
        ...prev.requested_changes,
        [fieldName]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.request_type || !formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await adminAPI.createUserRequest({
        ...formData,
        user_id: user.id
      }, userToken);

      if (response.success) {
        router.push(`/user/request-success?requestId=${response.data.requestId}&type=${formData.request_type}`);
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('❌ Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-100/20 to-blue-100/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative p-4 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 transform transition-all duration-1000 ${animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <CogIcon className="w-20 h-20 text-blue-600 mx-auto animate-spin-slow" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 mb-4 bg-clip-text text-transparent">
                Admin Assistance Request Center
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Get personalized help from our expert support team for any account issues, 
                document problems, or data requests. We're here to ensure your experience is seamless.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Requests', count: recentRequests.length, color: 'text-blue-600', bgColor: 'bg-blue-50' },
                { label: 'Active Requests', count: recentRequests.filter(r => ['pending', 'approved', 'in_progress'].includes(r.status)).length, color: 'text-purple-600', bgColor: 'bg-purple-50' },
                { label: 'Completed', count: recentRequests.filter(r => r.status === 'completed').length, color: 'text-green-600', bgColor: 'bg-green-50' }
              ].map((stat, index) => (
                <div key={stat.label} className={`${stat.bgColor} p-6 rounded-2xl text-center border border-white/50 shadow-lg transform transition-all duration-500 hover:scale-105`}>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.count}</div>
                  <div className="text-sm font-semibold text-gray-700">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Form */}
          <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 transform transition-all duration-1000 delay-300 ${animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Request</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Request Type Selection */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  What type of assistance do you need?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requestTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = formData.request_type === type.value;
                    
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleRequestTypeChange(type.value)}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white/80'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${isSelected ? 'bg-blue-100' : type.bgColor} transition-colors`}>
                            <IconComponent className={`w-6 h-6 ${isSelected ? 'text-blue-600' : type.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 mb-2">{type.label}</div>
                            <div className="text-sm text-gray-600 leading-relaxed">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.request_type && (
                <>
                  {/* Title */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Request Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                      placeholder="Brief description of your request"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Detailed Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg resize-none"
                      placeholder="Please provide detailed information about your request, including any relevant context or previous attempts to resolve the issue"
                      required
                    />
                  </div>

                  {/* Dynamic Fields Based on Request Type */}
                  {generateDynamicFields().map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="block text-lg font-bold text-gray-900">
                        {field.label}
                      </label>
                      
                      {field.type === 'select' && (
                        <select
                          value={formData.requested_changes[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                        >
                          <option value="">Select {field.label}</option>
                          {(field.options as any[])?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === 'checkbox' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50/50 rounded-2xl border border-gray-200">
                          {(field.options as any[])?.map((option) => (
                            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(formData.requested_changes[field.name] || []).includes(option.value)}
                                onChange={(e) => {
                                  const currentValues = formData.requested_changes[field.name] || [];
                                  const newValues = e.target.checked
                                    ? [...currentValues, option.value]
                                    : currentValues.filter(v => v !== option.value);
                                  handleFieldChange(field.name, newValues);
                                }}
                                className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700 font-medium">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {(field.type === 'text' || field.type === 'tel' || field.type === 'date' || field.type === 'datetime-local') && (
                        <input
                          type={field.type}
                          value={formData.requested_changes[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                          placeholder={(field as any).placeholder}
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          value={formData.requested_changes[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          rows={3}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg resize-none"
                          placeholder={(field as any).placeholder}
                        />
                      )}
                    </div>
                  ))}

                  {/* Priority */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    >
                      <option value="low">🟢 Low - General inquiry</option>
                      <option value="medium">🟡 Medium - Standard request</option>
                      <option value="high">🟠 High - Urgent attention needed</option>
                      <option value="urgent">🔴 Urgent - Critical issue</option>
                    </select>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading || !formData.request_type}
                  className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    loading || !formData.request_type
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Submitting Request...
                    </div>
                  ) : (
                    '🛠️ Submit Request'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/user/dashboard')}
                  className="px-8 py-4 border-2 border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Recent Requests */}
          {recentRequests.length > 0 && (
            <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-1000 delay-600 ${animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-2xl">
                    <ArrowPathIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Recent Requests</h2>
                </div>
                <button
                  onClick={() => router.push('/user/request-status')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  View All →
                </button>
              </div>
              
              <div className="space-y-6">
                {recentRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{request.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{request.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold border ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-4 py-2 rounded-full text-xs font-bold border ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200/50">
                      <div className="flex items-center gap-4">
                        <span>📅 {new Date(request.requested_at).toLocaleDateString()}</span>
                        <span>🔢 {request.request_type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className="text-xs font-mono text-gray-400">
                        #{request.id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}