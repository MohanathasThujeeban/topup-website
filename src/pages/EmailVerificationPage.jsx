import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mail, CheckCircle, XCircle, RefreshCw, ArrowLeft, 
  Clock, AlertCircle, Send 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerification, isLoading } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error, expired
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    // Get email from location state or URL params
    const emailFromState = location.state?.email;
    const emailFromUrl = emailParam;
    const finalEmail = emailFromState || emailFromUrl || '';
    
    setEmail(finalEmail);
    setMessage(location.state?.message || '');

    // If there's a token in the URL, automatically verify
    if (token) {
      handleVerification(token);
    }
  }, [token, emailParam, location.state]);

  const handleVerification = async (verificationToken) => {
    try {
      console.log('Starting verification process');
      setVerificationStatus('pending');
      
      // Directly grab email from URL params to ensure it's available immediately
      const emailFromParams = searchParams.get('email') || '';
      const emailToUse = email || emailFromParams;
      
      console.log(`Verifying token: ${verificationToken} Email: ${emailToUse}`);
      
      if (!emailToUse) {
        console.log('No email found for verification');
        setVerificationStatus('error');
        setMessage('Missing email address. Please check your verification link or try again.');
        return;
      }
      
      // Update email state first to ensure it's available
      setEmail(emailToUse);
      
      // Call API to verify email
      console.log('Calling verification API...');
      const result = await verifyEmail(verificationToken, emailToUse);
      console.log('Verification API response:', result);
      
      if (result.success) {
        console.log('VERIFICATION SUCCESSFUL - Setting status to success');
        // Update state with success information
        setMessage('Your email has been successfully verified! You can now log in to your account.');
        
        // Explicitly set status in state
        setVerificationStatus('success');
        
        // Delay redirect to ensure user sees success state
        console.log('Scheduling redirect after successful verification');
        setTimeout(() => {
          console.log('Redirecting to login page now');
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! You can now log in.',
              email: emailToUse,
              verified: true
            } 
          });
        }, 5000); // Increased to 5 seconds to ensure user sees success message
      } else {
        console.log('VERIFICATION FAILED - Setting status:', result.message?.includes('expired') ? 'expired' : 'error');
        
        if (result.message?.includes('expired')) {
          setVerificationStatus('expired');
          setMessage('The verification link has expired. Please request a new one.');
        } else {
          setVerificationStatus('error');
          setMessage(result.message || 'Email verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setMessage(error.message || 'Something went wrong during verification.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Email address is required to resend verification.');
      return;
    }

    setIsResending(true);
    
    try {
      const result = await resendVerification(email);
      
      if (result.success) {
        setMessage('Verification email sent! Please check your inbox and spam folder.');
        setResendCooldown(60); // 60 seconds cooldown
        
        // Start countdown timer
        const timer = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setMessage(result.message || 'Failed to resend verification email.');
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong while resending verification.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />;
      case 'error':
      case 'expired':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto" />;
      case 'pending':
      default:
        return <Mail className="w-16 h-16 text-blue-500 mx-auto" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      case 'expired':
        return 'Verification Link Expired';
      case 'pending':
      default:
        return 'Check Your Email';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      case 'pending':
      default:
        return 'text-blue-600';
    }
  };

  console.log('Rendering with verification status:', verificationStatus);
  
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
            to="/" 
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            {/* Icon */}
            <div className="mb-6">
              {getStatusIcon()}
            </div>

            {/* Title */}
            <h1 className={`text-3xl font-bold mb-4 ${getStatusColor()}`}>
              {getStatusTitle()}
            </h1>

            {/* Debug info - remove in production */}
            <div className="p-2 bg-gray-100 text-xs text-left rounded mb-2 hidden">
              <p>Status: {verificationStatus}</p>
              <p>Email: {email}</p>
              <p>Token: {token ? 'Present' : 'Not present'}</p>
            </div>

            {/* Message */}
            <div className="mb-8">
              {message && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {message}
                </p>
              )}
              
              {!token && email && verificationStatus === 'pending' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">Waiting for verification</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    We've sent a verification email to <strong>{email}</strong>. 
                    Please check your inbox and click the verification link.
                  </p>
                </div>
              )}
            </div>

            {/* Actions based on status */}
            {verificationStatus === 'success' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Redirecting to login page in a few seconds...</span>
                </div>
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <h3 className="font-semibold text-green-800 mb-2">Verification Successful!</h3>
                  <p className="text-green-700">
                    Your email has been verified successfully. You can now log in to your account and enjoy all the features.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                  state={{ email: email }}
                >
                  Go to Login
                </Link>
              </div>
            )}

            {(verificationStatus === 'error' || verificationStatus === 'expired') && email && (
              <div className="space-y-4">
                {/* Resend Verification */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Need a new verification email?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Didn't receive the email? Check your spam folder or request a new verification email.
                  </p>
                  
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending || resendCooldown > 0}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                </div>

                {/* Alternative Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    state={{ email: email }}
                  >
                    Back to Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Create New Account
                  </Link>
                </div>
              </div>
            )}

            {verificationStatus === 'pending' && token && (
              <div className="space-y-4">
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="flex justify-center mb-3">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="font-semibold text-blue-800 mb-2">Verifying Your Email</h3>
                  <p className="text-blue-700">
                    Please wait while we verify your email address. This may take a few moments...
                  </p>
                </div>
              </div>
            )}

            {!email && verificationStatus !== 'success' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Email address not found. Please check your registration email or try signing up again.</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign Up Again
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you're having trouble with email verification, our support team is here to help.
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

export default EmailVerificationPage;