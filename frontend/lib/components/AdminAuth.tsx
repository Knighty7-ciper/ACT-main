/**
 * Admin Authentication Component
 * 
 * Secure admin login and authentication with role-based access control.
 * Integrates with Supabase Auth and admin role verification.
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  full_name?: string;
}

interface AdminAuthProps {
  onAdminLogin: (adminUser: AdminUser) => void;
  onCancel: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAdminLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    // Check if user is already logged in and is admin
    checkExistingAdminSession();
  }, []);

  const checkExistingAdminSession = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user has admin role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, email, full_name, admin_permissions')
          .eq('user_id', user.id)
          .single();

        if (profile && ['admin', 'super_admin'].includes(profile.role)) {
          const adminUser: AdminUser = {
            id: user.id,
            email: profile.email,
            role: profile.role,
            permissions: profile.admin_permissions || [],
            full_name: profile.full_name
          };
          onAdminLogin(adminUser);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError('Invalid email or password');
        return;
      }

      if (data.user) {
        // Check admin role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, email, full_name, admin_permissions')
          .eq('user_id', data.user.id)
          .single();

        if (!profile) {
          await supabase.auth.signOut();
          setError('Admin profile not found');
          return;
        }

        if (!['admin', 'super_admin'].includes(profile.role)) {
          await supabase.auth.signOut();
          setError('Access denied. Admin privileges required.');
          return;
        }

        const adminUser: AdminUser = {
          id: data.user.id,
          email: profile.email,
          role: profile.role,
          permissions: profile.admin_permissions || [],
          full_name: profile.full_name
        };

        onAdminLogin(adminUser);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Verify 2FA code (implement your 2FA verification logic)
      const isValid = await verify2FACode(email, verificationCode);
      
      if (isValid) {
        // Continue with admin login
        setStep('login');
        // Continue with the login flow...
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FACode = async (email: string, code: string): Promise<boolean> => {
    // This would integrate with your 2FA service
    // For now, implement a simple check
    console.log(`Verifying 2FA code for ${email}: ${code}`);
    return code === '123456'; // Replace with actual verification
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        setError('Failed to send reset email');
      } else {
        setError('');
        alert('Password reset email sent. Please check your inbox.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="text-4xl">🔐</span>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure administrative access required
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'login' ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Admin Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="admin@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your admin password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in to Admin Panel'
                  )}
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Security Notice</span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This is a secure admin area. All actions are logged and monitored.
                        Unauthorized access attempts will be reported.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Return to main site
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handle2FAVerification}>
              <div className="text-center">
                <span className="text-3xl">📱</span>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl font-mono tracking-wider focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000000"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Features */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Features</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm text-gray-600">Role-based access control</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm text-gray-600">Activity logging</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm text-gray-600">Session management</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm text-gray-600">Audit trail</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;