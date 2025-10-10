import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Database, Calendar, Phone, Zap, Smartphone, Filter, Search } from 'lucide-react';

const bundles = [
  {
    id: 1,
    name: 'Lycamobile 5GB',
    type: 'epin',
    badge: 'POPULAR',
    badgeColor: 'badge-popular',
    icon: '📱',
    data: '5GB',
    validity: '30 days',
    calls: 'Unlimited Norway',
    price: 99,
    delivery: 'Instant Email Delivery',
  },
  {
    id: 2,
    name: 'Lycamobile 10GB',
    type: 'epin',
    badge: 'BEST VALUE',
    badgeColor: 'badge-value',
    icon: '📱',
    data: '10GB',
    validity: '30 days',
    calls: 'Unlimited Norway',
    price: 149,
    delivery: 'Instant Email Delivery',
  },
  {
    id: 3,
    name: 'Lycamobile 20GB',
    type: 'epin',
    badge: 'NEW',
    badgeColor: 'badge-new',
    icon: '📱',
    data: '20GB',
    validity: '30 days',
    calls: 'Unlimited Norway & EU',
    price: 249,
    delivery: 'Instant Email Delivery',
  },
  {
    id: 4,
    name: 'Lycamobile eSIM 5GB',
    type: 'esim',
    badge: 'eSIM',
    badgeColor: 'badge-esim',
    icon: '📲',
    data: '5GB',
    validity: '30 days',
    calls: 'Unlimited Norway',
    price: 119,
    delivery: 'Instant QR Code',
    note: 'Scan QR code to activate',
  },
  {
    id: 5,
    name: 'Lycamobile eSIM 10GB',
    type: 'esim',
    badge: 'eSIM',
    badgeColor: 'badge-esim',
    icon: '📲',
    data: '10GB',
    validity: '30 days',
    calls: 'Unlimited Norway',
    price: 169,
    delivery: 'Instant QR Code',
    note: 'Scan QR code to activate',
  },
  {
    id: 6,
    name: 'Lycamobile 3GB',
    type: 'epin',
    badge: null,
    icon: '☎️',
    data: '3GB',
    validity: '30 days',
    calls: 'Unlimited Norway',
    price: 79,
    delivery: 'Instant Email Delivery',
  },
  {
    id: 7,
    name: 'Lycamobile 15GB',
    type: 'epin',
    badge: null,
    icon: '🌐',
    data: '15GB',
    validity: '30 days',
    calls: 'Unlimited Norway & EU',
    price: 199,
    delivery: 'Instant Email Delivery',
  },
  {
    id: 8,
    name: 'Lycamobile eSIM 20GB',
    type: 'esim',
    badge: 'eSIM',
    badgeColor: 'badge-esim',
    icon: '📲',
    data: '20GB',
    validity: '30 days',
    calls: 'Unlimited Norway & EU',
    price: 269,
    delivery: 'Instant QR Code',
    note: 'Scan QR code to activate',
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBundles.map((bundle) => (
              <div key={bundle.id} className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden border border-gray-100 hover:border-cyan-200">
                {/* Badge */}
                {bundle.badge && (
                  <div className="absolute top-5 right-5 z-10">
                    <span className={`badge ${bundle.badgeColor} text-xs font-semibold px-4 py-2 shadow-md`}>{bundle.badge}</span>
                  </div>
                )}

                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-cyan-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 p-6">
                  {/* Product Icon */}
                  <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                    <span className="text-4xl">{bundle.icon}</span>
                  </div>

                  {/* Bundle Name */}
                  <h3 className="text-xl font-bold text-center mb-6 text-gray-800 font-heading leading-tight">{bundle.name}</h3>

                  {/* Key Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-2xl border border-teal-100 group-hover:border-teal-200 transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <Database size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 font-body block">Data:</span>
                        <span className="font-bold text-gray-900 font-heading text-lg">{bundle.data}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-cyan-100/50 rounded-2xl border border-cyan-100 group-hover:border-cyan-200 transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <Calendar size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 font-body block">Validity:</span>
                        <span className="font-bold text-gray-900 font-heading text-lg">{bundle.validity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-100 group-hover:border-emerald-200 transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <Phone size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 font-body block">Calls:</span>
                        <span className="font-bold text-gray-900 font-heading text-base">{bundle.calls}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Tag */}
                  <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 mb-5 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-sm">
                    <Zap size={18} className="text-emerald-600" />
                    <span className="font-semibold font-body">{bundle.delivery}</span>
                  </div>

                  {/* Note for eSIM */}
                  {bundle.note && (
                    <p className="text-sm text-center text-blue-700 mb-5 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 font-body">
                      <Smartphone size={16} />
                      {bundle.note}
                    </p>
                  )}

                  {/* Price */}
                  <div className="text-center mb-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-100">
                    <div className="text-xs text-gray-600 font-body mb-1">Price</div>
                    <span className="text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent font-display">
                      NOK {bundle.price}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={`/product/${bundle.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl group-hover:scale-105 transform transition-all duration-300 font-heading text-lg"
                  >
                    Buy Now
                    <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
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
