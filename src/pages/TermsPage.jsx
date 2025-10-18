import React from 'react';
import { Shield, FileText, Calendar, AlertTriangle } from 'lucide-react';

const TermsPage = () => {
  const lastUpdated = "October 15, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-300/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-600 rounded-full flex items-center justify-center shadow-2xl">
                <FileText className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6 font-display">
              Terms & <span className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent">Conditions</span>
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-8">
              <Calendar className="w-5 h-5" />
              <span>Last updated: {lastUpdated}</span>
            </div>
            
            <p className="text-xl text-gray-600 font-body leading-relaxed">
              Please read these terms and conditions carefully before using our services.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl">
              
              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-amber-800 mb-2">Important Notice</h3>
                    <p className="text-amber-700">
                      By using our website and services, you agree to be bound by these terms and conditions. 
                      If you do not agree to these terms, please do not use our services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                
                {/* Section 1 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">1. Acceptance of Terms</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Welcome to EasyTopup.no. These Terms and Conditions ("Terms") govern your use of our website 
                    and services provided by EasyTopup.no ("we," "us," or "our"). By accessing or using our services, 
                    you agree to be bound by these Terms.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    We reserve the right to modify these Terms at any time. Changes will be effective immediately 
                    upon posting to our website. Your continued use of our services after any changes constitutes 
                    acceptance of the new Terms.
                  </p>
                </section>

                {/* Section 2 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">2. Service Description</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    EasyTopup.no provides instant digital delivery services for:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Lycamobile prepaid bundle PINs</li>
                    <li>eSIM activation codes and QR codes</li>
                    <li>Mobile top-up services</li>
                    <li>Related telecommunications products</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    All products are delivered electronically via email immediately after successful payment confirmation.
                  </p>
                </section>

                {/* Section 3 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">3. Account Registration</h2>
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Personal Accounts (B2C)</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Must provide accurate personal information</li>
                    <li>Email verification required for account activation</li>
                    <li>One account per person to prevent fraudulent activity</li>
                    <li>Must be 18 years or older to create an account</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Business Accounts (B2B)</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Must provide valid business registration details</li>
                    <li>Subject to verification through BankID or manual admin approval</li>
                    <li>Must have valid VAT number and business address</li>
                    <li>Credit limits apply as determined by our system</li>
                  </ul>
                </section>

                {/* Section 4 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">4. Orders and Payments</h2>
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Order Process</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>You may purchase 1-5 units per product type in a single order</li>
                    <li>All orders are subject to availability and acceptance</li>
                    <li>We reserve the right to refuse or cancel any order</li>
                    <li>Order confirmation will be sent via email</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Payment Methods</h3>
                  <p className="text-gray-600 leading-relaxed mb-2"><strong>Personal Accounts:</strong></p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                    <li>Vipps, Stripe, major credit/debit cards</li>
                    <li>3D Secure authentication required for card payments</li>
                    <li>Payment methods may vary based on geographic location</li>
                  </ul>

                  <p className="text-gray-600 leading-relaxed mb-2"><strong>Business Accounts:</strong></p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Invoice payments only with predefined credit limits</li>
                    <li>Payment terms as agreed in business agreement</li>
                    <li>Integration with Tripletex accounting system</li>
                  </ul>
                </section>

                {/* Section 5 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">5. Digital Product Delivery</h2>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>All products are delivered instantly via email after payment confirmation</li>
                    <li>Delivery includes PIN codes for prepaid bundles or QR codes for eSIM</li>
                    <li>You are responsible for providing a valid email address</li>
                    <li>Check spam/junk folders if you don't receive delivery email</li>
                    <li>Contact support immediately if delivery is not received within 15 minutes</li>
                  </ul>
                </section>

                {/* Section 6 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">6. Refunds and Returns</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Due to the instant digital nature of our products, refunds are generally not available once 
                    PIN codes or eSIM profiles have been delivered. However, we will provide refunds or 
                    replacements in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Technical error resulting in invalid PIN or eSIM code</li>
                    <li>Duplicate delivery due to system error</li>
                    <li>Product not delivered within 24 hours of payment</li>
                    <li>Unauthorized transaction with proof of fraud</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    All refund requests must be submitted within 7 days of purchase with supporting documentation.
                  </p>
                </section>

                {/* Section 7 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">7. User Obligations</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">You agree to:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Provide accurate and current information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Use our services only for lawful purposes</li>
                    <li>Not attempt to circumvent our security measures</li>
                    <li>Not engage in fraudulent activities</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </section>

                {/* Section 8 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">8. Limitation of Liability</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    To the maximum extent permitted by law, EasyTopup.no shall not be liable for:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>Indirect, incidental, special, or consequential damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Service interruptions or technical difficulties</li>
                    <li>Third-party carrier network issues</li>
                    <li>Misuse of purchased products by the user</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    Our total liability shall not exceed the amount paid for the specific product in question.
                  </p>
                </section>

                {/* Section 9 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">9. Privacy and Data Protection</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We are committed to protecting your privacy and complying with GDPR and other applicable 
                    data protection laws. Our Privacy Policy, which forms part of these Terms, describes:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                    <li>What information we collect and how we use it</li>
                    <li>How we protect your personal data</li>
                    <li>Your rights regarding your personal information</li>
                    <li>How to contact us about privacy concerns</li>
                  </ul>
                </section>

                {/* Section 10 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">10. Governing Law and Jurisdiction</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    These Terms are governed by Norwegian law. Any disputes arising from these Terms or 
                    your use of our services shall be subject to the exclusive jurisdiction of Norwegian courts.
                  </p>
                </section>

                {/* Section 11 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 font-heading">11. Contact Information</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    If you have any questions about these Terms, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <ul className="space-y-2 text-gray-600">
                      <li><strong>Email:</strong> legal@easytopup.no</li>
                      <li><strong>WhatsApp:</strong> +47 xxx xxx xxx</li>
                      <li><strong>Address:</strong> [Company Address], Norway</li>
                    </ul>
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

export default TermsPage;