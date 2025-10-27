import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, CreditCard, Package, Star, Check, Info, 
  Globe, Smartphone, Wifi, Clock, Shield, ArrowLeft, Filter,
  Search, SortAsc, Eye, Heart, Plus, Minus, AlertCircle, CheckCircle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function RetailerPurchasePage() {
  const [bundles, setBundles] = useState([]);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('price-asc');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Payment details
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress: ''
  });

  // Retailer info (mock - would come from auth context)
  const retailerInfo = {
    id: 'RET001',
    name: 'Premium Mobile Store',
    email: 'store@premium.no',
    creditLimit: 50000,
    currentBalance: 15000
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  useEffect(() => {
    filterAndSortBundles();
  }, [bundles, searchTerm, filterCategory, sortBy]);

  const fetchBundles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bundles`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bundles response:', result);
        if (result.success && result.data) {
          setBundles(result.data.map(bundle => ({
            ...bundle,
            wholesalePrice: bundle.wholesalePrice || bundle.price * 0.8 // 20% discount for retailers
          })));
        } else {
          setError('Failed to fetch bundles: ' + (result.message || 'Unknown error'));
        }
      } else {
        console.error('Failed to fetch bundles from server');
        // Mock data for demonstration
        setBundles([
          {
            id: '1',
            name: 'Lycamobile Smart XL',
            description: '30GB data with unlimited national minutes and international calling',
            productType: 'BUNDLE',
            category: 'NORWAY',
            basePrice: 225.00,
            wholesalePrice: 99.00,
            dataAmount: '30GB',
            validity: '30 days',
            features: [
              '30GB Data',
              'Unlimited national minutes', 
              'Unlimited minutes to UK, EU, USA, Canada, India and China',
              'Unlimited national SMS',
              '5G at no extra cost',
              'Data Rollover',
              '30GB EU Roaming Data',
              'eSIM available'
            ],
            imageUrl: '/api/placeholder/300/200',
            stockQuantity: 500,
            rating: 4.8,
            reviews: 234,
            discount: 56,
            isPopular: true,
            isFeatured: true
          },
          {
            id: '2', 
            name: 'Telenor Prepaid Smart M',
            description: '10GB high-speed data with premium network coverage',
            productType: 'BUNDLE',
            category: 'NORWAY', 
            basePrice: 149.00,
            wholesalePrice: 104.30,
            dataAmount: '10GB',
            validity: '30 days',
            features: [
              '10GB high-speed data',
              'Premium Telenor network',
              'Unlimited calls in Norway', 
              'EU roaming included',
              'Music streaming included',
              '5G ready'
            ],
            imageUrl: '/api/placeholder/300/200',
            stockQuantity: 300,
            rating: 4.6,
            reviews: 189,
            discount: 30,
            isPopular: false,
            isFeatured: false
          },
          {
            id: '3',
            name: 'Nordic Travel eSIM Pro',
            description: 'Perfect for Nordic travel with multi-country coverage',
            productType: 'ESIM',
            category: 'NORDIC',
            basePrice: 299.00, 
            wholesalePrice: 209.30,
            dataAmount: '15GB',
            validity: '30 days',
            features: [
              '15GB Nordic coverage',
              'Denmark, Sweden, Finland included',
              'Instant activation',
              'No physical SIM needed',
              'Multi-carrier support',
              'Customer support 24/7'
            ],
            imageUrl: '/api/placeholder/300/200',
            stockQuantity: 150,
            rating: 4.9,
            reviews: 87,
            discount: 30,
            isPopular: true,
            isFeatured: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBundles = () => {
    let filtered = bundles.filter(bundle => {
      const matchesSearch = bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bundle.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || bundle.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort bundles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.wholesalePrice - b.wholesalePrice;
        case 'price-desc':
          return b.wholesalePrice - a.wholesalePrice;
        case 'data-desc':
          return parseFloat(b.dataAmount) - parseFloat(a.dataAmount);
        case 'popular':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredBundles(filtered);
  };

  const addToCart = (bundle, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === bundle.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === bundle.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...bundle, quantity }];
      }
    });
  };

  const removeFromCart = (bundleId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== bundleId));
  };

  const updateCartQuantity = (bundleId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bundleId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === bundleId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.wholesalePrice * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Create order
  const createOrder = async () => {
    try {
      const orderItems = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        productType: item.productType || 'BUNDLE',
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.wholesalePrice,
        retailPrice: item.basePrice,
        dataAmount: item.dataAmount,
        validity: item.validity
      }));

      const response = await fetch(`${API_BASE_URL}/retailer/order-management`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          retailerId: retailerInfo.id,
          items: orderItems
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Process payment
  const processPayment = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/retailer/order-management/${orderId}/payment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: paymentDetails.paymentMethod,
          paymentDetails: paymentDetails
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    const totalAmount = getCartTotal();
    const availableCredit = retailerInfo.creditLimit - retailerInfo.currentBalance;

    if (totalAmount > availableCredit) {
      setError(`Insufficient credit. Available: kr${availableCredit.toFixed(2)}`);
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Create order
      const order = await createOrder();
      console.log('Order created:', order);

      // Process payment
      const paymentResult = await processPayment(order.id);
      console.log('Payment processed:', paymentResult);

      // Success
      setOrderNumber(order.orderNumber);
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      setOrderComplete(true);
      setSuccess('Order placed successfully!');

    } catch (error) {
      setError('Checkout failed: ' + error.message);
      console.error('Checkout error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const BundleCard = ({ bundle }) => (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Bundle Image & Badges */}
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
          <div className="text-center">
            <Package size={48} className="text-white mb-2 mx-auto" />
            <div className="text-white font-bold text-lg">{bundle.dataAmount}</div>
            <div className="text-indigo-200 text-sm">{bundle.validity}</div>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {bundle.discount > 0 && (
            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
              {bundle.discount}% Discount!
            </div>
          )}
          {bundle.isPopular && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              Popular
            </div>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white rounded-full p-3 shadow-lg">
          <div className="text-center">
            <div className="text-xs text-gray-500 line-through">kr{bundle.basePrice.toFixed(2)}</div>
            <div className="text-lg font-bold text-green-600">kr{bundle.wholesalePrice.toFixed(2)}</div>
            <div className="text-xs text-gray-600">/ {bundle.validity}</div>
          </div>
        </div>
      </div>

      {/* Bundle Details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {bundle.name}
          </h3>
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{bundle.rating}</span>
            <span className="text-xs text-gray-500">({bundle.reviews})</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{bundle.description}</p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {bundle.features.slice(0, 4).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check size={14} className="text-green-500 flex-shrink-0" />
              <span className="text-xs text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedBundle(bundle)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            View Details
          </button>
          <button
            onClick={() => addToCart(bundle)}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Add to Cart
          </button>
        </div>

        {/* Stock Info */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{bundle.stockQuantity} units available</span>
          <span className="flex items-center gap-1">
            <Shield size={12} />
            Wholesale Price
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading available bundles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bundle Marketplace</h1>
                <p className="text-sm text-gray-600">Purchase bundles at wholesale prices</p>
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Cart
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search bundles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="NORWAY">Norway</option>
              <option value="NORDIC">Nordic</option>
              <option value="EUROPE">Europe</option>
              <option value="GLOBAL">Global</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="data-desc">Data: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Bundle Grid */}
        {filteredBundles.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bundles found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        )}
      </div>

      {/* Bundle Detail Modal */}
      {selectedBundle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBundle.name}</h2>
                  <p className="text-gray-600">{selectedBundle.description}</p>
                </div>
                <button
                  onClick={() => setSelectedBundle(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Retail Price</div>
                    <div className="text-lg text-gray-500 line-through">kr{selectedBundle.basePrice.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium">Your Wholesale Price</div>
                    <div className="text-3xl font-bold text-green-600">kr{selectedBundle.wholesalePrice.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">/ {selectedBundle.validity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-purple-600">You Save</div>
                    <div className="text-lg font-bold text-purple-600">
                      kr{(selectedBundle.basePrice - selectedBundle.wholesalePrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedBundle.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check size={16} className="text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    addToCart(selectedBundle);
                    setSelectedBundle(null);
                  }}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    addToCart(selectedBundle);
                    setSelectedBundle(null);
                    setShowCart(true);
                  }}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{item.dataAmount} • {item.validity}</div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">kr{(item.wholesalePrice * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">kr{item.wholesalePrice.toFixed(2)} each</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-green-600">kr{getCartTotal().toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.dataAmount} • {item.validity}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">kr{(item.wholesalePrice * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">kr{getCartTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Credit Info */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Credit Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Credit Limit:</span>
                        <span>kr{retailerInfo.creditLimit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Used Credit:</span>
                        <span>kr{retailerInfo.currentBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-700">
                        <span>Available Credit:</span>
                        <span>kr{(retailerInfo.creditLimit - retailerInfo.currentBalance).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                      <select
                        value={paymentDetails.paymentMethod}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="account_credit">Account Credit</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>

                    {paymentDetails.paymentMethod === 'credit_card' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                          <input
                            type="text"
                            value={paymentDetails.cardNumber}
                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                            placeholder="1234 5678 9012 3456"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Card Holder Name</label>
                          <input
                            type="text"
                            value={paymentDetails.cardHolderName}
                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardHolderName: e.target.value }))}
                            placeholder="John Doe"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                            <select
                              value={paymentDetails.expiryMonth}
                              onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryMonth: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">MM</option>
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                  {String(i + 1).padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                            <select
                              value={paymentDetails.expiryYear}
                              onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryYear: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">YYYY</option>
                              {Array.from({ length: 10 }, (_, i) => (
                                <option key={i} value={String(new Date().getFullYear() + i)}>
                                  {new Date().getFullYear() + i}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                            <input
                              type="text"
                              value={paymentDetails.cvv}
                              onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                              placeholder="123"
                              maxLength="4"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {paymentDetails.paymentMethod === 'account_credit' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">
                          This order will be charged to your account credit. 
                          Available credit: kr{(retailerInfo.creditLimit - retailerInfo.currentBalance).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {paymentDetails.paymentMethod === 'bank_transfer' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 mb-2">Bank transfer details will be sent to your email after order confirmation.</p>
                        <p className="text-sm text-blue-600">Payment must be completed within 24 hours to avoid order cancellation.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard size={20} className="mr-2" />
                          Complete Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Complete Modal */}
      {orderComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your order has been successfully placed and is being processed.</p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-xl font-bold text-indigo-600">{orderNumber}</p>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>Total: <span className="font-semibold text-green-600">kr{getCartTotal().toFixed(2)}</span></p>
              <p>Items: <span className="font-semibold">{getCartItemCount()}</span></p>
              <p>Status: <span className="font-semibold text-blue-600">Processing</span></p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setOrderComplete(false)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {/* Navigate to orders page */}}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}