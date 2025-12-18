/**
 * ACT Token Purchase Component - PesaPal Integration
 * 
 * This component provides a complete UI for purchasing ACT tokens using PesaPal payment gateway.
 * Features include currency selection, payment method selection, and real-time calculations.
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { actPaymentService, type ACTPurchaseRequest, type PesaPalPaymentResponse, type WalletBalance } from '../services/act-payment.service';
import { userService, type UserProfile, type UserLimits } from '../services/user.service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

interface ACTBuyPageProps {
  user: User;
}

const ACTBuyPage: React.FC<ACTBuyPageProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    fiatAmount: '',
    fiatCurrency: 'KES' as 'KES' | 'UGX' | 'GHS' | 'TZS' | 'USD',
    paymentMethod: 'mpesa' as 'mpesa' | 'mtn' | 'airtel' | 'vodafone' | 'card' | 'bank_transfer',
    customerEmail: user.email,
    customerPhone: '',
    customerName: user.user_metadata?.full_name || ''
  });

  const [calculations, setCalculations] = useState({
    actAmount: 0,
    exchangeRate: 133.5,
    actPriceUSD: 1.24
  });

  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState<'form' | 'processing' | 'redirect'>('form');
  const [kycValidation, setKycValidation] = useState<{
    canTransact: boolean;
    missingRequirements: string[];
    maxAmount: number;
  }>({ canTransact: true, missingRequirements: [], maxAmount: Infinity });

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, [user.id]);

  // Load wallet balance on component mount
  useEffect(() => {
    loadWalletBalance();
  }, [user.id]);

  // Update calculations when amount or currency changes
  useEffect(() => {
    updateCalculations();
  }, [formData.fiatAmount, formData.fiatCurrency]);

  const loadUserData = async () => {
    try {
      // Load user profile
      const profile = await userService.getUserProfile(user.id);
      setUserProfile(profile);

      // Load user limits
      const limits = await userService.getUserLimits(user.id);
      setUserLimits(limits);

      // Perform KYC validation
      await validateKYCAndLimits();
    } catch (error) {
      console.error('Failed to load user data:', error);
      setErrors({ load: 'Failed to load user data' });
    }
  };

  const loadWalletBalance = async () => {
    try {
      const balance = await actPaymentService.getWalletBalance(user.id);
      if (balance) {
        setWalletBalance({
          balance: balance.balance,
          currency: balance.currency,
          user_id: balance.user_id,
          is_active: balance.is_active,
          created_at: balance.created_at,
          updated_at: balance.updated_at
        });
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const validateKYCAndLimits = async () => {
    if (!userProfile || !userLimits) return;

    const missingRequirements: string[] = [];
    let canTransact = true;
    let maxAmount = Infinity;

    // Check KYC status
    if (userProfile.kyc_status === 'rejected') {
      missingRequirements.push('Identity verification was rejected. Please contact support.');
      canTransact = false;
    } else if (userProfile.kyc_status === 'pending') {
      // Check if basic requirements are met
      if (!userProfile.full_name || userProfile.full_name.trim() === '') {
        missingRequirements.push('Please complete your profile with full name');
      }
      if (!userProfile.phone || userProfile.phone.trim() === '') {
        missingRequirements.push('Please add a phone number');
      }
      if (!userProfile.date_of_birth) {
        missingRequirements.push('Please provide date of birth');
      }
      
      // Apply lower limits for pending KYC
      maxAmount = Math.min(maxAmount, userLimits.daily_limit * 0.1); // 10% of daily limit
    }

    // Check spending limits
    const fiatAmount = parseFloat(formData.fiatAmount) || 0;
    if (fiatAmount > 0) {
      const limitCheck = await userService.canMakeTransaction(user.id, fiatAmount);
      if (!limitCheck.canProceed) {
        missingRequirements.push(limitCheck.reason || 'Transaction limit exceeded');
        canTransact = false;
      } else {
        maxAmount = Math.min(maxAmount, limitCheck.remainingLimit);
      }
    }

    setKycValidation({
      canTransact,
      missingRequirements,
      maxAmount
    });
  };

  const updateCalculations = () => {
    const fiatAmount = parseFloat(formData.fiatAmount) || 0;
    const actAmount = actPaymentService.calculateACTAmount(fiatAmount, formData.fiatCurrency);
    
    // Use consistent exchange rates from payment service
    const exchangeRate = actPaymentService.getExchangeRate(formData.fiatCurrency);
    const usdAmount = actPaymentService.calculateUSDFromACT(actAmount);

    setCalculations({
      actAmount,
      exchangeRate,
      actPriceUSD: usdAmount
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Basic form validation
    if (!formData.fiatAmount || parseFloat(formData.fiatAmount) <= 0) {
      newErrors.fiatAmount = 'Please enter a valid amount';
    }

    if (!formData.customerPhone) {
      newErrors.customerPhone = 'Phone number is required for mobile money payments';
    }

    if (!formData.customerName) {
      newErrors.customerName = 'Name is required';
    }

    if (!formData.customerEmail) {
      newErrors.customerEmail = 'Email is required';
    }

    // KYC and limits validation
    if (!kycValidation.canTransact) {
      newErrors.kyc = kycValidation.missingRequirements.join(', ');
    }

    // Amount limit validation
    const fiatAmount = parseFloat(formData.fiatAmount) || 0;
    if (fiatAmount > kycValidation.maxAmount) {
      newErrors.fiatAmount = `Amount exceeds your transaction limit of ${kycValidation.maxAmount.toFixed(2)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePurchaseACT = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      const purchaseRequest: ACTPurchaseRequest = {
        userId: user.id,
        actAmount: calculations.actAmount,
        fiatAmount: parseFloat(formData.fiatAmount),
        fiatCurrency: formData.fiatCurrency,
        paymentMethod: formData.paymentMethod,
        customerInfo: {
          email: formData.customerEmail,
          phoneNumber: formData.customerPhone,
          name: formData.customerName
        }
      };

      console.log('Initiating ACT purchase:', purchaseRequest);

      // Step 1: Initiate purchase with PesaPal
      const paymentResponse: PesaPalPaymentResponse = await actPaymentService.initiateACTPurchase(purchaseRequest);
      
      console.log('PesaPal payment response:', paymentResponse);

      // Step 2: Redirect to PesaPal payment page
      setCurrentStep('redirect');
      
      // Redirect to PesaPal payment page
      window.location.href = paymentResponse.redirect_url;

    } catch (error) {
      console.error('ACT Purchase Error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to process payment. Please try again.'
      });
      setCurrentStep('form');
      setIsProcessing(false);
    }
  };

  const currencies = actPaymentService.getSupportedCurrencies();
  const paymentMethods = actPaymentService.getSupportedPaymentMethods(formData.fiatCurrency);

  const formatCurrency = (amount: number, currency: string): string => {
    const symbols: { [key: string]: string } = {
      'KES': 'KSh',
      'UGX': 'USh',
      'GHS': '₵',
      'TZS': 'TSh',
      'USD': '$'
    };

    return `${symbols[currency] || currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPaymentMethodIcon = (method: string): string => {
    const icons: { [key: string]: string } = {
      'mpesa': '📱',
      'mtn': '📞',
      'airtel': '📡',
      'vodafone': '📱',
      'card': '💳',
      'bank_transfer': '🏦'
    };
    return icons[method] || '💳';
  };

  if (currentStep === 'processing') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Your ACT Purchase</h2>
          <p className="text-gray-600">Please wait while we set up your payment with PesaPal...</p>
        </div>
      </div>
    );
  }

  if (currentStep === 'redirect') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="text-6xl mb-4">🔄</div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Redirecting to PesaPal</h2>
          <p className="text-gray-600 mb-4">You will be redirected to complete your payment securely.</p>
          <p className="text-sm text-gray-500">
            Don't close this window. If not redirected automatically,{' '}
            <button 
              onClick={() => window.history.back()}
              className="text-blue-600 hover:underline"
            >
              click here to go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Buy ACT Tokens</h1>
        <p className="text-gray-600">Purchase PESA Afrik tokens using your local African payment methods</p>
      </div>

      {/* Current Wallet Balance */}
      {walletBalance && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-blue-800 font-medium">Current ACT Balance:</span>
            <span className="text-blue-900 font-bold text-lg">
              {walletBalance.balance.toFixed(7)} ACT
            </span>
          </div>
        </div>
      )}

      {/* KYC Status Indicator */}
      {userProfile && (
        <div className={`border rounded-lg p-4 mb-6 ${
          userProfile.kyc_status === 'verified' 
            ? 'bg-green-50 border-green-200' 
            : userProfile.kyc_status === 'pending'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`font-medium ${
                userProfile.kyc_status === 'verified' 
                  ? 'text-green-800' 
                  : userProfile.kyc_status === 'pending'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                Account Verification: {userProfile.kyc_status.toUpperCase()}
              </h3>
              <p className={`text-sm ${
                userProfile.kyc_status === 'verified' 
                  ? 'text-green-700' 
                  : userProfile.kyc_status === 'pending'
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                Level: {userProfile.kyc_level.toUpperCase()}
              </p>
              {kycValidation.missingRequirements.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-700 mb-1">Missing requirements:</p>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {kycValidation.missingRequirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {userProfile.kyc_status !== 'verified' && (
              <a 
                href="/kyc-upload" 
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Complete KYC
              </a>
            )}
          </div>
          {userLimits && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-sm text-green-700">
                Daily Limit: {formData.fiatCurrency} {(userLimits.daily_limit - userLimits.current_daily_spent).toFixed(2)} remaining
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {(errors.general || errors.kyc) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">
                {errors.kyc ? 'Verification Required' : 'Error'}
              </h3>
              <p className="text-red-700">
                {errors.kyc || errors.general}
              </p>
              {errors.kyc && userProfile?.kyc_status !== 'verified' && (
                <a href="/kyc-upload" className="text-blue-600 hover:text-blue-700 underline">
                  Complete verification to proceed
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Purchase Form */}
      <div className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Pay
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <input
                type="number"
                value={formData.fiatAmount}
                onChange={(e) => handleInputChange('fiatAmount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fiatAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <select
                value={formData.fiatCurrency}
                onChange={(e) => handleInputChange('fiatCurrency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {errors.fiatAmount && (
            <p className="text-red-500 text-sm mt-1">{errors.fiatAmount}</p>
          )}
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map(method => (
              <button
                key={method}
                onClick={() => handleInputChange('paymentMethod', method)}
                className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors ${
                  formData.paymentMethod === method
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="text-lg">{getPaymentMethodIcon(method)}</span>
                <span className="capitalize font-medium">{method.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your full name"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+254 700 000 000"
            />
            {errors.customerPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
          />
          {errors.customerEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
          )}
        </div>

        {/* Calculation Summary */}
        {calculations.actAmount > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Purchase Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">You Pay:</span>
                <span className="font-medium">
                  {formatCurrency(parseFloat(formData.fiatAmount) || 0, formData.fiatCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exchange Rate:</span>
                <span className="font-medium">
                  1 USD = {calculations.exchangeRate.toLocaleString()} {formData.fiatCurrency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ACT Token Price:</span>
                <span className="font-medium">
                  ${calculations.actPriceUSD} USD
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">You Receive:</span>
                <span className="font-bold text-lg text-green-600">
                  {calculations.actAmount.toFixed(7)} ACT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Button */}
        <button
          onClick={handlePurchaseACT}
          disabled={isProcessing || !formData.fiatAmount || parseFloat(formData.fiatAmount) <= 0}
          className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
            isProcessing || !formData.fiatAmount || parseFloat(formData.fiatAmount) <= 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : `Buy ${calculations.actAmount.toFixed(7)} ACT Tokens`}
        </button>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by PesaPal • Secure African Payments</p>
          <p className="mt-1">
            Token purchases are processed by PesaPal and converted to ACT tokens automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ACTBuyPage;