import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600 animate-pulse"
            fill="none" 
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V6a3 3 0 00-3-3H9a3 3 0 00-3 3v6m12 0v3a3 3 0 01-3 3H9a3 3 0 01-3-3v-3"
            ></path>
          </svg>
        </div>
      </div>
      <p className="mt-4 text-blue-700 font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;