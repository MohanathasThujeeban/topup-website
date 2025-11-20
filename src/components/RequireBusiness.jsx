import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireBusiness({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // DEMO MODE: Bypass authentication for development testing
  const isDemoMode = process.env.NODE_ENV === 'development' && location.search.includes('demo=true');
  
  if (isDemoMode) {
    console.log('🚧 DEMO MODE: Bypassing authentication for testing');
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/retailer/login" state={{ from: location }} replace />;
  }
  if (!user || user.accountType !== 'BUSINESS') {
    return <Navigate to="/retailer/login" state={{ from: location, reason: 'not-business' }} replace />;
  }
  return children;
}
