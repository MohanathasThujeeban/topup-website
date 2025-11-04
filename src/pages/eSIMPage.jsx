import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Zap, 
  Globe, 
  QrCode, 
  Mail, 
  Shield, 
  Clock, 
  CheckCircle2,
  Wifi,
  Plane,
  Users,
  Download,
  Settings,
  MessageCircle,
  ArrowRight,
  Loader
} from 'lucide-react';
import { API_CONFIG } from '../config/api';

const ESIMPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // State for eSIM bundles from API
  const [esimPlans, setEsimPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch eSIM bundles from stock pool
  useEffect(() => {
    const fetchEsimBundles = async () => {
      try {
        setLoading(true);
        const apiUrl = `${API_CONFIG.BASE_URL}/public/bundles?type=ESIM`;
        console.log('Fetching eSIM bundles from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response. Backend may not be running.');
        }
        
        const data = await response.json();
        console.log('eSIM bundles response:', data);

        if (data.success && data.bundles) {
          // Transform API response to match card component structure
          const transformedPlans = data.bundles.map((bundle, index) => {
            // Extract data/calls/sms from productName or description
            const productName = bundle.productName || '';
            const description = bundle.description || '';
            
            // Parse data amount (e.g., "5GB", "1GB", "30GB")
            const dataMatch = productName.match(/(\d+)\s*(GB|MB)/i) || description.match(/(\d+)\s*(GB|MB)/i);
            const dataAmount = dataMatch ? `${dataMatch[1]}${dataMatch[2].toUpperCase()}` : 'Data included';
            
            // Parse calls (e.g., "Unlimited", "100 Minutes")
            const callsMatch = productName.match(/(unlimited|(\d+)\s*min)/i) || description.match(/(unlimited|(\d+)\s*min)/i);
            const calls = callsMatch ? (callsMatch[1].toLowerCase() === 'unlimited' ? 'Unlimited' : callsMatch[0]) : 'Unlimited';
            
            // Parse validity (e.g., "30 Days", "7 Days")
            const validityMatch = productName.match(/(\d+)\s*day/i) || description.match(/(\d+)\s*day/i);
            const validity = validityMatch ? `${validityMatch[1]} days` : '30 days';

            return {
              id: bundle.id,
              name: bundle.productName,
              data: dataAmount,
              price: bundle.denomination,
              originalPrice: null, // Can add discount logic later if needed
              calls: calls,
              sms: 'Unlimited',
              validity: validity,
              popular: index === 1, // Make second plan popular (if exists)
              features: [
                'Instant activation', 
                'No physical SIM needed', 
                description || 'Great value plan'
              ],
              availableQuantity: bundle.availableQuantity
            };
          });

          setEsimPlans(transformedPlans);
        } else {
          setError('No eSIM bundles available');
        }
      } catch (err) {
        console.error('Error fetching eSIM bundles:', err);
        setError('Failed to load eSIM plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEsimBundles();
  }, []);

  const esimFeatures = [
    {
      icon: <Zap className="w-8 h-8 text-teal-500" />,
      title: "Instant Delivery",
      description: "Get your eSIM QR code via email within seconds after payment"
    },
    {
      icon: <QrCode className="w-8 h-8 text-cyan-500" />,
      title: "Easy Activation",
      description: "Simply scan the QR code to activate your eSIM instantly"
    },
    {
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      title: "Global Coverage",
      description: "Stay connected in Norway and across Europe with reliable network"
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: "Secure & Safe",
      description: "Protected transactions with Vipps, Klarna, and major payment methods"
    },
    {
      icon: <Wifi className="w-8 h-8 text-teal-500" />,
      title: "High-Speed Data",
      description: "Enjoy fast 4G/5G data speeds for streaming, browsing, and more"
    },
    {
      icon: <Clock className="w-8 h-8 text-cyan-500" />,
      title: "Flexible Validity",
      description: "Choose from various validity periods that suit your needs"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Choose Your eSIM Plan",
      description: "Browse our eSIM bundles and select the perfect plan for your data needs",
      icon: <Smartphone className="w-6 h-6" />
    },
    {
      step: "2",
      title: "Complete Payment",
      description: "Pay securely with Vipps, Klarna, PayPal, or your credit card",
      icon: <Shield className="w-6 h-6" />
    },
    {
      step: "3",
      title: "Receive QR Code",
      description: "Get your eSIM activation QR code and details instantly via email",
      icon: <Mail className="w-6 h-6" />
    },
    {
      step: "4",
      title: "Scan & Activate",
      description: "Open your phone settings, scan the QR code, and you're connected!",
      icon: <QrCode className="w-6 h-6" />
    }
  ];

  const esimBenefits = [
    {
      icon: <Plane className="w-6 h-6" />,
      title: "Perfect for Travelers",
      description: "No need to swap physical SIM cards when traveling"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Dual SIM Support",
      description: "Keep your primary number while using eSIM for data"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Instant Setup",
      description: "No shipping, no waiting - activate in minutes"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Easy to Manage",
      description: "Switch between eSIM profiles directly from settings"
    }
  ];

  const compatibleDevices = [
    "iPhone XS, XR and newer models",
    "Samsung Galaxy S20 and newer",
    "Google Pixel 3 and newer",
    "Huawei P40 and newer",
    "iPad Pro 11-inch (3rd gen) and newer",
    "Apple Watch Series 3 and newer"
  ];

  const faqs = [
    {
      question: "What is an eSIM?",
      answer: "An eSIM (embedded SIM) is a digital SIM that allows you to activate a mobile plan without using a physical SIM card. It's built into your device and can be activated remotely."
    },
    {
      question: "Is my device eSIM compatible?",
      answer: "Most modern smartphones support eSIM. Check your device settings or our compatibility list above. iPhones from XS onwards, Samsung Galaxy S20+, and Google Pixel 3+ all support eSIM."
    },
    {
      question: "How do I receive my eSIM?",
      answer: "After successful payment, you'll immediately receive an email with your eSIM QR code and activation instructions. The delivery is instant!"
    },
    {
      question: "Can I use eSIM while keeping my regular SIM?",
      answer: "Yes! Most devices support dual SIM functionality, allowing you to use both your physical SIM and eSIM simultaneously. Perfect for keeping your main number while using data abroad."
    },
    {
      question: "How do I activate my eSIM?",
      answer: "Simply go to Settings → Mobile Data → Add Data Plan (or similar on your device), scan the QR code from your email, and follow the on-screen instructions."
    },
    {
      question: "What if I don't receive my eSIM email?",
      answer: "Check your spam/junk folder first. If you still can't find it, contact us immediately via WhatsApp and we'll resend your eSIM details within minutes."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8 border border-teal-200">
              <Smartphone className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-semibold text-gray-700 font-accent">Digital SIM Technology</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-display">
              <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                eSIM Plans
              </span>
              <br />
              <span className="text-blue-900">Delivered Instantly</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-10 font-body leading-relaxed max-w-3xl mx-auto">
              Get your <span className="font-semibold text-teal-600">Lycamobile eSIM</span> via email in seconds. 
              No physical SIM needed. Just scan, activate, and stay connected!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                to="/esim/dashboard" 
                className="group px-8 py-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-heading flex items-center gap-2 text-lg"
              >
                <QrCode size={24} />
                Manage My eSIM
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 font-body">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-500" />
                <span>Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span>24/7 WhatsApp Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* eSIM Plans Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gray-900">
              Choose Your <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">eSIM Plan</span>
            </h2>
            <p className="text-xl text-gray-600 font-body">Instant delivery, no physical SIM required</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader className="w-12 h-12 text-teal-500 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Loading available eSIM plans...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="max-w-md mx-auto bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Wifi className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Unable to Load Plans</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* eSIM Plans Grid */}
          {!loading && !error && esimPlans.length === 0 && (
            <div className="max-w-md mx-auto bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <QrCode className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Plans Available</h3>
              <p className="text-gray-600">eSIM plans are currently out of stock. Please check back soon!</p>
            </div>
          )}

          {!loading && !error && esimPlans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {esimPlans.map((plan) => (
                <div key={plan.id} className={`relative bg-white border-2 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-xl' 
                    : 'border-gray-200 hover:border-blue-300 shadow-lg'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">kr{plan.price}</span>
                        {plan.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">kr{plan.originalPrice}</span>
                        )}
                      </div>
                      {plan.originalPrice && (
                        <div className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold mt-2">
                          Save kr{plan.originalPrice - plan.price}
                        </div>
                      )}
                      <p className="text-gray-600 mt-1">{plan.validity}</p>
                    </div>

                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-6">
                      <QrCode className="text-white" size={32} />
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-700">Data</span>
                      <span className="text-2xl font-bold text-green-600">{plan.data}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-700">Calls</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-green-600" size={16} />
                        <span className="font-medium text-green-600">{plan.calls}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-700">SMS</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-green-600" size={16} />
                        <span className="font-medium text-green-600">{plan.sms}</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="mb-6 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                      <CheckCircle2 size={16} />
                      1 eSIM available
                    </span>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-3">Features included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Link
                      to="/bundles?filter=esim"
                      className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      Get eSIM Now
                      <ArrowRight size={18} />
                    </Link>
                    <Link
                      to="/bundles?filter=esim"
                      className="w-full py-3 px-6 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      Add to Basket
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <Zap className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div className="text-left">
                  <h3 className="font-bold text-blue-900 mb-2">Instant eSIM Delivery</h3>
                  <p className="text-blue-800">
                    Your eSIM QR code will be delivered to your email immediately after payment. 
                    No waiting for physical delivery - activate your eSIM in seconds!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gray-900">
              Why Choose Our <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">eSIM?</span>
            </h2>
            <p className="text-xl text-gray-600 font-body">Everything you need for seamless connectivity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {esimFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-100 hover:border-teal-200 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 font-heading">{feature.title}</h3>
                <p className="text-gray-600 font-body leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gray-900">
              Get Your eSIM in <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">4 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 font-body">From purchase to activation in minutes</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative">
                  {/* Connection Line (hidden on mobile) */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-teal-300 to-cyan-300 transform translate-x-4 -translate-y-1/2 z-0"></div>
                  )}
                  
                  <div className="relative z-10 text-center">
                    {/* Step Number */}
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl font-display shadow-xl">
                      {step.step}
                    </div>
                    
                    {/* Step Icon */}
                    <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-lg border border-teal-100">
                      {step.icon}
                    </div>

                    {/* Step Content */}
                    <h3 className="text-lg font-bold mb-2 text-gray-900 font-heading">{step.title}</h3>
                    <p className="text-gray-600 text-sm font-body leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gray-900">
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">eSIM Benefits</span>
              </h2>
              <p className="text-xl text-gray-600 font-body">Modern connectivity for modern lifestyles</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {esimBenefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex items-start gap-6 group border border-gray-100 hover:border-teal-200"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center text-teal-600 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 font-heading">{benefit.title}</h3>
                    <p className="text-gray-600 font-body leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compatible Devices */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-semibold text-teal-700 font-accent">Device Compatibility</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gray-900">
                Check Your <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Device</span>
              </h2>
              <p className="text-xl text-gray-600 font-body">Most modern smartphones support eSIM technology</p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-10 shadow-xl border border-teal-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {compatibleDevices.map((device, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-teal-500 flex-shrink-0" />
                    <span className="text-gray-700 font-body font-medium">{device}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="text-gray-600 font-body mb-4">Not sure if your device supports eSIM?</p>
                <a 
                  href="https://wa.me/YOUR_WHATSAPP_NUMBER" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-accent"
                >
                  <MessageCircle size={20} />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gray-900">
                Frequently Asked <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-600 font-body">Everything you need to know about eSIM</p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200"
                >
                  <h3 className="text-xl font-bold mb-3 text-gray-900 font-heading flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      Q
                    </span>
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 font-body leading-relaxed ml-11">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <QrCode className="w-20 h-20 mx-auto mb-6 animate-float" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
              Ready to Go Digital?
            </h2>
            <p className="text-xl md:text-2xl mb-10 font-body opacity-90">
              Get your Lycamobile eSIM delivered instantly to your email. 
              <br className="hidden md:block" />
              No physical SIM required. Activate in minutes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/bundles?filter=esim" 
                className="px-10 py-5 bg-white hover:bg-gray-100 text-teal-600 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-heading text-lg flex items-center justify-center gap-2"
              >
                <Smartphone size={24} />
                Browse eSIM Plans
                <ArrowRight size={20} />
              </Link>
              <a 
                href="https://wa.me/YOUR_WHATSAPP_NUMBER" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-10 py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-heading text-lg flex items-center justify-center gap-2 border-2 border-white/30"
              >
                <MessageCircle size={24} />
                Get Help on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ESIMPage;
