import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Zap, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { initializeCursorTrail, initializeHeaderEffects, initializeScrollProgress } from '../utils/headerEffects';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { user, isAuthenticated, isAdmin, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  // Initialize all effects
  useEffect(() => {
    const cleanupCursor = initializeCursorTrail();
    const cleanupScroll = initializeScrollProgress();
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeHeaderEffects();
    }, 100);

    return () => {
      cleanupCursor();
      cleanupScroll();
      clearTimeout(timer);
    };
  }, []);

  // Scroll progress indicator
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div 
        className="scroll-indicator" 
        style={{ width: `${scrollProgress}%` }}
      />
      
      <header className="bg-gradient-to-r from-teal-50/95 via-cyan-50/95 to-blue-50/95 backdrop-blur-enhanced shadow-lg border-b border-white/20 sticky top-0 z-[90] relative">
        {/* Floating Particles */}
        <div className="header-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20 gap-3">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group logo-container flex-shrink-0">
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center logo-icon shadow-lg overflow-hidden">
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                
                {/* Icon container with rotation effect */}
                <div className="relative z-10 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-7 h-7 text-white drop-shadow-lg" fill="currentColor" />
                </div>
                
                {/* Sparkle effect on hover */}
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
              </div>
              <span className="text-2xl font-display font-bold logo-text whitespace-nowrap">
                TopUp Pro
              </span>
            </Link>

            {/* Navigation - Centered */}
            <nav className="hidden lg:flex items-center justify-center flex-1 mx-6 xl:mx-8">
              <div className="flex items-center gap-5 xl:gap-7">
                <Link to="/" className="nav-link-clean group relative px-3 py-2 text-gray-900 hover:text-cyan-600 font-semibold transition-all duration-300 whitespace-nowrap">
                  Home
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/bundles" className="nav-link-clean group relative px-3 py-2 text-gray-900 hover:text-cyan-600 font-semibold transition-all duration-300 whitespace-nowrap">
                  Prepaid bundles
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/esim" className="nav-link-clean group relative px-3 py-2 text-gray-900 hover:text-cyan-600 font-semibold transition-all duration-300 whitespace-nowrap">
                  eSIM
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/about" className="nav-link-clean group relative px-3 py-2 text-gray-900 hover:text-cyan-600 font-semibold transition-all duration-300 whitespace-nowrap">
                  About us
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/support" className="nav-link-clean group relative px-3 py-2 text-gray-900 hover:text-cyan-600 font-semibold transition-all duration-300 whitespace-nowrap">
                  Support
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0 whitespace-nowrap">
              {/* Shopping Cart */}
              <Link to="/checkout" className="relative cart-icon">
                <div className="p-2 lg:p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl btn-animated shadow-lg">
                  <ShoppingCart size={18} className="text-white relative z-10" />
                </div>
              </Link>

              {/* Top Up Button */}
              <Link to="/bundles" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap text-sm lg:text-base">
                <Zap size={16} className="relative z-10" />
                <span className="relative z-10">Top Up Now</span>
              </Link>

              {/* Authentication Section */}
              {isAuthenticated && !isLoading ? (
                <>
                  {/* Authenticated user - mobile */}
                  <div className="lg:hidden flex items-center gap-2">
                    {isAdmin() && (
                      <Link 
                        to="/admin"
                        className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm"
                        title="Admin Dashboard"
                      >
                        <Settings size={18} />
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600"
                      aria-label="Sign out"
                      title="Sign out"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>

                  {/* Authenticated user - desktop */}
                  <div className="hidden lg:flex items-center gap-2">
                    {isAdmin() && (
                      <Link 
                        to="/admin"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 border border-purple-300 text-purple-700 rounded-lg transition-all font-medium text-sm whitespace-nowrap"
                      >
                        <Settings size={16} />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 hover:border-red-400 text-red-700 hover:text-red-800 rounded-lg transition-all font-semibold text-sm whitespace-nowrap shadow-sm"
                      title="Sign out"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Not authenticated - Mobile */}
                  <div className="flex lg:hidden items-center gap-2">
                    <Link 
                      to="/login"
                      className="px-3 py-2 text-gray-700 hover:text-cyan-600 font-medium border border-gray-300 hover:border-cyan-500 rounded-lg transition-all duration-300 text-sm whitespace-nowrap"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup"
                      className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-sm whitespace-nowrap"
                    >
                      Sign Up
                    </Link>
                  </div>

                  {/* Not authenticated - Desktop */}
                  <div className="hidden lg:flex items-center gap-3">
                    <Link 
                      to="/login"
                      className="px-4 py-2.5 text-gray-700 hover:text-cyan-600 font-semibold border-2 border-gray-300 hover:border-cyan-500 rounded-lg transition-all duration-300 hover:shadow-md whitespace-nowrap"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup"
                      className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 rounded-xl hover:bg-gray-100 menu-button"
              >
                {isMobileMenuOpen ? (
                  <X size={24} className="text-gray-700" />
                ) : (
                  <Menu size={24} className="text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-gradient-to-br from-teal-50/95 via-cyan-50/95 to-blue-50/95 backdrop-blur-enhanced border-t border-cyan-200/30 py-6 mobile-menu">
              <nav className="flex flex-col gap-4">
                <Link 
                  to="/" 
                  className="nav-link text-gray-900 hover:text-cyan-600 font-semibold py-3 px-2 rounded-lg hover:bg-white/50 transition-all duration-300" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/bundles" 
                  className="nav-link text-gray-900 hover:text-cyan-600 font-semibold py-3 px-2 rounded-lg hover:bg-white/50 transition-all duration-300" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Prepaid Bundles
                </Link>
                <Link 
                  to="/esim" 
                  className="nav-link text-gray-900 hover:text-cyan-600 font-semibold py-3 px-2 rounded-lg hover:bg-white/50 transition-all duration-300" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  eSIM
                </Link>
                <Link 
                  to="/offers" 
                  className="nav-link text-gray-900 hover:text-cyan-600 font-semibold py-3 px-2 rounded-lg hover:bg-white/50 transition-all duration-300" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Offers
                </Link>
                <Link 
                  to="/support" 
                  className="nav-link text-gray-900 hover:text-cyan-600 font-semibold py-3 px-2 rounded-lg hover:bg-white/50 transition-all duration-300" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Support
                </Link>
                <Link 
                  to="/faq" 
                  className="nav-link text-gray-900 hover:text-cyan-600 font-semibold py-3 px-2 rounded-lg hover:bg-white/50 transition-all duration-300" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                
                {/* Authentication Section for Mobile */}
                {isAuthenticated ? (
                  <div className="border-t border-gray-200 pt-4 mt-2 space-y-3">
                    {isAdmin() && (
                      <Link 
                        to="/admin"
                        className="flex items-center gap-3 text-purple-700 hover:text-purple-800 font-accent font-medium py-3 px-2 nav-link bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" 
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings size={18} />
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 text-red-600 hover:text-red-700 font-accent font-semibold py-3 px-2 w-full text-left nav-link bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 mt-2 space-y-3">
                    <Link 
                      to="/login"
                      className="block text-center text-gray-900 hover:text-cyan-600 font-semibold py-4 border-2 border-gray-300 hover:border-cyan-500 rounded-xl transition-all duration-300 hover:shadow-md" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="relative z-10">Sign In</span>
                    </Link>
                    <Link 
                      to="/signup"
                      className="block text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="relative z-10">Sign Up</span>
                    </Link>
                  </div>
                )}
                
                <Link 
                  to="/bundles" 
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold mt-4 shadow-lg transform hover:scale-[1.02] transition-all duration-300" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Zap size={18} className="relative z-10" />
                  <span className="relative z-10">Top Up Now</span>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;