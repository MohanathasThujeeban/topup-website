import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, Lock, Shield, CreditCard, CheckCircle } from 'lucide-react';
import API_CONFIG from '../config/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptOffers, setAcceptOffers] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [billingCountry, setBillingCountry] = useState('Norway');
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState('passport');
  const [idNumber, setIdNumber] = useState('');
  const [idDocument, setIdDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get product from navigation state or use default
  const product = location.state?.product || {
    name: 'Lycamobile 5GB ePIN',
    quantity: 1,
    price: 99,
    discount: 0,
    type: 'epin', // default to epin
  };

  const total = product.price * product.quantity - product.discount;
  
  // Determine if product is eSIM (requires approval)
  const isEsimProduct = product.type === 'esim' || product.name.toLowerCase().includes('esim');

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    // Only validate ID verification for eSIM products
    if (isEsimProduct && (!fullName || !idNumber || !idDocument)) {
      alert('Please complete ID verification for eSIM purchase');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEsimProduct) {
        // eSIM: Submit order request for admin approval
        const orderData = {
          email,
          phone,
          fullName,
          idType,
          idNumber,
          idDocument: idDocument?.name,
          product: product.name,
          amount: total,
          paymentMethod,
        };
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/public/esim-orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Navigate to confirmation with pending approval status
          navigate('/confirmation', { 
            state: { 
              status: 'pending_approval', 
              orderData: {
                orderNumber: result.orderNumber,
                date: new Date().toLocaleString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                product: product.name,
                amount: total,
                paymentMethod,
                email
              }
            } 
          });
        } else {
          alert('Error submitting order: ' + result.message);
          setLoading(false);
        }
      } else {
        // ePIN: Process instant payment and delivery
        const orderData = {
          email,
          phone,
          product: product.name,
          amount: total,
          paymentMethod,
        };
        
        // TODO: Replace with actual ePIN order endpoint
        const response = await fetch(`${API_CONFIG.BASE_URL}/public/epin-orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Navigate to confirmation with instant delivery
          navigate('/confirmation', { 
            state: { 
              status: 'completed', 
              orderData: {
                orderNumber: result.orderNumber || 'ORD-' + Date.now(),
                date: new Date().toLocaleString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                product: product.name,
                amount: total,
                paymentMethod,
                email,
                pin: result.pin // ePIN code
              }
            } 
          });
        } else {
          alert('Error processing payment: ' + result.message);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error submitting order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 animate-fadeIn">
      {/* Simplified Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="container-custom px-4 py-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-glow">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">EasyTopup.no</span>
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container-custom px-4 py-6">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full flex items-center justify-center shadow-lg animate-glow">
                <Check size={18} />
              </div>
              <span className="text-sm font-medium text-emerald-600">Information</span>
            </div>
            <div className="flex-1 h-2 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg animate-glow">
                2
              </div>
              <span className="text-sm font-medium text-purple-600">Payment</span>
            </div>
            <div className="flex-1 h-2 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-sm font-medium text-gray-600">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="section-padding">
        <div className="container-custom px-4">
          <form onSubmit={handleCompleteOrder} className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="input-field"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Your eSIM will be sent to this email after approval.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      WhatsApp Number (optional)
                    </label>
                    <div className="flex gap-2">
                      <select className="input-field max-w-xs">
                        <option>+47</option>
                        <option>+46</option>
                        <option>+45</option>
                      </select>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="XXX XX XXX"
                        className="input-field flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      We'll send your eSIM details here too
                    </p>
                  </div>
                  
                  {/* ID Verification Section - Only for eSIM products */}
                  {isEsimProduct && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Shield className="text-blue-600" size={20} />
                        ID Verification Required for eSIM
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Full Name <span className="text-error">*</span>
                          </label>
                          <input
                            type="text"
                            required={isEsimProduct}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name as per ID"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            ID Type <span className="text-error">*</span>
                          </label>
                          <select 
                            value={idType}
                            onChange={(e) => setIdType(e.target.value)}
                            className="input-field"
                            required={isEsimProduct}
                          >
                            <option value="passport">Passport</option>
                            <option value="national_id">National ID Card</option>
                            <option value="driving_license">Driving License</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            ID Number <span className="text-error">*</span>
                          </label>
                          <input
                            type="text"
                            required={isEsimProduct}
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            placeholder="Enter ID number"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Upload ID Document <span className="text-error">*</span>
                          </label>
                          <input
                            type="file"
                            required={isEsimProduct}
                            accept="image/*,.pdf"
                            onChange={(e) => setIdDocument(e.target.files[0])}
                            className="input-field"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Upload a clear photo or scan of your ID (JPG, PNG, or PDF)
                          </p>
                          {idDocument && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle size={14} /> {idDocument.name} uploaded
                            </p>
                          )}
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                          <p className="text-xs text-yellow-800">
                            <strong>Note:</strong> Your eSIM will be delivered after admin approval (typically within 1-2 hours). 
                            You'll receive an email with the QR code once approved.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Info for ePIN products */}
                  {!isEsimProduct && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={18} />
                        <strong>Instant Delivery:</strong> Your ePIN will be sent to your email immediately after payment!
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="offers"
                      checked={acceptOffers}
                      onChange={(e) => setAcceptOffers(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="offers" className="text-sm text-gray-700">
                      Send me promotional offers and updates
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-6">Choose Payment Method</h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('vipps')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'vipps'
                        ? 'border-vipps bg-orange-50'
                        : 'border-gray-300 hover:border-vipps'
                    }`}
                  >
                    <div className="text-2xl font-bold text-vipps mb-1">Vipps</div>
                    <p className="text-xs text-gray-600">Fast & secure</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('klarna')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'klarna'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-300 hover:border-pink-500'
                    }`}
                  >
                    <div className="text-2xl font-bold text-pink-500 mb-1">Klarna</div>
                    <p className="text-xs text-gray-600">Pay later option</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <div className="text-2xl font-bold text-primary mb-1">
                      <CreditCard className="inline" size={24} /> Card
                    </div>
                    <p className="text-xs text-gray-600">Credit/Debit card</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    <div className="text-2xl font-bold text-blue-600 mb-1">PayPal</div>
                    <p className="text-xs text-gray-600">Secure payment</p>
                  </button>
                </div>

                {/* Card Details (shown when card is selected) */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 animate-slideUp">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">CVV</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="John Doe"
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Billing Country</label>
                      <select
                        value={billingCountry}
                        onChange={(e) => setBillingCountry(e.target.value)}
                        className="input-field"
                        required
                      >
                        <option>Norway</option>
                        <option>Sweden</option>
                        <option>Denmark</option>
                        <option>Finland</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Security Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t mt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock size={18} />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield size={18} />
                    <span>Norton Secured</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield size={18} />
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                {/* Product Info */}
                <div className="flex gap-4 mb-6 pb-6 border-b">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center text-3xl">
                    📱
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">NOK {product.price}</span>
                  </div>
                  {product.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount:</span>
                      <span className="font-semibold">-NOK {product.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">NOK {total}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-bgLight rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">⚡</span>
                    <div>
                      <p className="font-semibold text-sm">Instant Email Delivery</p>
                      <p className="text-xs text-gray-600">Sent to: {email || 'your@email.com'}</p>
                    </div>
                  </div>
                </div>

                {/* Complete Order Button */}
                <button
                  type="submit"
                  disabled={!email || !paymentMethod || loading}
                  className="btn-primary w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Complete Order'}
                </button>

                {/* Terms */}
                <p className="text-xs text-gray-600 text-center mb-4">
                  By completing this purchase, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms & Conditions
                  </Link>
                </p>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Shield size={16} />
                  <span>Your data is protected</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
