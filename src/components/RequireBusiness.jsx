import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireBusiness({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/retailer/login" state={{ from: location }} replace />;
  }
  if (!user || user.accountType !== 'BUSINESS') {
    return <Navigate to="/retailer/login" state={{ from: location, reason: 'not-business' }} replace />;
  }
  return children;
}
