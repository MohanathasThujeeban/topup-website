import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, MessageCircle, Zap } from 'lucide-react';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqCategories = [
    { key: 'all', label: 'All FAQs', icon: HelpCircle },
    { key: 'account', label: 'Account & Registration', icon: '👤' },
    { key: 'orders', label: 'Orders & Payments', icon: '🛒' },
    { key: 'esim', label: 'eSIM', icon: '📱' },
    { key: 'prepaid', label: 'Prepaid Bundles', icon: '💳' },
    { key: 'technical', label: 'Technical Support', icon: '🔧' },
    { key: 'business', label: 'Business/Retailer', icon: '🏢' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: "How do I create an account?",
      answer: "You can create an account by clicking the 'Sign Up' button in the top right corner. You'll need to provide your name, email, mobile number, and create a password. For personal accounts, email verification is required. For business accounts, additional verification through BankID or admin approval may be needed."
    },
    {
      id: 2,
      category: 'account',
      question: "What's the difference between personal and business accounts?",
      answer: "Personal accounts are for individual customers (B2C) and offer standard purchase options with various payment methods. Business accounts are for retailers (B2B) and include features like credit limits, invoice payments, bulk ordering, and special retailer rewards."
    },
    {
      id: 3,
      category: 'account',
      question: "Can I change my account type after registration?",
      answer: "Yes, you can upgrade from a personal to business account by contacting our support team. You'll need to provide business documentation and may need to go through the business verification process."
    },
    {
      id: 4,
      category: 'orders',
      question: "How do I place an order?",
      answer: "Browse our bundles or eSIM options, select your desired products (you can add 1-5 items per product type), add them to cart, proceed to checkout, enter your billing details, and complete payment. You'll receive confirmation and delivery emails immediately."
    },
    {
      id: 5,
      category: 'orders',
      question: "What payment methods do you accept?",
      answer: "For personal accounts: Vipps, Stripe, major credit/debit cards with 3D Secure authentication. For business accounts: Invoice payments only, with predefined credit limits. Payment options may vary based on your location."
    },
    {
      id: 6,
      category: 'orders',
      question: "How long does delivery take?",
      answer: "All our products are delivered instantly via email. ePINs and eSIM QR codes are sent immediately after successful payment confirmation. Check your inbox and spam folder if you don't receive it within a few minutes."
    },
    {
      id: 7,
      category: 'orders',
      question: "Can I cancel or refund my order?",
      answer: "Due to the digital nature of our products, refunds are generally not available once the PIN or eSIM has been delivered. However, if you experience technical issues or receive an invalid product, contact our support team immediately for assistance."
    },
    {
      id: 8,
      category: 'esim',
      question: "What is an eSIM and how does it work?",
      answer: "An eSIM (embedded SIM) is a digital SIM card built into your device. Instead of inserting a physical SIM card, you scan a QR code to download the carrier profile. It allows you to have multiple carrier profiles on one device and easily switch between them."
    },
    {
      id: 9,
      category: 'esim',
      question: "Is my device eSIM compatible?",
      answer: "Most modern smartphones support eSIM: iPhone XS/XR and newer, Samsung Galaxy S20 and newer, Google Pixel 3 and newer, recent Huawei and OnePlus models. Check your device settings under 'Mobile Data' or 'Cellular' to see if you have an 'Add Data Plan' option."
    },
    {
      id: 10,
      category: 'esim',
      question: "How do I activate my eSIM?",
      answer: "After purchase, you'll receive an email with a QR code. Go to Settings > Mobile Data > Add Data Plan (iOS) or Settings > Connections > SIM Manager > Add Mobile Plan (Android), scan the QR code, and follow the setup instructions. Your eSIM will be activated within minutes."
    },
    {
      id: 11,
      category: 'esim',
      question: "Can I use eSIM alongside my regular SIM?",
      answer: "Yes! Most eSIM-compatible devices support dual SIM functionality. You can keep your primary physical SIM active while using the eSIM for data, which is perfect for travelers or those wanting separate personal and business lines."
    },
    {
      id: 12,
      category: 'prepaid',
      question: "How do I use my prepaid bundle PIN?",
      answer: "After purchasing a prepaid bundle, you'll receive a PIN code via email. Follow the activation instructions provided with your PIN - typically this involves dialing a specific number or using the carrier's app/website to enter your PIN and activate your bundle."
    },
    {
      id: 13,
      category: 'prepaid',
      question: "Do prepaid bundles expire?",
      answer: "Yes, prepaid bundles have validity periods (usually 30 days) from activation. The exact validity is shown on each product page and in your confirmation email. Make sure to activate your bundle before the expiry date mentioned in your purchase."
    },
    {
      id: 14,
      category: 'prepaid',
      question: "Can I buy multiple bundles at once?",
      answer: "Yes, you can purchase 1-5 units of each bundle type in a single order. This is useful for families or if you want to stock up on bundles. Each bundle will have its own unique PIN code."
    },
    {
      id: 15,
      category: 'technical',
      question: "I didn't receive my email with the PIN/eSIM code",
      answer: "First, check your spam/junk folder. If it's not there, wait 10-15 minutes as there might be a slight delay. If you still don't receive it, contact our WhatsApp support immediately with your order number, and we'll resend your codes within minutes."
    },
    {
      id: 16,
      category: 'technical',
      question: "My PIN code isn't working",
      answer: "Ensure you're entering the PIN correctly and that it hasn't expired. Check that you're following the activation instructions for your specific carrier. If the problem persists, contact our technical support with your order details."
    },
    {
      id: 17,
      category: 'technical',
      question: "My eSIM won't activate",
      answer: "Make sure your device is eSIM compatible and connected to WiFi. Try scanning the QR code again ensuring good lighting. Check that you haven't already used this eSIM profile. If issues continue, contact support for a replacement QR code."
    },
    {
      id: 18,
      category: 'business',
      question: "How do credit limits work for business accounts?",
      answer: "Business accounts have predefined credit limits (NOK 2500, 5000, 7500, 10000, 15000, 20000). You'll receive notifications at 90% and 100% usage. Higher limits may appear blurred until your current limit is increased by admin after payment."
    },
    {
      id: 19,
      category: 'business',
      question: "How do I increase my credit limit?",
      answer: "Credit limits are increased after invoice payments are confirmed through our Tripletex integration. Contact our business support team to discuss limit increases or to expedite the process after making payments."
    },
    {
      id: 20,
      category: 'business',
      question: "How do retailer rewards work?",
      answer: "Retailers earn rewards for eSIM activations and meeting purchase targets within 14-21 day periods. Rewards can be redeemed for future purchases. Specific campaigns and targets are managed through the admin dashboard and communicated via your account."
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6 font-display">
              Frequently Asked <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Questions</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 font-body leading-relaxed">
              Find quick answers to common questions about our services, accounts, and products.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border-0 shadow-xl focus:ring-4 focus:ring-emerald-100 focus:outline-none text-gray-700 bg-white/90 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {faqCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.key
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg hover:scale-105'
                }`}
              >
                {typeof category.icon === 'string' ? (
                  <span className="text-lg">{category.icon}</span>
                ) : (
                  <category.icon className="w-4 h-4" />
                )}
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">No FAQs found</h3>
                <p className="text-gray-500">Try adjusting your search or category filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50/50 rounded-2xl transition-all duration-300"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
                        {faq.question}
                      </h3>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0 group-hover:text-emerald-500 transition-colors duration-300" />
                      )}
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div className="px-8 pb-6">
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-gray-600 leading-relaxed font-body">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4 font-heading">Still Need Help?</h2>
            <p className="text-xl text-white/90 mb-8 font-body">
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center justify-center gap-3 bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                <MessageCircle className="w-5 h-5" />
                WhatsApp Support
              </button>
              <button className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                <Zap className="w-5 h-5" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;