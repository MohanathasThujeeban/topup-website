import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Database, Calendar, Phone, Zap, Smartphone, Filter, Search, CheckCircle } from 'lucide-react';
import { API_CONFIG } from '../config/api';

const staticBundles = [
  {
    id: 1,
    name: 'Lyca Smart S',
    type: 'epin',
    badge: null,
    data: '1GB',
    validity: '30 days',
    price: 99,
    originalPrice: null,
    discount: null,
    features: [
      'Unlimited national minutes',
      '100* Minutes to United Kingdom and more',
      '1GB EU Roaming Data'
    ],
    delivery: 'Instant Email Delivery',
  },
  {
    id: 2,
    name: 'Lyca Smart XL',
    type: 'epin',
    badge: '3 Months Price Discount !',
    data: '30GB',
    validity: '30 days',
    price: 99,
    originalPrice: 225,
    discount: '3 Months Price Discount !',
    features: [
      'Unlimited national minutes',
      'Unlimited minutes to UK, EU, USA, Canada, India and China',
      '30GB EU Roaming Data'
    ],
    delivery: 'Instant Email Delivery',
    popular: true
  },
  {
    id: 3,
    name: 'Lyca Smart M',
    type: 'epin',
    badge: null,
    data: '5GB',
    validity: '30 days',
    price: 149,
    originalPrice: null,
    discount: null,
    features: [
      'Unlimited national minutes',
      '500* Minutes to United Kingdom and more',
      '5GB EU Roaming Data'
    ],
    delivery: 'Instant Email Delivery',
  },
  {
    id: 4,
    name: 'Lyca Smart eSIM S',
    type: 'esim',
    badge: 'eSIM available',
    data: '1GB',
    validity: '30 days',
    price: 119,
    originalPrice: null,
    discount: null,
    features: [
      'Unlimited national minutes',
      '100* Minutes to United Kingdom and more',
      '1GB EU Roaming Data',
      'eSIM available'
    ],
    delivery: 'Instant QR Code',
    note: 'Scan QR code to activate',
  },
  {
    id: 5,
    name: 'Lyca Smart eSIM XL',
    type: 'esim',
    badge: 'kr50 Discount',
    data: '30GB',
    validity: '30 days',
    price: 149,
    originalPrice: 199,
    discount: 'kr50 Discount',
    features: [
      'Unlimited national minutes',
      'Unlimited minutes to UK, EU, USA, Canada, India and China',
      '30GB EU Roaming Data',
      'eSIM available'
    ],
    delivery: 'Instant QR Code',
    note: 'Scan QR code to activate',
  },
  {
    id: 6,
    name: 'Lyca Smart L',
    type: 'epin',
    badge: null,
    data: '10GB',
    validity: '30 days',
    price: 199,
    originalPrice: null,
    discount: null,
    features: [
      'Unlimited national minutes',
      'Unlimited minutes to United Kingdom and more',
      '10GB EU Roaming Data'
    ],
    delivery: 'Instant Email Delivery',
  },
  {
    id: 7,
    name: 'Lyca Smart eSIM M',
    type: 'esim',
    badge: 'eSIM available',
    data: '5GB',
    validity: '30 days',
    price: 169,
    originalPrice: null,
    discount: null,
    features: [
      'Unlimited national minutes',
      '500* Minutes to United Kingdom and more',
      '5GB EU Roaming Data',
      'eSIM available'
    ],
    delivery: 'Instant QR Code',
    note: 'Scan QR code to activate',
  },
  {
    id: 8,
    name: 'Lyca Smart XXL',
    type: 'epin',
    badge: 'BEST VALUE',
    data: '50GB',
    validity: '30 days',
    price: 349,
    originalPrice: null,
    discount: null,
    features: [
      'Unlimited national minutes',
      'Unlimited minutes to UK, EU, USA, Canada, India and China',
      '50GB EU Roaming Data',
      'Data Rollover'
    ],
    delivery: 'Instant Email Delivery',
  },
];

