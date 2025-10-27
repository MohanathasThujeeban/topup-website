import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Database, Calendar, Phone, Zap, Smartphone, Filter, Search, CheckCircle } from 'lucide-react';

const bundles = [
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
      <section className="py-16 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 text-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-64 h-64 bg-teal-200 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-200 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full blur-3xl animate-float-reverse"></div>
        </div>

        <div className="container-custom px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-gray-800">
              Choose Your Perfect<br />
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Lycamobile Bundle</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto font-body leading-relaxed">
              Instant activation • Secure payments • Best rates for Norway
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <input 
                type="text" 
                placeholder="Search for data plans, eSIM bundles..." 
                className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all duration-300 font-body shadow-lg"
              />
              <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
            </div>
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

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {bundle.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                        <span>{feature}</span>
                      </div>
                    ))}
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
                    <button 
                      className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-2xl font-medium text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // Add to basket functionality
                        alert(`Added ${bundle.name} to basket!`);
                      }}
                    >
                      Add to basket
                    </button>
                    <Link
                      to={`/product/${bundle.id}`}
                      className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium text-sm text-center transition-colors"
                    >
                      Buy now
                    </Link>
                  </div>

                  {/* Delivery Info */}
                  {bundle.note && (
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">{bundle.note}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
