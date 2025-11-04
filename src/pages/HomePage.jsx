import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Smartphone, Zap, Shield, Clock, Globe, Check, Star, QrCode, Phone, MessageCircle, CheckCircle, Settings, BarChart3, User } from 'lucide-react';
import AnimatedPhone from '../components/AnimatedPhone';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

const HomePage = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [featuredPromotion, setFeaturedPromotion] = useState(null);

  // Fetch featured promotion for the phone display
  useEffect(() => {
    fetchFeaturedPromotion();
  }, []);

  const fetchFeaturedPromotion = async () => {
    try {
      console.log('Fetching featured promotion...');
      const response = await fetch(`${API_BASE_URL}/admin/promotions/featured`);
      console.log('Featured promotion response:', response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log('Featured promotion data:', data);
        
        // Try different possible structures
        let promotionToUse = null;
        
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          promotionToUse = data.data[0];
          console.log('Using promotion from data.data[0]:', promotionToUse);
        } else if (data.promotions && Array.isArray(data.promotions) && data.promotions.length > 0) {
          promotionToUse = data.promotions[0];
          console.log('Using promotion from data.promotions[0]:', promotionToUse);
        } else if (Array.isArray(data) && data.length > 0) {
          promotionToUse = data[0];
          console.log('Using promotion from data[0]:', promotionToUse);
        }
        
        if (promotionToUse) {
          console.log('Setting featured promotion:', promotionToUse);
          setFeaturedPromotion(promotionToUse);
        } else {
          console.log('No featured promotions found');
        }
      }
    } catch (error) {
      console.error('Error fetching featured promotion:', error);
    }
  };

  // Redirect business users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user?.accountType === 'BUSINESS') {
      console.log('Business user detected on HomePage, redirecting to retailer dashboard...');
      navigate('/retailer/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  const features = [
    {
      icon: <Zap size={48} className="text-white" />,
      title: "Choose your plan",
      description: "Select from our range of Lycamobile bundles and eSIM packages"
    },
    {
      icon: <Shield size={48} className="text-white" />,
      title: "Pay securely online", 
      description: "Safe and secure payment with multiple payment options"
    },
    {
      icon: <QrCode size={48} className="text-white" />,
      title: "Get instant PIN / QR via email",
      description: "Receive your activation code instantly in your email"
    }
  ];

  const phoneImageStyle = {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
    borderRadius: '2rem',
    padding: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-300 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-float-reverse"></div>
          <div className="absolute top-10 right-1/4 w-32 h-32 bg-blue-300 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-teal-200 rounded-full blur-2xl animate-float-slow"></div>
        </div>

        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            {/* Left Content */}
            <div className="hero-content text-left">
              <h1 className="hero-title font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                Instant Mobile Recharge<br />
                <span className="text-blue-900">&</span> eSIM Activation <br />
                <span className="text-blue-900">Anytime, Anywhere.</span>
              </h1>
              
              <p className="hero-subtitle font-body text-xl md:text-2xl text-white/90 mb-8 font-light leading-relaxed">
                Get your Lycamobile PIN codes and eSIM activations instantly. 
                Fast, secure, and reliable mobile top-up service available 24/7.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/bundles?filter=esim" className="btn-primary font-accent text-lg px-8 py-4">
                  Buy eSIM Now
                  <ArrowRight size={20} />
                </Link>
                <Link to="/bundles" className="btn-secondary font-accent text-lg px-8 py-4">
                  Recharge Lycamobile
                  <Phone size={20} />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-accent font-medium">4.9/5 rating</span>
                </div>
                <div className="h-4 w-px bg-white/30"></div>
                <div className="text-sm font-accent font-medium">50,000+ happy customers</div>
              </div>
            </div>

            {/* Right Content - Animated Phone with Hand */}
            <div className="relative flex justify-center lg:justify-end scale-110 md:scale-125 lg:scale-150">
              <AnimatedPhone promotion={featuredPromotion} />
            </div>
          </div>
        </div>
      </section>

      {/* Existing Customer Section - Only show for unauthenticated users */}
      {!isAuthenticated && (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content - Plans Display */}
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Existing customers: Pay as you go bundles</h2>
                  <p className="text-gray-600">Renew current bundle, upgrade or buy a new bundle</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Lyca Smart S Plan */}
                  <div className="bg-white rounded-3xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Lyca Smart S</h3>
                      
                      {/* Data Display */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-12 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="text-3xl font-bold text-gray-900">1GB</div>
                          <div className="text-sm text-gray-600">Data</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-2xl font-bold text-gray-900">kr99.00</div>
                          <div className="text-sm text-gray-600">/30 days</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>Unlimited national minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>100* Minutes to United Kingdom and more</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>1GB EU Roaming Data</span>
                        </div>
                      </div>

                      <div className="text-center mb-4">
                        <Link 
                          to="/bundles" 
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View more
                        </Link>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-2xl font-medium text-sm hover:bg-gray-50">
                          Add to basket
                        </button>
                        <button className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium text-sm">
                          Buy now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lyca Smart XL Plan */}
                  <div className="bg-white rounded-3xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                    {/* Discount Badge */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                      3 Months Price Discount !
                    </div>
                    
                    <div className="p-6 pt-12">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Lyca Smart XL</h3>
                      
                      {/* Data Display */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-12 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="text-3xl font-bold text-gray-900">30GB</div>
                          <div className="text-sm text-gray-600">Data</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-sm line-through text-gray-400">kr225.00</div>
                          <div className="text-2xl font-bold text-gray-900">kr99.00</div>
                          <div className="text-sm text-gray-600">/30 days</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>Unlimited national minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>Unlimited minutes to UK, EU, USA, Canada, India and China</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="text-green-500" size={16} />
                          <span>30GB EU Roaming Data</span>
                        </div>
                      </div>

                      <div className="text-center mb-4">
                        <Link 
                          to="/bundles" 
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View more
                        </Link>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-2xl font-medium text-sm hover:bg-gray-50">
                          Add to basket
                        </button>
                        <button className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium text-sm">
                          Buy now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Existing Customer Panel */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Are you an existing customer?</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="text-blue-600" size={20} />
                      <span>Renew current plan</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="text-blue-600" size={20} />
                      <span>View upgrade options</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="text-blue-600" size={20} />
                      <span>Add a new plan</span>
                    </div>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your LycaMobile number
                  </label>
                  <div className="flex">
                    <div className="bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-600 text-sm">
                      +47
                    </div>
                    <input 
                      type="tel" 
                      placeholder="Enter a LycaMobile number"
                      className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    By continuing I agree to <span className="text-blue-600 cursor-pointer hover:underline">Terms & Conditions</span>, and <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span> of LycaMobile
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/customer/dashboard"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-center transition-colors flex items-center justify-center gap-2"
                  >
                    Renew/upgrade my plan with one time passcode
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold text-center transition-colors flex items-center justify-center gap-2"
                  >
                    Continue without one time passcode
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dashboard Navigation for Authenticated Users */}
      {isAuthenticated && (
        <section className="py-12 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
          <div className="container-custom">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-gray-600">Access your dashboard and manage your account</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {isAdmin() && (
                <Link 
                  to="/admin"
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Settings size={20} />
                  Admin Dashboard
                  <ArrowRight size={16} />
                </Link>
              )}
              
              {user?.accountType === 'BUSINESS' && (
                <Link 
                  to="/retailer/dashboard"
                  className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <BarChart3 size={20} />
                  Retailer Dashboard
                  <ArrowRight size={16} />
                </Link>
              )}
              
              {user?.accountType === 'PERSONAL' && (
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/customer/dashboard"
                    className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <User size={20} />
                    Customer Dashboard
                    <ArrowRight size={16} />
                  </Link>
                  <Link 
                    to="/bundles"
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Smartphone size={20} />
                    Browse Bundles
                    <ArrowRight size={16} />
                  </Link>
                  <Link 
                    to="/esim"
                    className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <QrCode size={20} />
                    Get eSIM
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your mobile top-up or eSIM in just 3 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card card-hover text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300 animate-glow">
                    {feature.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* eSIM Promotional Banner */}
      <section className="section-padding bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-6 border border-white/30">
                <Smartphone className="w-5 h-5" />
                <span className="text-sm font-semibold font-accent">NEW: Digital SIM</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
                Go Digital with <br />Lycamobile eSIM
              </h2>
              <p className="text-xl mb-8 text-white/90 font-body leading-relaxed max-w-2xl">
                No physical SIM card needed! Get your QR code instantly via email and activate your plan in minutes. 
                Perfect for travelers and dual-SIM users.
              </p>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="font-medium font-body">Instant QR Code Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="font-medium font-body">Activate in Minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="font-medium font-body">Norway + EU Coverage</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="font-medium font-body">Dual SIM Support</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <Link 
                  to="/esim" 
                  className="px-8 py-4 bg-white hover:bg-gray-100 text-teal-600 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-heading text-lg inline-flex items-center justify-center gap-2"
                >
                  <Smartphone size={24} />
                  Learn More About eSIM
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/bundles?filter=esim" 
                  className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-heading text-lg inline-flex items-center justify-center gap-2 border-2 border-white/30"
                >
                  <QrCode size={24} />
                  View eSIM Plans
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Animated Phone Mockup */}
                <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/30 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  {/* QR Code Visual */}
                  <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center p-8 shadow-xl">
                    <QrCode className="w-full h-full text-gray-800" strokeWidth={1} />
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-lg font-bold mb-2">Scan & Activate</p>
                    <p className="text-sm text-white/80">Delivered instantly to your email</p>
                  </div>
                </div>

                {/* Floating Icons */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl animate-float">
                  <Zap className="w-8 h-8 text-teal-600" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                  <Globe className="w-8 h-8 text-cyan-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 text-gray-900 relative overflow-hidden border-t border-gray-100">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-64 h-64 bg-teal-200 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-200 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="container-custom text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-gray-800">
            Ready to Top Up Your Lycamobile?
          </h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto font-body leading-relaxed">
            Get your ePIN in seconds. Fast, easy, and secure mobile recharge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/bundles" className="bg-white border-2 border-cyan-300 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-400 font-semibold px-10 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-3 font-accent text-lg">
              Browse Bundles
              <ArrowRight size={20} />
            </Link>
            <Link to="/bundles?filter=esim" className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 font-semibold px-10 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-3 font-accent text-lg">
              Get eSIM Now
              <Globe size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;