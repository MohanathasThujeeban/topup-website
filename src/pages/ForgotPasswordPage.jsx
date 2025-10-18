import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendPasswordReset, isLoading } = useAuth();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, success, error
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue.trim()) {
      return 'Email address is required';
    } else if (!emailRegex.test(emailValue)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear errors when user starts typing
    if (emailError) {
      setEmailError('');
    }
    if (submitStatus === 'error') {
      setSubmitStatus(null);
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateEmail(email);
    if (validation) {
      setEmailError(validation);
      return;
    }

    setIsSubmitting(true);
    setEmailError('');
    setMessage('');

    try {
      const result = await sendPasswordReset(email.trim().toLowerCase());
      
      if (result.success) {
        setSubmitStatus('success');
        setMessage('Password reset instructions have been sent to your email address. Please check your inbox and spam folder.');
      } else {
        setSubmitStatus('error');
        setMessage(result.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = () => {
    setSubmitStatus(null);
    setMessage('');
    handleSubmit({ preventDefault: () => {} });
  };

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
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {submitStatus === 'success' ? (
              /* Success State */
              <div className="text-center">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-green-600 mb-2">
                    Email Sent Successfully!
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {message}
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Resending...
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2 inline" />
                        Resend Email
                      </>
                    )}
                  </button>

                  <Link
                    to="/login"
                    className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center"
                  >
                    Back to Login
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Didn't receive the email?</strong> Check your spam folder or contact support if you continue to have issues.
                  </p>
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        emailError 
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Enter your email address"
                      autoFocus
                    />
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-600">{emailError}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    We'll send password reset instructions to this email address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 inline" />
                      Send Reset Instructions
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Additional Links */}
            {submitStatus !== 'success' && (
              <div className="text-center mt-6 pt-6 border-t border-gray-100 space-y-2">
                <p className="text-gray-600 text-sm">
                  Remember your password?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Sign in here
                  </Link>
                </p>
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Sign up here
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you're having trouble resetting your password, our support team is here to help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;