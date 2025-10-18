import React from 'react';
import { Shield, Lock, Eye, Database, Calendar, AlertTriangle, Mail, Phone } from 'lucide-react';

const PrivacyPage = () => {
  const lastUpdated = "October 15, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6 font-display">
              Privacy <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-8">
              <Calendar className="w-5 h-5" />
              <span>Last updated: {lastUpdated}</span>
            </div>
            
            <p className="text-xl text-gray-600 font-body leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* GDPR Compliance Notice */}
      <section className="py-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-green-800 mb-2">GDPR Compliant</h3>
                  <p className="text-green-700">
                    We are fully compliant with the General Data Protection Regulation (GDPR) and other applicable 
                    data protection laws. Your rights and data security are our top priority.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl">

              <div className="prose prose-lg max-w-none">
                
                {/* Section 1 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-600" />
                    1. Information We Collect
                  </h2>
                  
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Personal Information</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We collect the following personal information when you use our services:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                    <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                    <li><strong>Business Information:</strong> Company name, VAT number, organization number, business address</li>
                    <li><strong>Payment Information:</strong> Billing address, payment method details (processed by secure third-party providers)</li>
                    <li><strong>Order Information:</strong> Purchase history, product preferences, delivery details</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Automatically Collected Information</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                    <li><strong>Location Data:</strong> IP-based geolocation (country, region, city)</li>
                    <li><strong>Device Information:</strong> Device type, browser type, operating system</li>
                    <li><strong>Usage Data:</strong> Pages visited, session duration, interaction patterns</li>
                    <li><strong>Technical Data:</strong> IP address, browser language, timezone settings</li>
                  </ul>
                </section>

                {/* Section 2 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading flex items-center gap-3">
                    <Eye className="w-6 h-6 text-indigo-600" />
                    2. How We Use Your Information
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We use your personal information for the following purposes:
                  </p>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Service Provision</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Process and deliver your orders (PIN codes, eSIM activation)</li>
                    <li>Manage your account and provide customer support</li>
                    <li>Send order confirmations and delivery notifications</li>
                    <li>Process payments and prevent fraud</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Business Operations</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Verify business accounts and manage credit limits</li>
                    <li>Generate invoices and manage accounting (Tripletex integration)</li>
                    <li>Track retailer rewards and commission programs</li>
                    <li>Analyze sales performance and user behavior</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Geo-Location Services</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Customize payment gateway options based on location</li>
                    <li>Provide localized content and language preferences</li>
                    <li>Detect potential VPN/proxy usage for fraud prevention</li>
                    <li>Generate geographical analytics for business insights</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Communication</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Respond to customer inquiries and support requests</li>
                    <li>Send important account and service notifications</li>
                    <li>Provide promotional offers and marketing communications (with consent)</li>
                    <li>Deliver newsletters and product updates</li>
                  </ul>
                </section>

                {/* Section 3 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading flex items-center gap-3">
                    <Lock className="w-6 h-6 text-purple-600" />
                    3. Data Protection and Security
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We implement comprehensive security measures to protect your personal information:
                  </p>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Technical Safeguards</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>SSL/TLS encryption for all data transmission</li>
                    <li>Secure server infrastructure with regular security updates</li>
                    <li>Multi-layer authentication for admin access</li>
                    <li>Regular security audits and vulnerability assessments</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Payment Security</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>PCI DSS compliant payment processing</li>
                    <li>Tokenization of payment card data</li>
                    <li>3D Secure authentication for card transactions</li>
                    <li>Fraud detection and prevention systems</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Access Controls</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Role-based access control for staff members</li>
                    <li>Regular access reviews and permission audits</li>
                    <li>Secure data backup and recovery procedures</li>
                    <li>Employee training on data protection practices</li>
                  </ul>
                </section>

                {/* Section 4 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">4. Data Sharing and Third Parties</h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We may share your information with trusted third parties in the following circumstances:
                  </p>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Service Providers</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li><strong>Payment Processors:</strong> Vipps, Stripe, and other authorized payment gateways</li>
                    <li><strong>Email Services:</strong> For order confirmations and customer communications</li>
                    <li><strong>Accounting System:</strong> Tripletex for invoice processing and financial management</li>
                    <li><strong>Customer Support:</strong> WhatsApp Business API for support communications</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Legal Requirements</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>When required by law or legal process</li>
                    <li>To protect our rights, property, or safety</li>
                    <li>To prevent fraud or illegal activities</li>
                    <li>With your explicit consent</li>
                  </ul>

                  <p className="text-gray-600 leading-relaxed">
                    <strong>We never sell, rent, or trade your personal information to third parties for marketing purposes.</strong>
                  </p>
                </section>

                {/* Section 5 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">5. Your Rights (GDPR)</h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Under GDPR and applicable data protection laws, you have the following rights:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">📋 Right of Access</h4>
                      <p className="text-sm text-gray-600">Request a copy of your personal data we hold</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">✏️ Right to Rectification</h4>
                      <p className="text-sm text-gray-600">Correct any inaccurate or incomplete data</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">🗑️ Right to Erasure</h4>
                      <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">⏸️ Right to Restrict Processing</h4>
                      <p className="text-sm text-gray-600">Limit how we use your data</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">📤 Right to Data Portability</h4>
                      <p className="text-sm text-gray-600">Receive your data in a structured format</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">❌ Right to Object</h4>
                      <p className="text-sm text-gray-600">Object to processing of your data</p>
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    To exercise any of these rights, please contact our Data Protection Officer using the 
                    contact information provided below.
                  </p>
                </section>

                {/* Section 6 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">6. Data Retention</h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We retain your personal information only as long as necessary for the purposes outlined 
                    in this policy:
                  </p>

                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li><strong>Account Information:</strong> Until account deletion or 3 years of inactivity</li>
                    <li><strong>Transaction Records:</strong> 7 years for accounting and legal compliance</li>
                    <li><strong>Support Communications:</strong> 2 years for quality assurance</li>
                    <li><strong>Marketing Data:</strong> Until consent withdrawal or 2 years of inactivity</li>
                    <li><strong>Analytics Data:</strong> Anonymized after 13 months</li>
                  </ul>
                </section>

                {/* Section 7 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">7. International Data Transfers</h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Your personal data may be transferred to and processed in countries outside the European 
                    Economic Area (EEA). We ensure adequate protection through:
                  </p>

                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>European Commission adequacy decisions</li>
                    <li>Standard Contractual Clauses (SCCs)</li>
                    <li>Certification schemes and codes of conduct</li>
                    <li>Binding Corporate Rules for multinational providers</li>
                  </ul>
                </section>

                {/* Section 8 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">8. Cookies and Tracking</h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We use cookies and similar technologies to enhance your browsing experience:
                  </p>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Essential Cookies</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                    <li>Authentication and security</li>
                    <li>Shopping cart functionality</li>
                    <li>Session management</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Analytics Cookies</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                    <li>Website performance analysis</li>
                    <li>User behavior understanding</li>
                    <li>Service improvement</li>
                  </ul>

                  <p className="text-gray-600 leading-relaxed">
                    You can control cookie preferences through your browser settings or our cookie consent banner.
                  </p>
                </section>

                {/* Contact Section */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">9. Contact Information</h2>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    If you have any questions about this Privacy Policy or wish to exercise your rights, 
                    please contact us:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        Data Protection Officer
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li><strong>Email:</strong> privacy@easytopup.no</li>
                        <li><strong>Subject:</strong> "GDPR Request" or "Privacy Inquiry"</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-600" />
                        General Support
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li><strong>WhatsApp:</strong> +47 xxx xxx xxx</li>
                        <li><strong>Email:</strong> support@easytopup.no</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-blue-800">
                      <strong>Response Time:</strong> We will respond to privacy-related requests within 30 days 
                      as required by GDPR. For urgent matters, please mark your message as "Urgent Privacy Request."
                    </p>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;