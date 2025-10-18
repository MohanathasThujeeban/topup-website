import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, CheckCircle, Building, Globe } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactMethods = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "WhatsApp Support",
      description: "Get instant help via WhatsApp messaging",
      contact: "+47 xxx xxx xxx",
      hours: "24/7 Available",
      type: "whatsapp",
      color: "from-green-500 to-emerald-600",
      action: "Chat Now"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Support",
      description: "Send us detailed inquiries and get comprehensive responses",
      contact: "support@easytopup.no",
      hours: "Response within 2-4 hours",
      type: "email",
      color: "from-blue-500 to-cyan-600",
      action: "Send Email"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Phone Support",
      description: "Speak directly with our customer service team",
      contact: "+47 xxx xxx xxx",
      hours: "Mon-Fri 8:00-18:00 (Norwegian Time)",
      type: "phone",
      color: "from-purple-500 to-indigo-600",
      action: "Call Now"
    }
  ];

  const officeInfo = {
    address: {
      street: "Karl Johans gate 1",
      city: "0154 Oslo",
      country: "Norway"
    },
    businessHours: [
      { day: "Monday - Friday", hours: "08:00 - 18:00" },
      { day: "Saturday", hours: "10:00 - 16:00" },
      { day: "Sunday", hours: "Closed" }
    ],
    businessInfo: {
      organizationNumber: "123 456 789",
      vatNumber: "NO123456789MVA",
      email: "info@easytopup.no"
    }
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
    console.log('Contact form submitted:', formData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6 font-display">
              Get in <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 font-body leading-relaxed">
              We're here to help! Whether you have questions about our services or need support with your order, our team is ready to assist you.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Clock className="w-5 h-5 text-cyan-500" />
                <span className="text-gray-700 font-medium">24/7 WhatsApp Support</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Globe className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700 font-medium">Multi-language Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-heading">Choose Your Preferred Contact Method</h2>
            <p className="text-xl text-gray-600 font-body">We offer multiple ways to reach us for your convenience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div key={index} className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20">
                <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  {React.cloneElement(method.icon, { className: "w-8 h-8 text-white" })}
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-3 font-heading">{method.title}</h3>
                <p className="text-gray-600 mb-4 font-body">{method.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">Contact:</span>
                    <span className="font-mono">{method.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{method.hours}</span>
                  </div>
                </div>

                <button className={`w-full py-3 bg-gradient-to-r ${method.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                  {method.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Office Info */}
      <section className="py-16 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 font-heading">Send us a Message</h2>
                
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all duration-300"
                          placeholder="Enter your name"
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all duration-300"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all duration-300"
                      >
                        <option value="">Select a subject</option>
                        <option value="order-inquiry">Order Inquiry</option>
                        <option value="technical-support">Technical Support</option>
                        <option value="payment-issue">Payment Issue</option>
                        <option value="business-inquiry">Business/Retailer Inquiry</option>
                        <option value="general-question">General Question</option>
                        <option value="feedback">Feedback/Suggestion</option>
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 transition-all duration-300 resize-none"
                        placeholder="Tell us how we can help you..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Message Sent Successfully!</h3>
                    <p className="text-gray-600">Thank you for contacting us. We'll get back to you within 2-4 hours.</p>
                  </div>
                )}
              </div>

              {/* Office Information */}
              <div className="space-y-8">
                
                {/* Office Address */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 font-heading flex items-center gap-3">
                    <Building className="w-6 h-6 text-cyan-600" />
                    Our Office
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">EasyTopup.no AS</p>
                        <p className="text-gray-600">{officeInfo.address.street}</p>
                        <p className="text-gray-600">{officeInfo.address.city}</p>
                        <p className="text-gray-600">{officeInfo.address.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 font-heading flex items-center gap-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Business Hours
                  </h3>
                  
                  <div className="space-y-3">
                    {officeInfo.businessHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">{schedule.day}</span>
                        <span className="text-gray-600">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <p className="text-green-800 text-sm font-medium">
                      💬 WhatsApp support is available 24/7 for urgent inquiries!
                    </p>
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 font-heading">Business Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Organization Number</span>
                      <span className="font-mono text-gray-800">{officeInfo.businessInfo.organizationNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">VAT Number</span>
                      <span className="font-mono text-gray-800">{officeInfo.businessInfo.vatNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Business Email</span>
                      <span className="font-mono text-gray-800">{officeInfo.businessInfo.email}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center font-heading">Before You Contact Us</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-3">📋 For Faster Support</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Include your order number if inquiring about a purchase</li>
                  <li>• Mention your registered email address</li>
                  <li>• Describe the issue clearly with step-by-step details</li>
                  <li>• Attach screenshots if relevant</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-gray-800 mb-3">❓ Check First</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• Visit our FAQ page for common questions</li>
                  <li>• Check your email spam/junk folder</li>
                  <li>• Verify your eSIM device compatibility</li>
                  <li>• Review your account dashboard for order status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;