import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../../lib/hooks/useUser';
import { adminAPI } from '../../../lib/services/adminAPI';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  PrinterIcon,
  PencilSquareIcon,
  XMarkIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserIcon,
  CreditCardIcon,
  LockClosedIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface RequestDetails {
  id: string;
  title: string;
  description: string;
  request_type: string;
  priority: string;
  status: string;
  requested_changes: Record<string, any>;
  admin_notes?: string;
  completion_notes?: string;
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
  updated_at: string;
}

interface AuthorizationDetails {
  status: string;
  expiration_time?: string;
  proposed_changes?: Record<string, any>;
  user_verified?: boolean;
  completed?: boolean;
  token?: string;
}

export default function RequestDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, userToken } = useUser();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [authorizationDetails, setAuthorizationDetails] = useState<AuthorizationDetails | null>(null);

  useEffect(() => {
    if (id && user && userToken) {
      fetchRequestDetails();
      fetchAuthorizationDetails();
      setTimeout(() => setAnimationPhase(1), 300);
      setTimeout(() => setAnimationPhase(2), 600);
      setTimeout(() => setAnimationPhase(3), 900);
    }
  }, [id, user, userToken]);

  const fetchRequestDetails = async () => {
    try {
      const response = await adminAPI.getUserRequestDetails(id, userToken);
      setRequest(response.data);
    } catch (error) {
      console.error('Failed to fetch request details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorizationDetails = async () => {
    try {
      const response = await adminAPI.getUserAuthorizationDetails(id, userToken);
      setAuthorizationDetails(response.data);
    } catch (error) {
      console.log('No authorization details found');
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
      case 'urgent': return 'text-red-700 bg-red-50 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getAuthorizationStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'verified': return 'text-green-700 bg-green-100 border-green-200';
      case 'completed': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'expired': return 'text-red-700 bg-red-100 border-red-200';
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
      other: { icon: InformationCircleIcon, name: 'General Assistance', color: 'text-gray-700', bgColor: 'bg-gray-50' }
    };
    return types[type] || types.other;
  };

  const formatChanges = (changes: Record<string, any>) => {
    if (!changes || Object.keys(changes).length === 0) return 'No specific changes requested';
    
    return Object.entries(changes).map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key.replace(/_/g, ' ').toUpperCase()}: ${value.join(', ')}`;
      }
      return `${key.replace(/_/g, ' ').toUpperCase()}: ${value}`;
    }).join(', ');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      await adminAPI.cancelUserRequest(id as string, userToken);
      alert('Request cancelled successfully');
      router.push('/user/request-status');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request');
    }
  };

  const handleResendAuthorization = async () => {
    try {
      await adminAPI.resendAuthorizationEmail(authorizationDetails?.token, userToken);
      alert('Authorization email sent successfully');
      fetchAuthorizationDetails();
    } catch (error) {
      console.error('Failed to resend authorization:', error);
      alert('Failed to resend authorization email');
    }
  };

  const getTimeline = () => {
    if (!request) return [];
    
    const timeline = [
      {
        label: 'Request Created',
        date: request.requested_at,
        status: 'completed',
        icon: PencilSquareIcon,
        description: 'Your request was successfully submitted to our admin team'
      }
    ];

    if (request.approved_at) {
      timeline.push({
        label: 'Request Approved',
        date: request.approved_at,
        status: 'completed',
        icon: CheckCircleIcon,
        description: 'Your request has been approved for processing'
      });
    }

    if (request.admin_notes) {
      timeline.push({
        label: 'Administrator Notes Added',
        date: request.updated_at,
        status: 'completed',
        icon: InformationCircleIcon,
        description: 'Our admin team has added notes to your request'
      });
    }

    if (request.completed_at) {
      timeline.push({
        label: 'Request Completed',
        date: request.completed_at,
        status: 'completed',
        icon: SparklesIcon,
        description: 'Your request has been successfully completed'
      });
    }

    return timeline;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-2">Loading Request Details</div>
          <div className="text-gray-600">Please wait while we fetch your request information...</div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-lg">
          <ExclamationTriangleIcon className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The request you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => router.push('/user/request-status')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  const timeline = getTimeline();
  const requestTypeInfo = getRequestTypeInfo(request.request_type);

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
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.push('/user/request-status')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors px-4 py-2 rounded-xl hover:bg-blue-50"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Requests
              </button>
              
              <div className="flex gap-3">
                {request.status === 'pending' && (
                  <button
                    onClick={handleCancelRequest}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Cancel Request
                  </button>
                )}
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl">
                  <requestTypeInfo.icon className="w-16 h-16 text-blue-600 mx-auto" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 mb-4 bg-clip-text text-transparent">
                Request Details
              </h1>
              <p className="text-gray-600 text-lg font-mono">
                #{request.id.slice(-8).toUpperCase()}
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-3 justify-center">
              <span className={`px-6 py-3 rounded-2xl font-bold text-sm border-2 ${getStatusColor(request.status)}`}>
                {request.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-6 py-3 rounded-2xl font-bold text-sm border-2 ${getPriorityColor(request.priority)}`}>
                {request.priority.toUpperCase()} PRIORITY
              </span>
              <span className="px-6 py-3 rounded-2xl font-bold text-sm bg-gray-100 text-gray-600 border-2 border-gray-200">
                {request.request_type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Request Information */}
            <div className="xl:col-span-3 space-y-8">
              {/* Basic Request Info */}
              <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-1000 delay-300 ${animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  Request Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Title</h3>
                    <p className="text-gray-600 bg-gray-50/50 p-4 rounded-2xl">{request.title}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Description</h3>
                    <div className="text-gray-600 bg-gray-50/50 p-6 rounded-2xl whitespace-pre-wrap leading-relaxed">
                      {request.description}
                    </div>
                  </div>

                  {/* Requested Changes */}
                  {request.requested_changes && Object.keys(request.requested_changes).length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 text-lg">Requested Changes</h3>
                      <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-100">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {formatChanges(request.requested_changes)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-6 text-lg flex items-center gap-3">
                      <ClockIcon className="w-6 h-6 text-purple-600" />
                      Request Timeline
                    </h3>
                    <div className="space-y-4">
                      {timeline.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <div key={index} className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-lg">{item.label}</div>
                              <div className="text-gray-600 mb-1">{item.description}</div>
                              <div className="text-sm text-gray-500">{getTimeAgo(item.date)}</div>
                            </div>
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrator Notes */}
              {request.admin_notes && (
                <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-1000 delay-500 ${animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    Administrator Notes
                  </h2>
                  <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 p-6 rounded-2xl border-l-4 border-blue-500">
                    <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">{request.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Completion Notes */}
              {request.completion_notes && (
                <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-1000 delay-600 ${animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <SparklesIcon className="w-6 h-6 text-green-600" />
                    </div>
                    Completion Notes
                  </h2>
                  <div className="bg-gradient-to-br from-green-50/80 to-green-100/80 p-6 rounded-2xl border-l-4 border-green-500">
                    <p className="text-green-800 whitespace-pre-wrap leading-relaxed">{request.completion_notes}</p>
                  </div>
                </div>
              )}

              {/* Authorization Details */}
              {authorizationDetails && (
                <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-1000 delay-700 ${animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    Authorization Details
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">Status:</span>
                      <span className={`px-4 py-2 rounded-2xl font-bold text-sm border-2 ${getAuthorizationStatusColor(authorizationDetails.status)}`}>
                        {authorizationDetails.status.toUpperCase()}
                      </span>
                    </div>

                    {authorizationDetails.expiration_time && (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">Expires:</span>
                        <span className="text-gray-600 font-mono">
                          {new Date(authorizationDetails.expiration_time).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {authorizationDetails.proposed_changes && (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3">Proposed Changes:</h3>
                        <div className="bg-gradient-to-br from-gray-50/80 to-white/80 p-4 rounded-2xl border border-gray-200">
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                            {JSON.stringify(authorizationDetails.proposed_changes, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Authorization Status Messages */}
                    {authorizationDetails.status === 'sent' && !authorizationDetails.user_verified && (
                      <div className="bg-gradient-to-br from-yellow-50/80 to-yellow-100/80 p-6 rounded-2xl border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-800 font-bold mb-2">📧 Authorization Email Sent</p>
                            <p className="text-yellow-600 text-sm">Check your email to approve these changes</p>
                          </div>
                          <button
                            onClick={handleResendAuthorization}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-700 transition-colors flex items-center gap-2"
                          >
                            <EnvelopeIcon className="w-4 h-4" />
                            Resend Email
                          </button>
                        </div>
                      </div>
                    )}

                    {authorizationDetails.user_verified && !authorizationDetails.completed && (
                      <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 p-6 rounded-2xl border border-blue-200">
                        <div className="flex items-center gap-3">
                          <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                          <div>
                            <p className="text-blue-800 font-bold">✅ Authorization Verified</p>
                            <p className="text-blue-600 text-sm">Administrator will process your changes shortly</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {authorizationDetails.completed && (
                      <div className="bg-gradient-to-br from-green-50/80 to-green-100/80 p-6 rounded-2xl border border-green-200">
                        <div className="flex items-center gap-3">
                          <SparklesIcon className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="text-green-800 font-bold">🎉 Changes Completed</p>
                            <p className="text-green-600 text-sm">All requested changes have been applied</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 transform transition-all duration-1000 delay-400 ${animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/user/request-admin-help')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Create New Request
                  </button>
                  
                  {request.status === 'pending' && (
                    <button
                      onClick={handleCancelRequest}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Cancel Request
                    </button>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                  >
                    <PrinterIcon className="w-5 h-5" />
                    Print Details
                  </button>
                </div>
              </div>

              {/* Request Metadata */}
              <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 transform transition-all duration-1000 delay-500 ${animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Request Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Request ID:</span>
                    <span className="font-mono text-gray-900 font-bold">#{request.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Created:</span>
                    <span className="text-gray-900 font-bold">{getTimeAgo(request.requested_at)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Type:</span>
                    <span className="text-gray-900 font-bold">{request.request_type.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Priority:</span>
                    <span className="text-gray-900 font-bold">{request.priority.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className="text-gray-900 font-bold">{request.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  {request.approved_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Approved:</span>
                      <span className="text-gray-900 font-bold">{getTimeAgo(request.approved_at)}</span>
                    </div>
                  )}
                  {request.completed_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Completed:</span>
                      <span className="text-gray-900 font-bold">{getTimeAgo(request.completed_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Support */}
              <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 transform transition-all duration-1000 delay-600 ${animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Need Help?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  If you have questions about this request, contact our support team.
                </p>
                <button
                  onClick={() => router.push('/user/contact-support')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  💬 Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}