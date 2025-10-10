import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Lock, Shield, CreditCard } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptOffers, setAcceptOffers] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [billingCountry, setBillingCountry] = useState('Norway');

  const product = {
    name: 'Lycamobile 5GB ePIN',
    quantity: 1,
    price: 99,
    discount: 0,
  };

  const total = product.price * product.quantity - product.discount;

  const handleCompleteOrder = (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    // Process payment
    navigate('/confirmation');
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
                      Your ePIN will be sent to this email. Check your inbox and spam folder.
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
                      We'll send your PIN here too for backup delivery
                    </p>
                  </div>
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
                  disabled={!email || !paymentMethod}
                  className="btn-primary w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Order
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
