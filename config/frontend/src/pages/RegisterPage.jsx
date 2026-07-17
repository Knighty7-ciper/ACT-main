import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Wallet, ArrowRight, Globe, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const africanCountries = [
  { code: 'ZAF', name: 'South Africa', currency: 'ZAR' },
  { code: 'NGA', name: 'Nigeria', currency: 'NGN' },
  { code: 'KEN', name: 'Kenya', currency: 'KES' },
  { code: 'GHA', name: 'Ghana', currency: 'GHS' },
  { code: 'EGY', name: 'Egypt', currency: 'EGP' },
  { code: 'MAR', name: 'Morocco', currency: 'MAD' },
  { code: 'ETH', name: 'Ethiopia', currency: 'ETB' },
  { code: 'TZA', name: 'Tanzania', currency: 'TZS' },
  { code: 'UGA', name: 'Uganda', currency: 'UGX' },
  { code: 'CMR', name: 'Cameroon', currency: 'XAF' },
  { code: 'SEN', name: 'Senegal', currency: 'XOF' },
  { code: 'CIV', name: 'Ivory Coast', currency: 'XOF' },
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: 'KEN',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Please enter your name';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (!formData.agreeTerms) {
      return 'You must agree to the terms and conditions';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.email, 
        formData.password,
        formData.name,
        formData.countryCode
      );
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-slate-900">
                  Create Account
                </h1>
                <p className="text-sm text-slate-500">
                  Join the African financial revolution
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="countryCode" className="block text-sm font-medium text-slate-700 mb-2">
                  Your Country
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    id="countryCode"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="input-field pl-10 appearance-none cursor-pointer"
                    required
                  >
                    {africanCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.currency})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Used for PPP-based value calculations
                </p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 
                           focus:ring-primary-500"
                  required
                />
                <label htmlFor="agreeTerms" className="text-sm text-slate-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <Link
              to="/login"
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <span>Sign In Instead</span>
            </Link>
          </form>
        </motion.div>

        {/* Security Note */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Your data is encrypted and never shared. No KYC required for basic usage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
