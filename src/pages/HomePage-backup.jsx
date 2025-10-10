import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Zap, Shield, Clock, Globe, Check, Star, QrCode, Phone, MessageCircle, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Zap size={48} className="text-emerald-500" />,
      title: "Choose your plan",
      description: "Select from our range of Lycamobile bundles and eSIM packages"
    },
    {
      icon: <Shield size={48} className="text-cyan-500" />,
      title: "Pay securely online", 
      description: "Safe and secure payment with multiple payment options"
    },
    {
      icon: <QrCode size={48} className="text-blue-500" />,
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
      <section className="hero-section bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-300 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-float-reverse"></div>
          <div className="absolute top-10 right-1/4 w-32 h-32 bg-pink-300 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-emerald-300 rounded-full blur-2xl animate-float-slow"></div>
        </div>

        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            {/* Left Content */}
            <div className="hero-content text-left">
              <h1 className="hero-title text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                Instant Mobile Recharge<br />
                <span className="text-emerald-300">&</span> eSIM Activation —<br />
                <span className="text-cyan-300">Anytime, Anywhere.</span>
              </h1>
              
              <p className="hero-subtitle text-xl md:text-2xl text-white/90 mb-8 font-light leading-relaxed">
                Get your Lycamobile PIN codes and eSIM activations instantly. 
                Fast, secure, and reliable mobile top-up service available 24/7.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/bundles?filter=esim" className="btn-primary text-lg px-8 py-4">
                  Buy eSIM Now
                  <ArrowRight size={20} />
                </Link>
                <Link to="/bundles" className="btn-secondary text-lg px-8 py-4">
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
                  <span className="text-sm font-medium">4.9/5 rating</span>
                </div>
                <div className="h-4 w-px bg-white/30"></div>
                <div className="text-sm font-medium">50,000+ happy customers</div>
              </div>
            </div>

            {/* Right Content - Phone Mockup with Hand */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="phone-mockup relative animate-float-slow">
                {/* Hand holding phone */}
                <div className="relative">
                  {/* Hand SVG */}
                  <div className="absolute -bottom-16 -left-8 w-32 h-24 z-0">
                    <svg 
                      viewBox="0 0 128 96" 
                      className="w-full h-full drop-shadow-xl"
                      style={{
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
                      }}
                    >
                      {/* Hand shape */}
                      <path
                        d="M20 85 Q15 80 15 75 L15 60 Q15 55 20 55 L25 55 Q25 50 25 45 Q25 40 30 40 L35 40 Q35 35 35 30 Q35 25 40 25 L45 25 Q45 20 45 15 Q45 10 50 10 L55 10 Q60 10 60 15 L60 20 Q65 20 65 25 L65 30 Q70 30 70 35 L70 40 Q75 40 75 45 L75 50 Q80 50 80 55 L80 75 Q80 80 75 85 L20 85 Z"
                        fill="#F3E5AB"
                        stroke="#E6D18A"
                        strokeWidth="1"
                      />
                      {/* Thumb */}
                      <ellipse
                        cx="25"
                        cy="70"
                        rx="8"
                        ry="12"
                        fill="#F3E5AB"
                        stroke="#E6D18A"
                        strokeWidth="1"
                        transform="rotate(-20 25 70)"
                      />
                      {/* Fingers definition lines */}
                      <line x1="45" y1="15" x2="45" y2="35" stroke="#E6D18A" strokeWidth="0.5" opacity="0.6"/>
                      <line x1="55" y1="20" x2="55" y2="40" stroke="#E6D18A" strokeWidth="0.5" opacity="0.6"/>
                      <line x1="65" y1="25" x2="65" y2="45" stroke="#E6D18A" strokeWidth="0.5" opacity="0.6"/>
                      <line x1="75" y1="40" x2="75" y2="55" stroke="#E6D18A" strokeWidth="0.5" opacity="0.6"/>
                    </svg>
                  </div>

                  {/* Phone Frame */}
                  <div className="relative w-80 h-96 bg-gray-900 rounded-[3rem] p-3 shadow-2xl z-10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                      {/* Notch */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-full z-10"></div>
                      
                      {/* Screen Content */}
                      <div className="h-full flex items-center justify-center" style={phoneImageStyle}>
                        <div className="text-center">
                          {/* App Logo/Brand */}
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">E</span>
                          </div>
                          
                          {/* QR Code Mockup */}
                          <div className="w-32 h-32 bg-gray-900 rounded-2xl mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
                            <QrCode size={64} className="text-white" />
                            {/* Scanning animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent animate-gradient"></div>
                          </div>
                          
                          {/* Progress bars */}
                          <div className="w-32 mx-auto space-y-2">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="w-3/4 h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <div className="w-2/3 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                              <div className="w-1/2 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                            </div>
                          </div>
                          
                          {/* Status text */}
                          <div className="mt-3 text-xs text-gray-600 font-medium">
                            Activating eSIM...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Floating Elements */}
                <div className="absolute -top-4 -right-4 w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl flex items-center justify-center animate-float z-20">
                  <Check size={28} className="text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl flex items-center justify-center animate-float-reverse z-20">
                  <Zap size={28} className="text-white" />
                </div>
                <div className="absolute top-1/2 -right-8 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-lg flex items-center justify-center animate-float-slow z-20">
                  <Globe size={20} className="text-white" />
                </div>
                
                {/* Notification bubble */}
                <div className="absolute top-8 -left-12 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-xl animate-float z-20 border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">PIN Delivered!</span>
                  </div>
                </div>
              </div>
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
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300 animate-glow">
                    {feature.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
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

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white relative overflow-hidden">
        <div className="container-custom text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-float">
            Ready to Top Up Your Lycamobile?
          </h2>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            Get your ePIN in seconds. Fast, easy, and secure mobile recharge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/bundles" className="btn-secondary bg-white text-purple-600 hover:bg-gray-100 inline-flex text-lg px-8 py-4">
              Browse Bundles
              <ArrowRight size={20} />
            </Link>
            <Link to="/bundles?filter=esim" className="btn-primary bg-gradient-to-r from-emerald-500 to-green-600 text-lg px-8 py-4">
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