const BundlesPage = () => {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('all');
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bundles from backend
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching bundles from:', `${API_CONFIG.BASE_URL}/public/bundles`);
        const response = await fetch(`${API_CONFIG.BASE_URL}/public/bundles`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        if (data.success && data.bundles && data.bundles.length > 0) {
          // Transform backend data to match frontend structure
          const transformedBundles = data.bundles.map(bundle => ({
            id: bundle.id,
            name: bundle.name,
            type: bundle.productType.toLowerCase(),
            badge: bundle.productType === 'ESIM' ? 'eSIM available' : 
                   (bundle.discountPercentage && bundle.discountPercentage > 0 ? `kr${bundle.discountPercentage} Discount` : null),
            data: bundle.dataAmount || 'N/A',
            validity: bundle.validity || '30 days',
            price: parseFloat(bundle.basePrice),
            originalPrice: bundle.discountPercentage && bundle.discountPercentage > 0 ? 
                          parseFloat(bundle.basePrice) * (1 + bundle.discountPercentage / 100) : null,
            discount: bundle.discountPercentage && bundle.discountPercentage > 0 ? 
                     `${bundle.discountPercentage}% Discount` : null,
            features: bundle.metadata ? 
                     Object.values(bundle.metadata).filter(val => val && val.trim() !== '') : 
                     ['Unlimited national minutes', 'International calling', 'EU Roaming Data'],
            delivery: bundle.productType === 'ESIM' ? 'Instant QR Code' : 'Instant Email Delivery',
            note: bundle.productType === 'ESIM' ? 'Scan QR code to activate' : null,
            description: bundle.description,
            imageUrl: bundle.imageUrl,
            stockQuantity: bundle.actualStockAvailable || bundle.stockQuantity || 0,
            hasStock: bundle.hasStock !== undefined ? bundle.hasStock : (bundle.stockQuantity > 0),
            isFeatured: bundle.featured,
            stockPoolId: bundle.stockPoolId,
            stockPoolName: bundle.stockPoolName
          }));
          
          console.log('Transformed bundles:', transformedBundles);
          setBundles(transformedBundles);
        } else {
          // No bundles from backend - show empty state
          console.log('No bundles returned from API - database may be empty');
          setBundles([]);
          setError('No products found in database. Please add products via Admin Dashboard.');
        }
      } catch (err) {
        console.error('Error fetching bundles:', err);
        setError('Failed to connect to server: ' + err.message);
        // Don't fallback to static bundles - show error instead
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  // Read filter from URL on component mount
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'esim' || filterParam === 'epin') {
      setActiveFilter(filterParam);
    }
  }, [searchParams]);

  const filteredBundles = bundles.filter(bundle => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'epin') return bundle.type === 'epin';
    if (activeFilter === 'esim') return bundle.type === 'esim';
    return true;
  });

  console.log('Active Filter:', activeFilter);
  console.log('Total Bundles:', bundles.length);
  console.log('Filtered Bundles:', filteredBundles.length);
  console.log('Bundles:', bundles);

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumb */}
      <div className="bg-bgLight py-4">
        <div className="container-custom px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-600">Bundles</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <section className="py-12 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 text-gray-900">
        <div className="container-custom px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gray-800">
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Prepaid Bundles</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom px-4">

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-5 mb-12">
            <span className="text-gray-600 font-medium font-body text-sm uppercase tracking-wider">Filter:</span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 font-accent ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-xl shadow-teal-200 scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:shadow-lg hover:scale-102'
              }`}
            >
              <Filter size={18} className="inline mr-2" />
              All Bundles
            </button>
            <button
              onClick={() => setActiveFilter('epin')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 font-accent ${
                activeFilter === 'epin'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-200 scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-cyan-300 hover:shadow-lg hover:scale-102'
              }`}
            >
              <Phone size={18} className="inline mr-2" />
              E-PIN Bundles
            </button>
            <button
              onClick={() => setActiveFilter('esim')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 font-accent ${
                activeFilter === 'esim'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-xl shadow-teal-200 scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:shadow-lg hover:scale-102'
              }`}
            >
              <Smartphone size={18} className="inline mr-2" />
              eSIM Bundles
            </button>
          </div>

          {/* Bundle Cards Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center">
              <p className="text-yellow-800 mb-2">{error}</p>
            </div>
          ) : filteredBundles.length === 0 ? (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
              <Smartphone size={48} className="mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No {activeFilter === 'esim' ? 'eSIM' : activeFilter === 'epin' ? 'E-PIN' : ''} bundles found
              </h3>
              <p className="text-gray-600 mb-4">
                {activeFilter === 'esim' 
                  ? 'No eSIM bundles are currently available. Please check back later or contact support.'
                  : 'No bundles match your current filter. Try selecting a different filter.'}
              </p>
              <button 
                onClick={() => setActiveFilter('all')}
                className="btn-primary"
              >
                View All Bundles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBundles.map((bundle) => (
              <div key={bundle.id} className="relative bg-white rounded-3xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Discount Badge */}
                {bundle.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      bundle.badge.includes('Discount') ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      bundle.badge.includes('eSIM') ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      bundle.badge.includes('BEST') ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                      'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}>
                      {bundle.badge}
                    </div>
                  </div>
                )}
                
                {/* Stock Indicator */}
                {!bundle.hasStock && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-red-500">
                      Out of Stock
                    </div>
                  </div>
                )}
                {bundle.hasStock && bundle.type !== 'esim' && bundle.stockQuantity <= 5 && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-orange-500">
                      Only {bundle.stockQuantity} left
                    </div>
                  </div>
                )}

                <div className="p-6 pt-16">
                  {/* Bundle Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{bundle.name}</h3>
                  
                  {/* Data Display */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-12 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{bundle.data}</div>
                      <div className="text-sm text-gray-600">Data</div>
                    </div>
                    <div className="ml-auto text-right">
                      {bundle.originalPrice && (
                        <div className="text-sm line-through text-gray-400">kr{bundle.originalPrice}.00</div>
                      )}
                      <div className="text-2xl font-bold text-gray-900">kr{bundle.price}.00</div>
                      <div className="text-sm text-gray-600">/{bundle.validity}</div>
                    </div>
                  </div>

                  {/* View More Link */}
                  <div className="text-center mb-4">
                    <Link 
                      to={`/product/${bundle.id}`} 
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                    >
                      View more
                    </Link>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {bundle.hasStock ? (
                      <Link
                        to={`/product/${bundle.id}`}
                        className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium text-sm text-center transition-colors"
                      >
                        Buy now
                      </Link>
                    ) : (
                      <button
                        className="flex-1 py-2 bg-gray-300 text-gray-500 rounded-2xl font-medium text-sm cursor-not-allowed"
                        disabled
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Sticky Compare Button (Bottom Right) */}
      <div className="fixed bottom-24 right-5 z-40">
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 font-semibold animate-glow">
          Compare Selected (0)
        </button>
      </div>
    </div>
  );
};

export default BundlesPage;
