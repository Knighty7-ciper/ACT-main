import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../lib/hooks/useUser';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  DocumentTextIcon,
  UserIcon,
  CreditCardIcon,
  LockClosedIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function RequestSuccess() {
  const router = useRouter();
  const { user } = useUser();
  const [countdown, setCountdown] = useState(6);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [requestDetails, setRequestDetails] = useState<{
    requestId: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    // Get request details from query parameters
    if (router.query.requestId || router.query.type) {
      setRequestDetails({
        requestId: router.query.requestId as string,
        type: router.query.type as string
      });
    }

    // Animation sequence
    const animationTimer = setTimeout(() => setAnimationPhase(1), 500);
    const animationTimer2 = setTimeout(() => setAnimationPhase(2), 1000);
    const animationTimer3 = setTimeout(() => setAnimationPhase(3), 1500);

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/user/request-status');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(animationTimer);
      clearTimeout(animationTimer2);
      clearTimeout(animationTimer3);
    };
  }, [router]);

  const handleGoToRequests = () => {
    router.push('/user/request-status');
  };

  const handleGoToDashboard = () => {
    router.push('/user/dashboard');
  };

  const handleCreateAnother = () => {
    router.push('/user/request-admin-help');
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

  const requestTypeInfo = requestDetails ? getRequestTypeInfo(requestDetails.type) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-green-100/30 to-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-100/30 to-green-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        {/* Floating Success Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Main Success Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-3xl w-full p-8 transform transition-all duration-1000 hover:shadow-3xl">
          {/* Success Animation Section */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              {/* Main Success Icon Animation */}
              <div className={`transition-all duration-1000 transform ${animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <div className="relative">
                  <CheckCircleIcon className="w-28 h-28 text-green-500 mx-auto animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-30 animate-ping"></div>
                </div>
              </div>
              
              {/* Sparkle Celebrations */}
              <div className={`absolute -top-4 -right-4 transition-all duration-1000 delay-500 ${animationPhase >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <SparklesIcon className="w-10 h-10 text-yellow-400 animate-spin" />
              </div>
              <div className={`absolute -bottom-2 -left-4 transition-all duration-1000 delay-700 ${animationPhase >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <SparklesIcon className="w-8 h-8 text-blue-400 animate-bounce" />
              </div>
              <div className={`absolute top-1/2 -left-6 transition-all duration-1000 delay-900 ${animationPhase >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <SparklesIcon className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 mb-4 bg-clip-text text-transparent">
              Request Submitted Successfully! 🎉
            </h1>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              Your admin assistance request has been received by our specialized team. 
              We're committed to providing you with the best possible resolution.
            </p>
            
            {requestDetails && (
              <div className={`inline-flex items-center gap-4 ${requestTypeInfo?.bgColor} px-6 py-4 rounded-2xl mb-6 border border-white/50 shadow-lg transform transition-all duration-500 hover:scale-105`}>
                {requestTypeInfo && (
                  <div className="p-3 bg-white/60 rounded-xl">
                    <requestTypeInfo.icon className={`w-8 h-8 ${requestTypeInfo.color}`} />
                  </div>
                )}
                <div className="text-left">
                  <p className="font-bold text-lg">{requestTypeInfo?.name}</p>
                  {requestDetails.requestId && (
                    <div className="flex items-center gap-2 mt-1">
                      <ClockIcon className="w-4 h-4" />
                      <p className="text-sm font-mono font-semibold">
                        Request #{requestDetails.requestId.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Process Timeline */}
          <div className="bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-8 rounded-2xl mb-8 border border-white/50 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Happens Next?</h2>
            
            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: 'Request Processing',
                  description: 'Your request is immediately reviewed by our admin team and assigned to the appropriate specialist',
                  time: '< 2 hours',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  step: 2,
                  title: 'Authorization Review',
                  description: 'If changes to your account are required, we\'ll send you an email for secure approval',
                  time: '2-24 hours',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  step: 3,
                  title: 'Implementation',
                  description: 'Approved changes are implemented with full audit logging and security verification',
                  time: '1-72 hours',
                  color: 'from-green-500 to-green-600'
                },
                {
                  step: 4,
                  title: 'Completion & Notification',
                  description: 'Request is marked complete with detailed summary and next steps provided',
                  time: 'Immediate',
                  color: 'from-emerald-500 to-emerald-600'
                }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 group">
                  <div className={`bg-gradient-to-r ${item.color} text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                      <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Response Times */}
          <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm p-6 rounded-2xl mb-8 border border-white/50">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <ClockIcon className="w-6 h-6 text-blue-600" />
              Expected Response Times by Priority
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { priority: 'Urgent', time: '2-4 hours', color: 'text-red-600 bg-red-50', bgColor: 'bg-red-500' },
                { priority: 'High', time: 'Within 24h', color: 'text-orange-600 bg-orange-50', bgColor: 'bg-orange-500' },
                { priority: 'Medium', time: '2-3 days', color: 'text-yellow-600 bg-yellow-50', bgColor: 'bg-yellow-500' },
                { priority: 'Low', time: '5-7 days', color: 'text-green-600 bg-green-50', bgColor: 'bg-green-500' }
              ].map((item) => (
                <div key={item.priority} className={`${item.color} p-4 rounded-xl text-center border border-white/50 hover:scale-105 transition-transform duration-300 shadow-md`}>
                  <div className={`w-3 h-3 ${item.bgColor} rounded-full mx-auto mb-2 animate-pulse`}></div>
                  <div className="font-bold text-sm">{item.priority}</div>
                  <div className="text-xs opacity-80">{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleGoToRequests}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <CheckCircleIcon className="w-6 h-6" />
              Track Your Request Status
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGoToDashboard}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🏠 Dashboard
              </button>
              
              <button
                onClick={handleCreateAnother}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ➕ New Request
              </button>
            </div>
          </div>

          {/* Auto-redirect Progress */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-4 mb-8 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Auto-redirecting to request status</span>
              <span className="text-sm font-bold text-blue-600">{countdown}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((6 - countdown) / 6) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Support Options */}
          <div className="border-t border-gray-200/50 pt-8">
            <h3 className="font-bold text-gray-900 mb-6 text-center text-xl">Need Additional Help?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  label: 'Live Chat Support', 
                  icon: '💬', 
                  action: () => window.open('/chat', '_blank'),
                  color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                },
                { 
                  label: 'Email Support', 
                  icon: '📧', 
                  action: () => window.open('mailto:support@act-main.com'),
                  color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
                },
                { 
                  label: 'Phone Support', 
                  icon: '📞', 
                  action: () => window.open('tel:+15551234567'),
                  color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                },
                { 
                  label: 'Contact Support Page', 
                  icon: '📋', 
                  action: () => router.push('/user/contact-support'),
                  color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className={`${item.color} py-4 px-6 rounded-2xl font-semibold border transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-left flex items-center gap-3`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-bold">{item.label}</div>
                    <div className="text-xs opacity-70">
                      {item.label === 'Live Chat Support' && 'Available 24/7'}
                      {item.label === 'Phone Support' && 'Call +1 (555) 123-4567'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information Footer */}
          <div className="mt-8 bg-gradient-to-r from-green-50/80 to-blue-50/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
            <div className="text-center">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                📞 Contact Information
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                For immediate assistance or urgent matters, reach out directly:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-center gap-3 bg-white/60 p-3 rounded-xl">
                  <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500">Email Support</div>
                    <div className="font-bold text-blue-600">support@act-main.com</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 bg-white/60 p-3 rounded-xl">
                  <PhoneIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-500">Phone Support</div>
                    <div className="font-bold text-green-600">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 bg-white/60 p-3 rounded-xl">
                  <ClockIcon className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-xs text-gray-500">Live Chat</div>
                    <div className="font-bold text-purple-600">Available 24/7</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}