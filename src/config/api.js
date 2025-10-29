// API Configuration
export const API_CONFIG = {
  // Base URL for backend API
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://topup-backend-production.up.railway.app/api'  // Railway backend URL
    : 'http://localhost:8080/api',
    
  // Frontend URL for email verification links
  FRONTEND_URL: process.env.NODE_ENV === 'production'
    ? 'https://topup-website.vercel.app'     // Update with your Vercel frontend URL
    : 'http://localhost:3000',
    
  // Email configuration
  EMAIL_VERIFICATION_PATH: '/verify-email',
  PASSWORD_RESET_PATH: '/reset-password',
  
  // Timeout settings
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get full frontend URL
export const getFrontendUrl = (path) => {
  return `${API_CONFIG.FRONTEND_URL}${path}`;
};

export default API_CONFIG;