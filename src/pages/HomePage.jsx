import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Zap, Shield, Clock, Globe, Check, Star, QrCode, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import AnimatedPhone from '../components/AnimatedPhone';

const HomePage = () => {
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
              <AnimatedPhone />
            </div>
          </div>
        </div>
      </section>

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