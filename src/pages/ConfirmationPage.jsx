import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, Hash, Smartphone, Download, MessageCircle, Phone, Star } from 'lucide-react';

const ConfirmationPage = () => {
  const [showActivationGuide, setShowActivationGuide] = useState(false);

  const orderDetails = {
    orderNumber: 'ET-12345',
    date: '08 Oct 2025, 14:32',
    product: 'Lycamobile 5GB ePIN',
    amount: 99,
    paymentMethod: 'Vipps',
    email: 'customer@email.com',
  };

  const handleResendEmail = () => {
    alert('Email resent successfully!');
  };

  return (
    <div className="min-h-screen bg-bgLight animate-fadeIn">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white section-padding">
        <div className="container-custom px-4 text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={64} className="text-success" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl mb-2">Your Lycamobile PIN has been sent to your email</p>
          <p className="text-lg opacity-90">Sent to: {orderDetails.email}</p>
        </div>
      </section>

      {/* Order Details Card */}
      <section className="section-padding">
        <div className="container-custom px-4 max-w-4xl mx-auto">
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Order Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="font-bold text-lg">#{orderDetails.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="font-bold text-lg">{orderDetails.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Product</p>
                <p className="font-bold text-lg">{orderDetails.product}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                <p className="font-bold text-lg text-primary">NOK {orderDetails.amount}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-vipps/10 text-vipps rounded-full font-semibold">
                    {orderDetails.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Section */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Mail size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Check Your Email</h3>
                  <p className="text-gray-600 mb-3">
                    Look for email from support@easytopup.no
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="https://gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Open Gmail
                    </a>
                    <a
                      href="https://outlook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Open Outlook
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                  <Hash size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Find Your PIN Code</h3>
                  <p className="text-gray-600">
                    Your 16-digit PIN will look like: <span className="font-mono font-bold">1234-5678-9101-1121</span>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                  <Smartphone size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Activate Your PIN</h3>
                  <p className="text-gray-600 mb-3">
                    Dial <span className="font-mono font-bold">*123*PIN#</span> on your Lycamobile SIM
                  </p>
                  <button
                    onClick={() => setShowActivationGuide(!showActivationGuide)}
                    className="btn-primary"
                  >
                    How to Activate My PIN
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activation Guide (Collapsible) */}
          {showActivationGuide && (
            <div className="card mb-8 animate-slideUp">
              <h2 className="text-2xl font-bold mb-6">Detailed Activation Guide</h2>
              
              {/* Video Tutorial */}
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-2xl">▶</span>
                  </div>
                  <p className="text-gray-600">Video Tutorial Coming Soon</p>
                </div>
              </div>

              {/* Text Instructions */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Step-by-Step Instructions:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Insert your Lycamobile SIM card into your phone</li>
                    <li>Open your phone's dialer app</li>
                    <li>Type: *123*[YOUR-PIN-CODE]# (without brackets)</li>
                    <li>Press the call button</li>
                    <li>Wait for the confirmation SMS (usually under 2 minutes)</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <h3 className="font-bold mb-2">Common Issues & Solutions:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><strong>No confirmation SMS?</strong> Wait up to 5 minutes and restart your phone</li>
                    <li><strong>Invalid PIN error?</strong> Double-check you typed the PIN correctly</li>
                    <li><strong>Still not working?</strong> Contact our support team via WhatsApp</li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ⏱️ Estimated activation time: <strong>Usually under 2 minutes</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Support Section */}
          <div className="card bg-error/5 border-2 border-error/20 mb-8">
            <h2 className="text-2xl font-bold mb-4">Didn't Receive Your PIN?</h2>
            <p className="text-gray-700 mb-6">Don't worry! Here's what to do:</p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Check Spam Folder</h3>
                  <p className="text-sm text-gray-600">
                    Sometimes emails end up in spam. Check your junk/spam folder.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Download size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Resend Email</h3>
                  <button
                    onClick={handleResendEmail}
                    className="btn-secondary text-sm py-2 px-4 mt-2"
                  >
                    Resend Email
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle size={24} className="text-whatsapp mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Chat on WhatsApp</h3>
                  <a
                    href="https://wa.me/47XXXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp text-sm py-2 px-4 mt-2 inline-flex"
                  >
                    <MessageCircle size={18} />
                    Contact Support
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Call Support</h3>
                  <a href="tel:+47XXXXXXXXX" className="text-primary hover:underline">
                    +47 XXX XXX XXX
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <button className="card card-hover text-center">
              <Download size={32} className="mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Download Receipt</h3>
              <p className="text-sm text-gray-600">Get PDF receipt</p>
            </button>

            <Link to="/bundles" className="card card-hover text-center">
              <Smartphone size={32} className="mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Order Again</h3>
              <p className="text-sm text-gray-600">Buy another bundle</p>
            </Link>

            <button className="card card-hover text-center">
              <Star size={32} className="mx-auto mb-2 text-accent" />
              <h3 className="font-semibold mb-1">Rate Experience</h3>
              <p className="text-sm text-gray-600">How did we do?</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConfirmationPage;
