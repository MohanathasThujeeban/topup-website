import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API Base URL - Dynamically set based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Skip token verification for admin users (local admin account)
        if (userData.accountType !== 'ADMIN') {
          // Verify token is still valid by making a request to the backend
          verifyToken(storedToken);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const verifyToken = async (token) => {
    try {
      // Skip verification for admin tokens
      if (token.startsWith('admin-token-')) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Token is invalid, logout user
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // On network error, don't logout immediately
    }
  };

  // Personal Account Registration
  const registerPersonal = async (userData) => {
    try {
      console.log('Sending registration request to:', `${API_BASE_URL}/auth/register/personal`);
      console.log('Registration data:', { ...userData, password: '[HIDDEN]' });
      
      const response = await fetch(`${API_BASE_URL}/auth/register/personal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log('Registration response:', { status: response.status, data });

      if (response.ok) {
        return { success: true, data: data };
      } else {
        // Try to get detailed error message
        const errorMessage = data.message || data.error || 
          (data.errors ? JSON.stringify(data.errors) : 'Registration failed');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: `Network error: ${error.message}` };
    }
  };

  // Business Account Registration
  const registerBusiness = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.message || 'Business registration failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Login Function
  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        const { user: userData, token } = data;
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Email Verification
  const verifyEmail = async (token, email) => {
    try {
      console.log(`AuthContext: Verifying email with token: ${token} and email: ${email}`);
      
      // Sanitize inputs - ensure we have clean values
      if (token && typeof token === 'string') {
        token = token.trim();
      }
      
      if (email && typeof email === 'string') {
        email = email.trim();
      }
      
      // Ensure both token and email are present
      if (!token || !email) {
        console.log("AuthContext: Missing verification info - token:", token, "email:", email);
        return { 
          success: false, 
          message: "Missing verification information. Please check your verification link or try again."
        };
      }
      
      // Make the API call with properly encoded parameters
      console.log(`AuthContext: Making verification request to: ${API_BASE_URL}/auth/verify-email`);
      
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&_t=${timestamp}`;
      
      console.log(`AuthContext: Request URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });

      console.log(`AuthContext: Response status:`, response.status);
      const data = await response.json();
      console.log('AuthContext: Verification API response:', data);

      if (response.ok) {
        // Clear success flag to ensure state is properly updated
        console.log('AuthContext: Verification SUCCESSFUL');
        return { 
          success: true, 
          message: data.message || 'Email verified successfully!',
          data: data
        };
      } else {
        console.log('AuthContext: Verification FAILED');
        let errorMessage = data.message || 'Email verification failed';
        let isExpired = errorMessage.toLowerCase().includes('expired');
        
        return { 
          success: false, 
          message: errorMessage,
          expired: isExpired
        };
      }
    } catch (error) {
      console.error('AuthContext: Verification error:', error);
      return { 
        success: false, 
        message: error.message || 'Network error. Please try again.',
        error: error 
      };
    }
  };

  // Resend Verification Email
  const resendVerification = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Failed to resend verification email' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Send Password Reset Email
  const sendPasswordReset = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Failed to send reset email' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Reset Password
  const resetPassword = async (resetData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resetData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Password reset failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isAdmin = () => {
    return user?.accountType === 'ADMIN' || user?.role === 'ADMIN';
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    logout,
    updateUser,
    registerPersonal,
    registerBusiness,
    verifyEmail,
    resendVerification,
    sendPasswordReset,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
