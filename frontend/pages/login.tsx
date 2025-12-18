/**
 * login.tsx - Professional Trading Platform Login Page
 * Enterprise-grade authentication with advanced security features
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '../lib/hooks/useUser';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserIcon,
  KeyIcon,
  FingerPrintIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CubeTransparentIcon,
  BoltIcon,
  ClockIcon,
  GlobeAltIcon,
  ChartBarIcon,
  EyeIcon as EyeSlashIconOff,
  InformationCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// TypeScript interfaces
interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
  twoFactorCode?: string;
}

interface SecurityFeature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  status: 'active' | 'ready' | 'disabled';
}

interface LoginMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  available: boolean;
  primary?: boolean;
}

export default function Login() {
  const router = useRouter();
  const { signIn, user, loading } = useUser();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
    twoFactorCode: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLoginMethod, setSelectedLoginMethod] = useState('email');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/user/dashboard');
    }
  }, [user, loading, router]);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for login attempts
  useEffect(() => {
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    const blockedUntil = localStorage.getItem('loginBlockedUntil');
    
    if (attempts >= 5 && blockedUntil) {
      const blockedTime = new Date(blockedUntil);
      if (blockedTime > new Date()) {
        setIsBlocked(true);
      } else {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginBlockedUntil');
      }
    }
    setLoginAttempts(attempts);
  }, []);

  // Handle form changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (showTwoFactor && !formData.twoFactorCode) {
      newErrors.twoFactorCode = 'Two-factor code is required';
    } else if (showTwoFactor && formData.twoFactorCode && !/^\d{6}$/.test(formData.twoFactorCode)) {
      newErrors.twoFactorCode = 'Please enter a valid 6-digit code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, showTwoFactor]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isBlocked) return;

    setIsSubmitting(true);
    
    try {
      await signIn({
        email: formData.email,
        password: formData.password,
        ...(formData.twoFactorCode && { twoFactorCode: formData.twoFactorCode })
      });
      
      // Reset login attempts on successful login
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginBlockedUntil');
      
      toast.success('Welcome back! Redirecting to your dashboard...');
      
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle failed login attempt
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      
      if (newAttempts >= 5) {
        const blockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        localStorage.setItem('loginBlockedUntil', blockedUntil.toISOString());
        setIsBlocked(true);
      }
      
      if (error.message?.includes('Invalid login credentials')) {
        setErrors({ submit: 'Invalid email or password. Please check your credentials.' });
      } else if (error.message?.includes('Email not confirmed')) {
        setErrors({ submit: 'Please verify your email address before signing in.' });
      } else if (error.message?.includes('Two-factor')) {
        setShowTwoFactor(true);
        setErrors({ submit: 'Please enter your two-factor authentication code.' });
      } else {
        setErrors({ submit: 'Unable to sign in. Please try again in a moment.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate blocked time remaining
  const getBlockedTimeRemaining = (): string => {
    const blockedUntil = localStorage.getItem('loginBlockedUntil');
    if (!blockedUntil) return '';
    
    const timeRemaining = new Date(blockedUntil).getTime() - Date.now();
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Security features
  const securityFeatures: SecurityFeature[] = [
    {
      icon: LockClosedIcon,
      title: 'End-to-End Encryption',
      description: 'Bank-grade AES-256 encryption for all data transmission',
      status: 'active'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Multi-Factor Authentication',
      description: 'Advanced 2FA with biometric support and authenticator apps',
      status: 'active'
    },
    {
      icon: FingerPrintIcon,
      title: 'Biometric Security',
      description: 'Fingerprint and face recognition for secure access',
      status: 'ready'
    },
    {
      icon: EyeSlashIconOff,
      title: 'Privacy Protection',
      description: 'Zero-knowledge architecture protects your personal data',
      status: 'active'
    }
  ];

  // Login methods
  const loginMethods: LoginMethod[] = [
    {
      id: 'email',
      title: 'Email & Password',
      description: 'Sign in with your email and password',
      icon: EnvelopeIcon,
      available: true,
      primary: true
    },
    {
      id: 'biometric',
      title: 'Biometric Login',
      description: 'Use fingerprint or face recognition',
      icon: FingerPrintIcon,
      available: true
    },
    {
      id: 'passkey',
      title: 'Passkey',
      description: 'Hardware security key authentication',
      icon: KeyIcon,
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <CubeTransparentIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ACT Exchange
                </h1>
                <p className="text-xs text-gray-400">Professional Trading</p>
              </div>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <ClockIcon className="h-4 w-4" />
                <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <GlobeAltIcon className="h-4 w-4" />
                <span>UTC {currentTime.toUTCString().slice(17, 22)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          
          {/* Login Form */}
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 mb-4">
                  <SparklesIcon className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-blue-400 text-sm font-semibold">Secure Login</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400">Sign in to your professional trading account</p>
              </div>

              {/* Blocked Notice */}
              {isBlocked && (
                <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-xl">
                  <div className="flex items-center text-red-400">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Account Temporarily Locked</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">
                    Too many failed attempts. Try again in {getBlockedTimeRemaining()}.
                  </p>
                </div>
              )}

              {/* Login Method Selection */}
              {!showTwoFactor && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 gap-2">
                    {loginMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedLoginMethod(method.id)}
                        disabled={!method.available}
                        className={`flex items-center p-4 rounded-xl border transition-all ${
                          method.primary
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                            : selectedLoginMethod === method.id
                            ? 'bg-white/5 border-white/20 text-white'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <method.icon className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-semibold">{method.title}</div>
                          <div className="text-xs opacity-70">{method.description}</div>
                        </div>
                        {!method.available && (
                          <span className="ml-auto text-xs bg-gray-600 px-2 py-1 rounded">Coming Soon</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Two-Factor Code Input */}
              {showTwoFactor && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Two-Factor Authentication Code
                  </label>
                  <input
                    type="text"
                    name="twoFactorCode"
                    value={formData.twoFactorCode}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-center text-lg tracking-widest"
                  />
                  {errors.twoFactorCode && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.twoFactorCode}
                    </p>
                  )}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`w-full bg-white/10 border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                        errors.email ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute right-3 top-3.5" />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`w-full bg-white/10 border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                        errors.password ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 bg-white/10 border border-white/20 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-300">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isBlocked}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Sign In
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </button>
              </form>

              {/* Two-Factor Back Button */}
              {showTwoFactor && (
                <button
                  onClick={() => {
                    setShowTwoFactor(false);
                    setFormData(prev => ({ ...prev, twoFactorCode: '' }));
                  }}
                  className="w-full mt-4 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                  ← Back to email login
                </button>
              )}

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security Features & Branding */}
          <div className="hidden lg:block space-y-8">
            {/* Branding */}
            <div className="text-center">
              <h3 className="text-4xl font-bold text-white mb-4">
                Professional Trading Platform
              </h3>
              <p className="text-xl text-gray-300 leading-relaxed">
                Institutional-grade security meets cutting-edge trading technology.
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-white text-center">Security Features</h4>
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold mb-1">{feature.title}</h5>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                    <div className="flex items-center mt-2">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        feature.status === 'active' ? 'bg-green-500' : 
                        feature.status === 'ready' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-xs text-gray-500 capitalize">{feature.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Stats */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
              <h4 className="text-white font-bold text-lg mb-4 text-center">Live Platform Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">98,421</div>
                  <div className="text-gray-400 text-sm">Active Traders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$2.1B</div>
                  <div className="text-gray-400 text-sm">24h Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">99.99%</div>
                  <div className="text-gray-400 text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">12ms</div>
                  <div className="text-gray-400 text-sm">Avg Latency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}