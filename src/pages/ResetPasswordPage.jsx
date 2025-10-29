import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, 
  Shield, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, success, error
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [isValidatingToken, setIsValidatingToken] = useState(true);

  useEffect(() => {
    // Check if token and email are present
    if (!token || !email) {
      setTokenValid(false);
      setMessage('Invalid or missing reset token. Please request a new password reset.');
      setIsValidatingToken(false);
      return;
    }
    
    // Actually validate the token with the backend
    const validateToken = async () => {
      try {
        // Call the backend to validate the token
        const API_BASE_URL = process.env.NODE_ENV === 'production' 
          ? 'https://topup-backend-production.up.railway.app'
          : 'http://localhost:8080';
        const response = await fetch(`${API_BASE_URL}/api/auth/validate-reset-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          setIsValidatingToken(false);
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setMessage(data.message || 'Invalid or expired reset token. Please request a new one.');
          setIsValidatingToken(false);
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setTokenValid(false);
        setMessage('There was an error validating your reset token. Please try again.');
        setIsValidatingToken(false);
      }
    };
    
    validateToken();
  }, [token, email]);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength += 1;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) strength += 1;
    else feedback.push('Lowercase letter');

    if (/[A-Z]/.test(password)) strength += 1;
    else feedback.push('Uppercase letter');

    if (/[0-9]/.test(password)) strength += 1;
    else feedback.push('Number');

    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    else feedback.push('Special character');

    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['red', 'orange', 'yellow', 'blue', 'green'];

    return {
      level: levels[strength - 1] || 'Very Weak',
      color: colors[strength - 1] || 'red',
      score: strength,
      feedback: feedback
    };
  };

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const validateForm = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength && passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak. Please create a stronger password';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error
    if (submitStatus === 'error') {
      setSubmitStatus(null);
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenValid) {
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setMessage('');

    try {
      const result = await resetPassword({
        token: token,
        email: email,
        newPassword: formData.password
      });
      
      if (result.success) {
        setSubmitStatus('success');
        setMessage('Your password has been successfully reset! You can now log in with your new password.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! You can now log in with your new password.',
              email: email 
            } 
          });
        }, 3000);
      } else {
        setSubmitStatus('error');
        if (result.message?.includes('expired') || result.message?.includes('invalid')) {
          setTokenValid(false);
        }
        setMessage(result.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <LoadingSpinner message="Validating your reset link..." />
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Invalid Reset Link
            </h1>
            <p className="text-gray-600 mb-6">
              {message || 'The password reset link is invalid or has expired. Please request a new one.'}
            </p>
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/login"
                className="block w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            to="/login" 
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below. Make sure it's strong and secure.
            </p>
            {email && (
              <p className="text-sm text-blue-600 mt-2">
                Resetting password for: <strong>{email}</strong>
              </p>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {isSubmitting ? (
              /* Loading State */
              <div className="text-center py-6">
                <LoadingSpinner message="Resetting your password..." />
              </div>
            ) : submitStatus === 'success' ? (
              /* Success State */
              <div className="text-center">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                    <h2 className="text-xl font-semibold text-green-700 mb-2">
                      Password Reset Successful!
                    </h2>
                    <p className="text-green-600 leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center text-green-600 mb-4 bg-green-50 p-2 rounded-full inline-block">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm">Redirecting to login page...</span>
                </div>
                <div className="mt-6">
                  <Link
                    to="/login"
                    state={{ email: email }}
                    className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitStatus === 'error' && message && (
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-sm">{message}</span>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.password 
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Enter your new password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {passwordStrength && formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Password Strength:</span>
                        <span className={`font-semibold text-${passwordStrength.color}-600`}>
                          {passwordStrength.level}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Missing: {passwordStrength.feedback.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.confirmPassword 
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm">Password Requirements:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Resetting Password...
                    </div>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2 inline" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Additional Info */}
            {submitStatus !== 'success' && (
              <div className="text-center mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                  Remember your password?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;