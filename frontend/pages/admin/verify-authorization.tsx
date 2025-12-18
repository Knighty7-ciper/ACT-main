import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, XCircle, Shield, Clock, Key, Mail, User } from 'lucide-react';

export default function VerifyAuthorization() {
  const router = useRouter();
  const { token } = router.query;
  
  const [verificationState, setVerificationState] = useState({
    loading: true,
    verifying: false,
    verified: false,
    expired: false,
    error: null,
    authorizationData: null
  });

  useEffect(() => {
    if (token) {
      loadAuthorizationDetails();
    }
  }, [token]);

  const loadAuthorizationDetails = async () => {
    try {
      // Load authorization details from API
      const response = await fetch(`/api/admin/authorization-details?token=${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setVerificationState(prev => ({
          ...prev,
          loading: false,
          authorizationData: data.data
        }));
      } else {
        setVerificationState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Authorization not found'
        }));
      }
    } catch (error) {
      console.error('Failed to load authorization details:', error);
      setVerificationState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load authorization details'
      }));
    }
  };

  const handleVerifyAuthorization = async () => {
    setVerificationState(prev => ({ ...prev, verifying: true, error: null }));
    
    try {
      const response = await fetch('/api/admin/verify-authorization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVerificationState(prev => ({
          ...prev,
          verifying: false,
          verified: true
        }));
      } else {
        setVerificationState(prev => ({
          ...prev,
          verifying: false,
          error: data.error || 'Authorization verification failed'
        }));
      }
    } catch (error) {
      console.error('Authorization verification error:', error);
      setVerificationState(prev => ({
        ...prev,
        verifying: false,
        error: 'Failed to verify authorization'
      }));
    }
  };

  const handleRejectAuthorization = async () => {
    setVerificationState(prev => ({ ...prev, verifying: true, error: null }));
    
    try {
      const response = await fetch('/api/admin/reject-authorization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVerificationState(prev => ({
          ...prev,
          verifying: false,
          error: 'Authorization rejected by user'
        }));
      } else {
        setVerificationState(prev => ({
          ...prev,
          verifying: false,
          error: data.error || 'Failed to reject authorization'
        }));
      }
    } catch (error) {
      console.error('Authorization rejection error:', error);
      setVerificationState(prev => ({
        ...prev,
        verifying: false,
        error: 'Failed to reject authorization'
      }));
    }
  };

  if (verificationState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Authorization</h2>
            <p className="text-gray-600">Please wait while we verify your request...</p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationState.error && !verificationState.verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authorization Failed</h2>
            <p className="text-gray-600 mb-4">{verificationState.error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (verificationState.verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authorization Successful!</h2>
            <p className="text-gray-600 mb-4">
              You have successfully authorized the admin action. The changes will be applied shortly.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                ✅ Your authorization has been recorded and the admin can now proceed with the requested changes.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const authData = verificationState.authorizationData;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Authorization Required</h1>
          <p className="text-gray-600">
            An administrator has requested permission to make changes to your account
          </p>
        </div>

        {/* Authorization Details */}
        {authData && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Authorization Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Request Title</p>
                  <p className="text-sm text-gray-600">{authData.request_title}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Key className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Action Type</p>
                  <p className="text-sm text-gray-600">{authData.authorization_type?.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Expires</p>
                  <p className="text-sm text-gray-600">
                    {new Date(authData.token_expires_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Administrator</p>
                  <p className="text-sm text-gray-600">{authData.admin_email || 'System Administrator'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Requested Changes</p>
              <div className="bg-white border border-gray-200 rounded p-3">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(authData.proposed_changes, null, 2)}
                </pre>
              </div>
            </div>
            
            {authData.reason && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Reason for Request</p>
                <p className="text-sm text-gray-600">{authData.reason}</p>
              </div>
            )}
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Security Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Only authorize this request if you have explicitly requested help from our 
                  administrator. The admin will be able to make the changes listed above after 
                  your authorization. This authorization link expires in 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleVerifyAuthorization}
            disabled={verificationState.verifying}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {verificationState.verifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Authorize Changes
              </>
            )}
          </button>
          
          <button
            onClick={handleRejectAuthorization}
            disabled={verificationState.verifying}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {verificationState.verifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 mr-2" />
                Decline Request
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            If you have any questions about this authorization request, please contact our support team immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
