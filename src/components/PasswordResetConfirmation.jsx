import React from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordResetConfirmation = ({ email, onResend }) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-6 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-4 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Password Reset Email Sent
      </h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
        <p className="text-blue-800 text-sm">
          We've sent password reset instructions to:
        </p>
        <p className="font-mono bg-white px-3 py-2 rounded mt-2 text-blue-700 font-semibold text-center break-all">
          {email}
        </p>
      </div>
      
      <p className="text-gray-600 mb-6">
        Please check your email inbox and follow the instructions to reset your password. The link will expire in 24 hours.
      </p>
      
      <div className="space-y-4">
        <button
          onClick={onResend}
          className="w-full py-3 flex items-center justify-center border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Resend Instructions
        </button>
        
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Login
        </button>
      </div>
      
      <div className="mt-6 text-gray-500 text-sm">
        <p>
          Didn't receive the email? Check your spam folder or try again with a different email address.
        </p>
      </div>
    </div>
  );
};

export default PasswordResetConfirmation;