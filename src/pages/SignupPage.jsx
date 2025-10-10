import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Zap, Star, ArrowLeft, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateSignupForm, getPasswordStrength, formatErrorMessage } from '../utils/authUtils';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptMarketing: false
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(getPasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateSignupForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await signup(formData);
      
      if (result.success) {
        // Redirect to dashboard or home
        navigate('/', { replace: true });
      } else {
        setSubmitError(formatErrorMessage(result.error));
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'bg-gray-200';
    switch (passwordStrength.level) {
      case 'weak': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'strong': return 'bg-green-400';
      case 'very-strong': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-accent transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl">
              <Zap className="w-9 h-9 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TopUp Pro
              </span>
              <span className="text-sm font-accent text-gray-500 -mt-1">Instant Mobile Recharge</span>
            </div>
          </Link>
          
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Join TopUp Pro
          </h2>
          <p className="text-gray-600 font-body">
            Create your account and start enjoying instant mobile top-ups
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Submit Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 font-accent text-sm">{submitError}</p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-accent font-semibold text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full pl-12 pr-4 py-4 border rounded-xl font-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-sm font-accent flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-accent font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`block w-full pl-12 pr-4 py-4 border rounded-xl font-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
                placeholder="Enter your email address"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm font-accent flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field (Optional) */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-accent font-semibold text-gray-700">
              Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className={`block w-full pl-12 pr-4 py-4 border rounded-xl font-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.phone 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phone && (
              <p className="text-red-600 text-sm font-accent flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-accent font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full pl-12 pr-12 py-4 border rounded-xl font-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.password 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && passwordStrength && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-accent text-gray-600">Password Strength</span>
                  <span className={`text-xs font-accent font-semibold ${
                    passwordStrength.level === 'weak' ? 'text-red-600' :
                    passwordStrength.level === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1).replace('-', ' ')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength.percentage}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-red-600 text-sm font-accent flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-accent font-semibold text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`block w-full pl-12 pr-12 py-4 border rounded-xl font-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.confirmPassword 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm font-accent flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="text-sm font-accent text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-purple-600 font-semibold">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-purple-600 font-semibold">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-600 text-sm font-accent flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.acceptTerms}
              </p>
            )}

            <div className="flex items-start gap-3">
              <input
                id="acceptMarketing"
                name="acceptMarketing"
                type="checkbox"
                checked={formData.acceptMarketing}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptMarketing" className="text-sm font-accent text-gray-700">
                I would like to receive promotional emails and updates about new features
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-accent font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Account...
              </>
            ) : (
              <>
                <Zap size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-gray-600 font-body">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-accent font-semibold text-blue-600 hover:text-purple-600 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <p className="text-sm font-accent font-medium text-gray-700">Secure & Protected</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Star size={18} className="text-blue-600" />
            </div>
            <p className="text-sm font-accent font-medium text-gray-700">Instant Access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;