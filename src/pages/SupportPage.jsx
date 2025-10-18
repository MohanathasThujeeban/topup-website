import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, Users, Building, Send, CheckCircle, Headphones } from 'lucide-react';

const SupportPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const supportChannels = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "WhatsApp Support",
      description: "Get instant help via WhatsApp",
      contact: "+47 xxx xxx xxx",
      hours: "24/7 Available",
      type: "whatsapp",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Support",
      description: "Send us detailed inquiries",
      contact: "support@easytopup.no",
      hours: "Response within 2-4 hours",
      type: "email",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+47 xxx xxx xxx",
      hours: "Mon-Fri 8:00-18:00",
      type: "phone",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const personalSupport = {
    title: "Personal Customer Support",
    subtitle: "B2C Support Channel",
    description: "Get help with your personal account, purchases, and general inquiries.",
    categories: [
      "Order Issues",
      "Payment Problems",
      "Account Questions",
      "Technical Support",
      "Product Information",
      "Refund Requests"
    ]
  };

  const businessSupport = {
    title: "Retailer Support",
    subtitle: "B2B Support Channel",
    description: "Dedicated support for our retail partners and business customers.",
    categories: [
      "Account Setup",
      "Credit Limit Issues",
      "Invoice Questions",
      "Bulk Orders",
      "API Integration",
      "Partnership Inquiries"
    ]
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'general',
        message: ''
      });
    }, 3000);
  };

  const currentSupport = selectedCategory === 'personal' ? personalSupport : businessSupport;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <Headphones className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6 font-display">
              We're Here to <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Help</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 font-body leading-relaxed">
              Get support for your account, orders, and any questions you might have. Our team is ready to assist you 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Support Type Selection */}
      <section className="py-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSelectedCategory('personal')}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedCategory === 'personal'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg hover:scale-105'
              }`}
            >
              <Users className="w-5 h-5" />
              Personal Support (B2C)
            </button>
            <button
              onClick={() => setSelectedCategory('business')}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedCategory === 'business'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg hover:scale-105'
              }`}
            >
              <Building className="w-5 h-5" />
              Retailer Support (B2B)
            </button>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-heading">{currentSupport.title}</h2>
            <p className="text-xl text-gray-600 font-body">{currentSupport.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {supportChannels.map((channel, index) => (
              <div key={index} className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20">
                <div className={`w-16 h-16 bg-gradient-to-br ${channel.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  {React.cloneElement(channel.icon, { className: "w-8 h-8 text-white" })}
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-3 font-heading">{channel.title}</h3>
                <p className="text-gray-600 mb-4 font-body">{channel.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">Contact:</span>
                    <span>{channel.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{channel.hours}</span>
                  </div>
                </div>

                <button className={`w-full py-3 bg-gradient-to-r ${channel.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                  Contact Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-heading">Send us a Message</h2>
              <p className="text-xl text-gray-600 font-body">Fill out the form below and we'll get back to you as soon as possible</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                      >
                        {currentSupport.categories.map((category, index) => (
                          <option key={index} value={category.toLowerCase().replace(/\s+/g, '-')}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows="5"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 resize-none"
                        placeholder="Describe your issue or question in detail..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Message Sent!</h3>
                    <p className="text-gray-600">Thank you for contacting us. We'll get back to you within 2-4 hours.</p>
                  </div>
                )}
              </div>

              {/* Support Info */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 font-heading">Response Times</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">WhatsApp</span>
                      <span className="font-semibold text-green-600">Instant</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email</span>
                      <span className="font-semibold text-blue-600">2-4 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-semibold text-purple-600">During business hours</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 font-heading">Common Categories</h3>
                  <div className="space-y-2">
                    {currentSupport.categories.map((category, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>{category}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border border-yellow-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Quick Tip</h3>
                  <p className="text-gray-600">
                    For faster support, please include your order number or account email in your message.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;