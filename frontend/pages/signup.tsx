/**
 * signup.tsx - Professional Trading Platform Registration Page
 * Enterprise-grade signup with advanced KYC and security features
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
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CubeTransparentIcon,
  SparklesIcon,
  BoltIcon,
  ClockIcon,
  GlobeAltIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  StarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  FingerPrintIcon,
  KeyIcon,
  EyeIcon as EyeSlashIconOff,
  PlayIcon,
  LightBulbIcon,
  FireIcon,
  TrophyIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// TypeScript interfaces
interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

interface AccountType {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  badge?: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface KYCLevel {
  id: string;
  title: string;
  description: string;
  limits: string;
  verification: string[];
  processing: string;
  required: boolean;
  color: string;
}

interface FormData {
  // Step 1: Account Type
  accountType: string;
  
  // Step 2: Personal Information
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  countryCode: string;
  currencyPreference: string;
  dateOfBirth: string;
  
  // Step 3: KYC & Security
  kycLevel: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  
  // Step 4: Preferences
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToMarketing: boolean;
  agreeToRisk: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

// Country data
const countries: Country[] = [
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
  { code: 'UG', name: 'Uganda', currency: 'UGX', flag: '🇺🇬' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', flag: '🇹🇿' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' }
];

// Account types
const accountTypes: AccountType[] = [
  {
    id: 'individual',
    title: 'Individual Trader',
    description: 'Perfect for personal trading and investment',
    features: [
      'Real-time trading',
      'Basic analytics',
      'Mobile app access',
      'Email support',
      'Standard security'
    ],
    price: 'Free',
    icon: UserIcon,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'professional',
    title: 'Professional Trader',
    description: 'Advanced features for serious traders',
    features: [
      'Advanced charting',
      'API access',
      'Priority support',
      'Enhanced security',
      'Portfolio analytics'
    ],
    price: '$29/month',
    badge: 'Popular',
    icon: ChartBarIcon,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'institutional',
    title: 'Institutional',
    description: 'Enterprise-grade solution for institutions',
    features: [
      'White-label solutions',
      'Dedicated support',
      'Custom integrations',
      'Advanced compliance',
      'Multi-user access'
    ],
    price: 'Custom',
    badge: 'Premium',
    icon: BuildingOfficeIcon,
    color: 'from-orange-500 to-orange-600'
  }
];

// KYC levels
const kycLevels: KYCLevel[] = [
  {
    id: 'basic',
    title: 'Basic Verification',
    description: 'Required for basic trading and transactions',
    limits: '$1,000 daily, $10,000 monthly',
    verification: ['Email verification', 'Phone verification', 'Basic ID'],
    processing: 'Instant',
    required: true,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'intermediate',
    title: 'Intermediate Verification',
    description: 'Enhanced limits and features',
    limits: '$10,000 daily, $100,000 monthly',
    verification: ['Government ID', 'Proof of address', 'Income verification'],
    processing: '1-2 business days',
    required: false,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'full',
    title: 'Full Verification',
    description: 'Maximum limits and institutional features',
    limits: '$100,000 daily, $1,000,000 monthly',
    verification: ['Enhanced due diligence', 'Source of funds', 'Enhanced documentation'],
    processing: '3-5 business days',
    required: false,
    color: 'from-purple-500 to-purple-600'
  }
];

export default function Signup() {
  const router = useRouter();
  const { signUp, user, loading } = useUser();
  
  const [formData, setFormData] = useState<FormData>({
    accountType: 'individual',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    countryCode: 'KE',
    currencyPreference: 'KES',
    dateOfBirth: '',
    kycLevel: 'basic',
    twoFactorEnabled: true,
    biometricEnabled: true,
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false,
    agreeToRisk: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Very Weak',
    color: 'text-red-500',
    suggestions: []
  });
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Calculate password strength
  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, label: 'Very Weak', color: 'text-red-500', suggestions: [] };
    }

    let score = 0;
    const suggestions: string[] = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    else suggestions.push('Use at least 8 characters');
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Add lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Add uppercase letters');
    
    if (/[0-9]/.test(password)) score += 1;
    else suggestions.push('Add numbers');
    
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else suggestions.push('Add special characters');
    
    // Uniqueness check
    if (password.length >= 12) score += 1;

    let label = 'Very Weak';
    let color = 'text-red-500';
    
    if (score >= 4) {
      label = 'Strong';
      color = 'text-green-500';
    } else if (score >= 3) {
      label = 'Good';
      color = 'text-blue-500';
    } else if (score >= 2) {
      label = 'Fair';
      color = 'text-yellow-500';
    }

    return { score, label, color, suggestions };
  }, []);

  // Update password strength
  useEffect(() => {
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password, calculatePasswordStrength]);

  // Handle form changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-update currency when country changes
    if (name === 'countryCode') {
      const selectedCountry = countries.find(c => c.code === value);
      setFormData(prev => ({
        ...prev,
        countryCode: value,
        currencyPreference: selectedCountry?.currency || 'USD'
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Validate step
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.accountType) {
        newErrors.accountType = 'Please select an account type';
      }
    }

    if (step === 2) {
      if (!formData.email) {
        newErrors.email = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (passwordStrength.score < 3) {
        newErrors.password = 'Password must be stronger for security';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Please enter a valid full name';
      }

      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }

      if (!formData.countryCode) {
        newErrors.countryCode = 'Please select your country';
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
    }

    if (step === 3) {
      if (!formData.kycLevel) {
        newErrors.kycLevel = 'Please select a KYC verification level';
      }
    }

    if (step === 4) {
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the Terms of Service';
      }

      if (!formData.agreeToPrivacy) {
        newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';
      }

      if (!formData.agreeToRisk) {
        newErrors.agreeToRisk = 'You must acknowledge the investment risks';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, passwordStrength.score]);

  // Handle step navigation
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone,
        countryCode: formData.countryCode,
        accountType: formData.accountType,
        kycLevel: formData.kycLevel,
        twoFactorEnabled: formData.twoFactorEnabled,
        biometricEnabled: formData.biometricEnabled,
        currencyPreference: formData.currencyPreference,
        dateOfBirth: formData.dateOfBirth,
        marketingConsent: formData.agreeToMarketing
      });
      
      toast.success('Account created successfully! Please check your email to verify your account.');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.message?.includes('User already registered')) {
        setErrors({ submit: 'An account with this email already exists' });
      } else if (error.message?.includes('Password should be at least')) {
        setErrors({ submit: 'Password does not meet requirements' });
      } else {
        setErrors({ submit: 'Failed to create account. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step configuration
  const steps = [
    { number: 1, title: 'Account Type', description: 'Choose your trading profile' },
    { number: 2, title: 'Personal Info', description: 'Basic information' },
    { number: 3, title: 'Verification', description: 'KYC & security setup' },
    { number: 4, title: 'Agreement', description: 'Terms & conditions' }
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
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-center space-x-4 lg:space-x-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                currentStep >= step.number
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white'
                  : 'border-gray-600 text-gray-400'
              }`}>
                {currentStep > step.number ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <span className="font-bold">{step.number}</span>
                )}
              </div>
              <div className="hidden lg:block ml-3">
                <div className={`font-semibold ${currentStep >= step.number ? 'text-white' : 'text-gray-400'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden lg:block w-16 h-0.5 ml-4 ${
                  currentStep > step.number ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Form Content */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              
              {/* Step 1: Account Type */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 mb-4">
                      <SparklesIcon className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-blue-400 text-sm font-semibold">Step 1 of 4</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Choose Your Account Type</h2>
                    <p className="text-gray-400">Select the trading profile that best fits your needs</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {accountTypes.map((type) => (
                      <div 
                        key={type.id}
                        className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
                          formData.accountType === type.id
                            ? 'border-blue-500 bg-blue-600/20'
                            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, accountType: type.id }))}
                      >
                        {type.badge && (
                          <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                            type.badge === 'Popular' ? 'bg-purple-600 text-white' : 'bg-orange-600 text-white'
                          }`}>
                            {type.badge}
                          </div>
                        )}
                        
                        <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                          <type.icon className="h-8 w-8 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 text-center">{type.title}</h3>
                        <p className="text-gray-400 text-sm text-center mb-4">{type.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          {type.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-lg font-bold ${formData.accountType === type.id ? 'text-blue-400' : 'text-white'}`}>
                            {type.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.accountType && (
                    <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 text-sm flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                        {errors.accountType}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                  >
                    Continue to Personal Information
                    <ArrowRightIcon className="inline ml-2 h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 mb-4">
                      <SparklesIcon className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-blue-400 text-sm font-semibold">Step 2 of 4</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Personal Information</h2>
                    <p className="text-gray-400">Please provide your basic information</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Email Address *
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

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className={`w-full bg-white/10 border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                            errors.fullName ? 'border-red-500' : 'border-white/20'
                          }`}
                        />
                        <UserIcon className="h-5 w-5 text-gray-400 absolute right-3 top-3.5" />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-400 text-sm mt-1 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a strong password"
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
                      
                      {/* Password Strength */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Password Strength</span>
                            <span className={`text-xs font-medium ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.score <= 2 ? 'bg-red-500' :
                                passwordStrength.score <= 3 ? 'bg-yellow-500' :
                                passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            ></div>
                          </div>
                          {passwordStrength.suggestions.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {passwordStrength.suggestions[0]}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {errors.password && (
                        <p className="text-red-400 text-sm mt-1 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          className={`w-full bg-white/10 border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                            errors.confirmPassword ? 'border-red-500' : 'border-white/20'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+254 712 345 678"
                          className={`w-full bg-white/10 border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                            errors.phone ? 'border-red-500' : 'border-white/20'
                          }`}
                        />
                        <PhoneIcon className="h-5 w-5 text-gray-400 absolute right-3 top-3.5" />
                      </div>
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-1 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Country *
                      </label>
                      <div className="relative">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          className={`w-full bg-white/10 border rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none ${
                            errors.countryCode ? 'border-red-500' : 'border-white/20'
                          }`}
                        >
                          {countries.map((country) => (
                            <option key={country.code} value={country.code} className="bg-gray-900">
                              {country.flag} {country.name}
                            </option>
                          ))}
                        </select>
                        <MapPinIcon className="h-5 w-5 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                      </div>
                      {errors.countryCode && (
                        <p className="text-red-400 text-sm mt-1 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.countryCode}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                          errors.dateOfBirth ? 'border-red-500' : 'border-white/20'
                        }`}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-400 text-sm mt-1 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.dateOfBirth}
                        </p>
                      )}
                    </div>

                    {/* Currency Preference */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Preferred Currency
                      </label>
                      <div className="relative">
                        <select
                          name="currencyPreference"
                          value={formData.currencyPreference}
                          onChange={handleChange}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                        >
                          <option value={formData.currencyPreference} className="bg-gray-900">
                            {formData.currencyPreference}
                          </option>
                        </select>
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">This will be your default wallet currency</p>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handlePrevStep}
                      className="flex-1 bg-gray-600 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      <ArrowLeftIcon className="inline mr-2 h-5 w-5" />
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                    >
                      Continue to Verification
                      <ArrowRightIcon className="inline ml-2 h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: KYC & Security */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 mb-4">
                      <SparklesIcon className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-blue-400 text-sm font-semibold">Step 3 of 4</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">KYC & Security Setup</h2>
                    <p className="text-gray-400">Configure your verification and security preferences</p>
                  </div>

                  {/* KYC Level Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-4">
                      KYC Verification Level *
                    </label>
                    <div className="space-y-4">
                      {kycLevels.map((level) => (
                        <div 
                          key={level.id}
                          className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
                            formData.kycLevel === level.id
                              ? 'border-blue-500 bg-blue-600/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, kycLevel: level.id }))}
                        >
                          {level.required && (
                            <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              Required
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-2">{level.title}</h3>
                              <p className="text-gray-400 text-sm mb-3">{level.description}</p>
                              
                              <div className="space-y-2 mb-4">
                                <div>
                                  <span className="text-xs text-gray-400">Trading Limits:</span>
                                  <span className="text-xs text-white font-medium ml-2">{level.limits}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-400">Processing Time:</span>
                                  <span className="text-xs text-white font-medium ml-2">{level.processing}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                {level.verification.map((item, index) => (
                                  <div key={index} className="flex items-center text-xs">
                                    <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                    <span className="text-gray-300">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.kycLevel === level.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-400'
                            }`}>
                              {formData.kycLevel === level.id && (
                                <CheckCircleIcon className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.kycLevel && (
                      <p className="text-red-400 text-sm mt-2 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.kycLevel}
                      </p>
                    )}
                  </div>

                  {/* Security Options */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white">Security Options</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center space-x-3">
                          <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
                          <div>
                            <h5 className="text-white font-semibold">Two-Factor Authentication</h5>
                            <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="twoFactorEnabled"
                            checked={formData.twoFactorEnabled}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center space-x-3">
                          <FingerPrintIcon className="h-6 w-6 text-purple-400" />
                          <div>
                            <h5 className="text-white font-semibold">Biometric Authentication</h5>
                            <p className="text-gray-400 text-sm">Use fingerprint or face recognition for quick access</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="biometricEnabled"
                            checked={formData.biometricEnabled}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handlePrevStep}
                      className="flex-1 bg-gray-600 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      <ArrowLeftIcon className="inline mr-2 h-5 w-5" />
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                    >
                      Continue to Agreement
                      <ArrowRightIcon className="inline ml-2 h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Agreement */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 mb-4">
                      <SparklesIcon className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-blue-400 text-sm font-semibold">Step 4 of 4</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Terms & Conditions</h2>
                    <p className="text-gray-400">Please review and agree to our terms</p>
                  </div>

                  <div className="space-y-6">
                    {/* Agreement Checkboxes */}
                    <div className="space-y-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleChange}
                          className="mt-1 w-5 h-5 bg-white/10 border border-white/20 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="text-sm">
                          <span className="text-white">I agree to the </span>
                          <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                            Terms of Service
                          </Link>
                          <span className="text-white"> and understand my rights and obligations.</span>
                        </div>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="text-red-400 text-sm flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.agreeToTerms}
                        </p>
                      )}

                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agreeToPrivacy"
                          checked={formData.agreeToPrivacy}
                          onChange={handleChange}
                          className="mt-1 w-5 h-5 bg-white/10 border border-white/20 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="text-sm">
                          <span className="text-white">I agree to the </span>
                          <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                            Privacy Policy
                          </Link>
                          <span className="text-white"> and consent to data processing.</span>
                        </div>
                      </label>
                      {errors.agreeToPrivacy && (
                        <p className="text-red-400 text-sm flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.agreeToPrivacy}
                        </p>
                      )}

                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agreeToRisk"
                          checked={formData.agreeToRisk}
                          onChange={handleChange}
                          className="mt-1 w-5 h-5 bg-white/10 border border-white/20 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="text-sm">
                          <span className="text-white">I acknowledge the </span>
                          <Link href="/risks" className="text-orange-400 hover:text-orange-300 underline">
                            investment risks
                          </Link>
                          <span className="text-white"> associated with digital asset trading.</span>
                        </div>
                      </label>
                      {errors.agreeToRisk && (
                        <p className="text-red-400 text-sm flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {errors.agreeToRisk}
                        </p>
                      )}

                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agreeToMarketing"
                          checked={formData.agreeToMarketing}
                          onChange={handleChange}
                          className="mt-1 w-5 h-5 bg-white/10 border border-white/20 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="text-sm">
                          <span className="text-white">I would like to receive marketing communications and updates about new features.</span>
                        </div>
                      </label>
                    </div>

                    {/* Account Summary */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30">
                      <h4 className="text-white font-bold text-lg mb-4">Account Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account Type:</span>
                          <span className="text-white font-medium">
                            {accountTypes.find(t => t.id === formData.accountType)?.title}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">KYC Level:</span>
                          <span className="text-white font-medium">
                            {kycLevels.find(k => k.id === formData.kycLevel)?.title}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Currency:</span>
                          <span className="text-white font-medium">{formData.currencyPreference}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">2FA Enabled:</span>
                          <span className="text-white font-medium">
                            {formData.twoFactorEnabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 text-sm flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                        {errors.submit}
                      </p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handlePrevStep}
                      className="flex-1 bg-gray-600 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      <ArrowLeftIcon className="inline mr-2 h-5 w-5" />
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:via-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Create Account
                          <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      Already have an account?{' '}
                      <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-8">
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
              <h3 className="text-white font-bold text-xl mb-4">Welcome to ACT Exchange</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Join thousands of professional traders who trust our platform for 
                institutional-grade security and advanced trading tools.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-green-400">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center text-blue-400">
                  <BoltIcon className="h-4 w-4 mr-1" />
                  <span>Ultra-fast execution</span>
                </div>
              </div>
            </div>

            {/* Step Information */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-bold text-lg mb-4">What's Next?</h4>
              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-bold">{step.number}</span>
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold ${currentStep >= step.number ? 'text-white' : 'text-gray-400'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
              <h4 className="text-white font-bold mb-2">Need Help?</h4>
              <p className="text-gray-400 text-sm mb-4">
                Our support team is available 24/7 to assist you.
              </p>
              <Link href="/support" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}