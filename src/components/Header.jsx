import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Zap, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { initializeCursorTrail, initializeHeaderEffects, initializeScrollProgress } from '../utils/headerEffects';
import Avatar from './Avatar';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();
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
    setIsUserMenuOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div 
        className="scroll-indicator" 
        style={{ width: `${scrollProgress}%` }}
      />
      
      <header className="bg-gradient-to-r from-teal-50/95 via-cyan-50/95 to-blue-50/95 backdrop-blur-enhanced shadow-lg border-b border-white/20 sticky top-0 z-50 relative">
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
                  Prepaid Bundles
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/esim" className="nav-link-clean group relative px-3 py-2 text-gray-900 hover:text-cyan-600 font-semibold transition-all duration-300 whitespace-nowrap">
                  eSIM
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/offers" className="nav-link-clean group relative px-3 py-2 text-gray-900 hover:text-cyan-600 font-semibold transition-all duration-300 whitespace-nowrap">
                  Offers
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/support" className="nav-link-clean group relative px-3 py-2 text-gray-900 hover:text-cyan-600 font-semibold transition-all duration-300 whitespace-nowrap">
                  Support
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/faq" className="nav-link-clean group relative px-3 py-2 text-gray-900 hover:text-cyan-600 font-semibold transition-all duration-300 whitespace-nowrap">
                  FAQ
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 whitespace-nowrap pr-1">
              {/* Shopping Cart */}
              <Link to="/checkout" className="relative cart-icon">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl btn-animated shadow-lg">
                  <ShoppingCart size={20} className="text-white relative z-10" />
                </div>
              </Link>

              {/* Top Up Button */}
              <Link to="/bundles" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap">
                <Zap size={18} className="relative z-10" />
                <span className="relative z-10">Top Up Now</span>
              </Link>

              {/* Authentication Section */}
              {isAuthenticated ? (
                <>
                  {/* Desktop user menu */}
                  <div className="relative hidden lg:block z-50 min-w-[220px]">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-3 btn-animated"
                    >
                      <Avatar name={user?.name} src={user?.avatar} sizeClasses="w-8 h-8" rounded="rounded-lg" />
                      <span className="font-accent font-medium text-gray-700 max-w-[120px] xl:max-w-[180px] truncate">{user?.name}</span>
                      <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="user-dropdown absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[60]">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-accent font-semibold text-gray-900">{user?.name}</p>
                          <p className="font-caption text-sm text-gray-500">{user?.email}</p>
                        </div>
                        
                        <Link 
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-accent transition-colors nav-link"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={18} />
                          My Profile
                        </Link>
                        
                        <Link 
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-accent transition-colors nav-link"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings size={18} />
                          Settings
                        </Link>
                        
                        <hr className="my-2" />
                        
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-accent transition-colors w-full text-left nav-link"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sign Out on desktop (align with user menu) */}
                  <button 
                    onClick={handleLogout}
                    className="hidden lg:inline-flex items-center gap-2 px-3 py-3 border border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-800 rounded-xl transition-all"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                    <span className="hidden xl:inline">Sign Out</span>
                  </button>

                  {/* Quick Sign Out on tablet/mobile */}
                  <button 
                    onClick={handleLogout}
                    className="lg:hidden p-3 rounded-xl hover:bg-gray-100"
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut size={22} className="text-gray-700" />
                  </button>
                </>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <Link 
                    to="/login"
                    className="px-4 py-3 text-gray-900 hover:text-cyan-600 font-semibold border border-gray-300 hover:border-cyan-500 rounded-xl transition-all duration-300 hover:shadow-md whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
                  >
                    <span className="relative z-10">Sign Up</span>
                  </Link>
                </div>
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
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar name={user?.name} src={user?.avatar} sizeClasses="w-10 h-10" rounded="rounded-lg" />
                      <div>
                        <p className="font-accent font-semibold text-gray-900">{user?.name}</p>
                        <p className="font-caption text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    
                    <Link 
                      to="/profile"
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 font-accent font-medium py-2 nav-link" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      My Profile
                    </Link>
                    
                    <Link 
                      to="/settings"
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 font-accent font-medium py-2 nav-link" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings size={18} />
                      Settings
                    </Link>
                    
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 text-red-600 hover:text-red-700 font-accent font-medium py-2 w-full text-left nav-link"
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