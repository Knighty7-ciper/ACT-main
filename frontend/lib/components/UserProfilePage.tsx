/**
 * User Profile Component
 * 
 * Complete user profile management with wallet integration,
 * KYC status, spending limits, and account settings.
 */

import React, { useState, useEffect } from 'react';
import { userService, type UserProfile, type UserLimits } from '../services/user.service';
import { actPaymentService, type WalletBalance } from '../services/act-payment.service';

interface UserProfilePageProps {
  userId: string;
}

interface TabData {
  id: string;
  label: string;
  icon: string;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile edit state
  const [editProfile, setEditProfile] = useState<Partial<UserProfile>>({});
  const [showEditForm, setShowEditForm] = useState(false);

  // Currency options
  const currencyOptions = [
    { value: 'KES', label: 'Kenyan Shilling (KES)', symbol: 'KSh' },
    { value: 'UGX', label: 'Ugandan Shilling (UGX)', symbol: 'USh' },
    { value: 'GHS', label: 'Ghanaian Cedi (GHS)', symbol: '₵' },
    { value: 'TZS', label: 'Tanzanian Shilling (TZS)', symbol: 'TSh' },
    { value: 'USD', label: 'US Dollar (USD)', symbol: '$' }
  ];

  // Country options
  const countryOptions = [
    { value: 'KE', label: 'Kenya', currency: 'KES' },
    { value: 'UG', label: 'Uganda', currency: 'UGX' },
    { value: 'GH', label: 'Ghana', currency: 'GHS' },
    { value: 'TZ', label: 'Tanzania', currency: 'TZS' },
    { value: 'US', label: 'United States', currency: 'USD' }
  ];

  const tabs: TabData[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'wallet', label: 'Wallet & Limits', icon: '💰' },
    { id: 'kyc', label: 'Verification', icon: '🛡️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'activity', label: 'Activity', icon: '📊' }
  ];

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load all user data in parallel
      const [profileData, walletData, limitsData] = await Promise.all([
        userService.getUserProfile(userId),
        actPaymentService.getWalletBalance(userId),
        userService.getUserLimits(userId)
      ]);

      setProfile(profileData);
      setWalletBalance(walletData);
      setLimits(limitsData);
      
      if (profileData) {
        setEditProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setErrors({ load: 'Failed to load user data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setIsUpdating(true);
    try {
      const updatedProfile = await userService.updateUserProfile(userId, editProfile);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setShowEditForm(false);
        alert('Profile updated successfully!');
      } else {
        setErrors({ update: 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ update: 'Failed to update profile' });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyOption = currencyOptions.find(opt => opt.value === currency);
    const symbol = currencyOption?.symbol || '';
    
    if (currency === 'KES' || currency === 'UGX' || currency === 'TZS') {
      return `${symbol} ${amount.toLocaleString()}`;
    }
    return `${symbol} ${amount.toFixed(2)}`;
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getKYCLevelColor = (level: string) => {
    switch (level) {
      case 'full': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-purple-600 bg-purple-100';
      case 'basic': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">Unable to load your profile. Please try again.</p>
          <button
            onClick={loadUserData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.full_name || profile.email}
            </h1>
            <p className="text-gray-600">{profile.email}</p>
            <div className="flex space-x-2 mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getKYCStatusColor(profile.kyc_status)}`}>
                {profile.kyc_status.toUpperCase()}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getKYCLevelColor(profile.kyc_level)}`}>
                {profile.kyc_level.toUpperCase()} KYC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showEditForm ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {showEditForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editProfile.full_name || ''}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editProfile.phone || ''}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editProfile.date_of_birth || ''}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Preference
                      </label>
                      <select
                        value={editProfile.currency_preference || 'KES'}
                        onChange={(e) => setEditProfile(prev => ({ ...prev, currency_preference: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {currencyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setShowEditForm(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="text-lg text-gray-900">{profile.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="text-lg text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="text-lg text-gray-900">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                      <p className="text-lg text-gray-900">
                        {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Currency Preference</h3>
                      <p className="text-lg text-gray-900">
                        {currencyOptions.find(opt => opt.value === profile.currency_preference)?.label || 'KES'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Country</h3>
                      <p className="text-lg text-gray-900">
                        {countryOptions.find(opt => opt.value === profile.country_code)?.label || 'Kenya'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wallet & Limits Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Wallet & Spending Limits</h2>
              
              {walletBalance && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-medium mb-2">Current Balance</h3>
                  <p className="text-3xl font-bold">{walletBalance.balance.toLocaleString()} ACT</p>
                  <p className="text-blue-100">
                    Last updated: {new Date(walletBalance.updated_at).toLocaleString()}
                  </p>
                </div>
              )}

              {limits && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Daily Limit</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(limits.daily_limit, profile.currency_preference)}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Used</span>
                        <span>{formatCurrency(limits.current_daily_spent, profile.currency_preference)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((limits.current_daily_spent / limits.daily_limit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Limit</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(limits.monthly_limit, profile.currency_preference)}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Used</span>
                        <span>{formatCurrency(limits.current_monthly_spent, profile.currency_preference)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${Math.min((limits.current_monthly_spent / limits.monthly_limit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Annual Limit</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(limits.annual_limit, profile.currency_preference)}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Used</span>
                        <span>{formatCurrency(limits.current_annual_spent, profile.currency_preference)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min((limits.current_annual_spent / limits.annual_limit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Identity Verification</h2>
                {profile.kyc_status !== 'verified' && (
                  <a
                    href="/kyc-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Upload Documents
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Verification Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getKYCStatusColor(profile.kyc_status)}`}>
                        {profile.kyc_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getKYCLevelColor(profile.kyc_level)}`}>
                        {profile.kyc_level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Verification Benefits</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Higher transaction limits</li>
                    <li>• Faster payment processing</li>
                    <li>• Access to premium features</li>
                    <li>• Enhanced security</li>
                  </ul>
                </div>
              </div>

              {profile.verification_documents && Object.keys(profile.verification_documents).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Uploaded Documents</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(profile.verification_documents).map(([type, url]) => (
                      url && (
                        <div key={type} className="border rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700 capitalize">
                            {type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-green-600">✓ Uploaded</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Security Settings</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Enable 2FA
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    Change Password
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Account Deactivation</h3>
                    <p className="text-sm text-gray-600">Temporarily deactivate your account</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Account Activity</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Account Created</h3>
                  <p className="text-lg text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Last Login</h3>
                  <p className="text-lg text-gray-900">
                    {profile.last_login_at 
                      ? new Date(profile.last_login_at).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Account Status</h3>
                  <p className={`text-lg ${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;