import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// This component wraps the BrowserRouter with future flags enabled
export const EnhancedBrowserRouter = ({ children }) => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {children}
    </BrowserRouter>
  );
};