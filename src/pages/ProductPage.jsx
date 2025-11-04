import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Star, Check, MessageCircle, Phone, ShoppingCart, CreditCard, Database, Calendar, PhoneCall } from 'lucide-react';
import { API_CONFIG } from '../config/api';

const ProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('activate');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product data from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/public/bundles/${id}`);
        const data = await response.json();
        
        if (data.success && data.bundle) {
          // Transform backend data
          const bundle = data.bundle;
          setProduct({
            id: bundle.id,
            name: bundle.name,
            type: bundle.productType.toLowerCase(),
            badge: bundle.productType === 'ESIM' ? 'eSIM AVAILABLE' : 'INSTANT DELIVERY',
            rating: 4.8,
            reviews: 234,
            price: parseFloat(bundle.basePrice),
            originalPrice: bundle.discountPercentage && bundle.discountPercentage > 0 ? 
                          parseFloat(bundle.basePrice) * (1 + bundle.discountPercentage / 100) : null,
            data: bundle.dataAmount || 'N/A',
            validity: bundle.validity || '30 days',
            calls: 'Unlimited Norway',
            description: bundle.description || `Works for all Lycamobile Norway SIMs. ${bundle.productType === 'ESIM' ? 'QR Code' : 'PIN'} delivered to your Email & WhatsApp instantly after payment.`,
            features: bundle.metadata ? 
                     Object.values(bundle.metadata).filter(val => val && val.trim() !== '') : 
                     ['Unlimited national minutes', 'International calling', 'EU Roaming Data'],
            delivery: bundle.productType === 'ESIM' ? 'Instant QR Code' : 'Instant Email Delivery',
            stockQuantity: bundle.stockQuantity,
            imageUrl: bundle.imageUrl
          });
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Mock product data fallback
  const mockProduct = {
    id: 1,
    name: 'Lycamobile 5GB ePIN',
    type: 'epin',
    badge: 'INSTANT DELIVERY',
    rating: 4.8,
    reviews: 234,
    price: 99,
    data: '5GB',
    validity: '30 days',
    calls: 'Unlimited Norway',
    description: 'Works for all Lycamobile Norway SIMs. PIN delivered to your Email & WhatsApp instantly after payment.',
  };

  const relatedProducts = [
    { id: 2, name: 'Lycamobile 10GB', price: 149, data: '10GB' },
    { id: 3, name: 'Lycamobile 20GB', price: 249, data: '20GB' },
    { id: 6, name: 'Lycamobile 3GB', price: 79, data: '3GB' },
  ];

  const handleBuyNow = () => {
    // Pass product data to checkout page including type
    navigate('/checkout', {
      state: {
        product: {
          name: product.name,
          price: product.price,
          quantity: quantity,
          discount: 0,
          type: product.type, // 'esim' or 'epin'
          validity: product.validity,
          data: product.data
        }
      }
    });
  };

  const handleAddToCart = () => {
    alert('Added to cart!');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="animate-fadeIn min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="animate-fadeIn min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Product not found'}</h2>
          <Link to="/bundles" className="btn-primary">
            Back to Bundles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumb */}
      <div className="bg-bgLight py-4">
        <div className="container-custom px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link to="/bundles" className="text-primary hover:underline">Bundles</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-600">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <section className="section-padding bg-white">
        <div className="container-custom px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Product Image & Gallery */}
            <div>
              <div className="mb-4">
                <span className="badge badge-new">{product.badge}</span>
              </div>
              <div className="card">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="text-8xl mb-4">📱</div>
                    <div className="text-2xl font-bold text-primary">Lycamobile</div>
                  </div>
                </div>
                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard size={20} className="text-vipps" />
                    <span>Vipps</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard size={20} className="text-pink-500" />
                    <span>Klarna</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard size={20} className="text-blue-600" />
                    <span>Visa/MC</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard size={20} className="text-yellow-500" />
                    <span>PayPal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {product.name} (Instant Delivery)
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating}/5 ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">NOK {product.price}</span>
              </div>

              {/* Short Description */}
              <div className="space-y-2 mb-6">
                <p className="text-lg"><strong>{product.data} Data</strong> valid for {product.validity}</p>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Features List */}
              <div className="card bg-bgLight mb-6">
                <ul className="space-y-3">
                  {product.features && product.features.length > 0 ? (
                    product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check size={20} className="text-success mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-3">
                        <Check size={20} className="text-success mt-1 flex-shrink-0" />
                        <span>Instant {product.type === 'esim' ? 'QR Code' : 'email'} delivery</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check size={20} className="text-success mt-1 flex-shrink-0" />
                        <span>Valid for {product.validity}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check size={20} className="text-success mt-1 flex-shrink-0" />
                        <span>{product.calls}</span>
                      </li>
                      {product.type !== 'esim' && (
                        <>
                          <li className="flex items-start gap-3">
                            <Check size={20} className="text-success mt-1 flex-shrink-0" />
                            <span>No expiry date on PIN code</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check size={20} className="text-success mt-1 flex-shrink-0" />
                            <span>Easy activation: Dial *123*PIN#</span>
                          </li>
                        </>
                      )}
                      {product.type === 'esim' && (
                        <li className="flex items-start gap-3">
                          <Check size={20} className="text-success mt-1 flex-shrink-0" />
                          <span>Scan QR code to activate</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>

              {/* Quantity Selector - Only for non-eSIM products */}
              {product.type !== 'esim' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Quantity</label>
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="input-field max-w-xs"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* eSIM Notice */}
              {product.type === 'esim' && (
                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-900">One eSIM per order</p>
                      <p className="text-sm text-blue-700">Each eSIM can only be activated once. Purchase additional eSIMs separately if needed.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button onClick={handleBuyNow} className="btn-primary flex-1">
                  Buy Now
                </button>
                <button onClick={handleAddToCart} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              </div>

              {/* Payment Methods Section */}
              <div className="card mb-6">
                <h3 className="font-semibold mb-4">Pay Securely With:</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 border-2 border-gray-200 rounded-lg">
                    <span className="font-semibold text-vipps">Vipps</span>
                  </div>
                  <div className="px-4 py-2 border-2 border-gray-200 rounded-lg">
                    <span className="font-semibold text-pink-500">Klarna</span>
                  </div>
                  <div className="px-4 py-2 border-2 border-gray-200 rounded-lg">
                    <span className="font-semibold">PayPal</span>
                  </div>
                  <div className="px-4 py-2 border-2 border-gray-200 rounded-lg">
                    <span className="font-semibold">Visa/Mastercard</span>
                  </div>
                </div>
              </div>

              {/* Support Section */}
              <div className="card bg-success/10 border-2 border-success/20">
                <h3 className="font-semibold mb-4">Need Help?</h3>
                <div className="flex flex-col gap-3">
                  <button className="btn-whatsapp flex items-center justify-center gap-2">
                    <MessageCircle size={20} />
                    Chat with us on WhatsApp
                  </button>
                  <div className="flex items-center gap-2 justify-center text-gray-700">
                    <Phone size={18} />
                    <span>+47 XXX XXX XXX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="section-padding bg-bgLight">
        <div className="container-custom px-4">
          {/* Tab Headers */}
          <div className="flex border-b mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('activate')}
              className={`px-6 py-3 font-semibold whitespace-nowrap ${
                activeTab === 'activate'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              How to Activate
            </button>
            <button
              onClick={() => setActiveTab('included')}
              className={`px-6 py-3 font-semibold whitespace-nowrap ${
                activeTab === 'included'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              What's Included
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 font-semibold whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-semibold whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Reviews
            </button>
          </div>

          {/* Tab Content */}
          <div className="card">
            {activeTab === 'activate' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">How to Activate Your ePIN</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Check your email for PIN</h3>
                      <p className="text-gray-600">
                        Look for an email from support@easytopup.no with your 16-digit PIN code.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Dial *123*PIN# on your Lycamobile SIM</h3>
                      <p className="text-gray-600">
                        For example: *123*1234567890123456#
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Wait for confirmation SMS</h3>
                      <p className="text-gray-600">
                        You'll receive a confirmation message within 2 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'included' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">What's Included</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <Database size={24} className="text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">{product.data} Data</h3>
                      <p className="text-sm text-gray-600">High-speed mobile data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <PhoneCall size={24} className="text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">{product.calls}</h3>
                      <p className="text-sm text-gray-600">Unlimited calling</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={24} className="text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">{product.validity} Validity</h3>
                      <p className="text-sm text-gray-600">From activation date</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">How long does delivery take?</h3>
                    <p className="text-gray-600">
                      Your ePIN is delivered instantly to your email within seconds of completing payment.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Can I use this PIN on any Lycamobile SIM?</h3>
                    <p className="text-gray-600">
                      Yes, this PIN works on all Lycamobile Norway SIM cards.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">What if I don't receive my PIN?</h3>
                    <p className="text-gray-600">
                      Check your spam folder first. If you still can't find it, contact us via WhatsApp and we'll resend it immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                <div className="space-y-6">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-2">
                        "Great service! PIN arrived instantly and activation was super easy."
                      </p>
                      <p className="text-sm text-gray-600">- Customer {review}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="section-padding bg-white">
        <div className="container-custom px-4">
          <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedProducts.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`} className="card card-hover">
                <div className="text-5xl text-center mb-4">📱</div>
                <h3 className="text-xl font-bold text-center mb-2">{item.name}</h3>
                <p className="text-center text-gray-600 mb-4">{item.data} Data</p>
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-primary">NOK {item.price}</span>
                </div>
                <button className="btn-primary w-full">View Details</button>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
