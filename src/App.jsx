import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import HomePage from './pages/HomePage';
import BundlesPage from './pages/BundlesPage';
import ESIMPage from './pages/eSIMPage';
import ESIMDashboardPage from './pages/ESIMDashboardPage';
import ESIMActivationPage from './pages/ESIMActivationPage';
import OffersPage from './pages/OffersPage';
import SupportPage from './pages/SupportPage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RetailerLoginPage from './pages/RetailerLoginPage';
import RetailerDashboard from './pages/RetailerDashboard';
import RetailerPurchasePage from './pages/RetailerPurchasePage';
import RetailerOrderConfirmationPage from './pages/RetailerOrderConfirmationPage';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import RequireBusiness from './components/RequireBusiness';
import RequireAdmin from './components/RequireAdmin';
// Signup flow pages
import AccountTypeSelectionPage from './pages/AccountTypeSelectionPage';
import PersonalRegistrationPage from './pages/PersonalRegistrationPage';
import BusinessRegistrationPage from './pages/BusinessRegistrationPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function AppLayout() {
  const location = useLocation();
  
  // Define routes that should not have header and footer (dashboard-only routes)
  const dashboardRoutes = ['/admin', '/retailer/dashboard', '/customer/dashboard', '/esim/dashboard'];
  const isDashboardRoute = dashboardRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboardRoute && <Header />}
      <main className={isDashboardRoute ? "min-h-screen" : "flex-grow"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bundles" element={<BundlesPage />} />
          <Route path="/esim" element={<ESIMPage />} />
          <Route path="/esim/dashboard" element={<ESIMDashboardPage />} />
          <Route path="/esim/activate" element={<ESIMActivationPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Signup flow */}
          <Route path="/signup" element={<AccountTypeSelectionPage />} />
          <Route path="/signup/personal" element={<PersonalRegistrationPage />} />
          <Route path="/signup/business" element={<BusinessRegistrationPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Customer Dashboard */}
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          {/* B2B (Retailer) */}
          <Route path="/retailer/login" element={<RetailerLoginPage />} />
          <Route path="/retailer/dashboard" element={<RequireBusiness><RetailerDashboard /></RequireBusiness>} />
          <Route path="/retailer/purchase" element={<RequireBusiness><RetailerPurchasePage /></RequireBusiness>} />
          <Route path="/retailer/order/:orderId/confirmation" element={<RequireBusiness><RetailerOrderConfirmationPage /></RequireBusiness>} />
          {/* Admin */}
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
      {!isDashboardRoute && <WhatsAppWidget />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
