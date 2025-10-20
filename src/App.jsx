import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import HomePage from './pages/HomePage';
import BundlesPage from './pages/BundlesPage';
import ESIMPage from './pages/eSIMPage';
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
import RetailerOrderConfirmationPage from './pages/RetailerOrderConfirmationPage';
import AdminDashboard from './pages/AdminDashboard';
import RequireBusiness from './components/RequireBusiness';
// Signup flow pages
import AccountTypeSelectionPage from './pages/AccountTypeSelectionPage';
import PersonalRegistrationPage from './pages/PersonalRegistrationPage';
import BusinessRegistrationPage from './pages/BusinessRegistrationPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bundles" element={<BundlesPage />} />
            <Route path="/esim" element={<ESIMPage />} />
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
            {/* B2B (Retailer) */}
            <Route path="/retailer/login" element={<RetailerLoginPage />} />
            <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
            <Route path="/retailer/order/:orderId/confirmation" element={<RequireBusiness><RetailerOrderConfirmationPage /></RequireBusiness>} />
            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppWidget />
      </div>
    </AuthProvider>
  );
}

export default App;
