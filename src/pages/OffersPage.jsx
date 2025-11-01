import React, { useState, useEffect } from 'react';
import { Calendar, Percent, Gift, Clock, Star, Tag, Users, Zap, AlertCircle } from 'lucide-react';
import FeaturedPromotions from '../components/FeaturedPromotions';
import PromotionalBanner from '../components/PromotionalBanner';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Fetch all promotions from backend (including scheduled ones)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        // Fetch ALL promotions, not just active ones
        const response = await fetch(`${API_BASE_URL}/admin/promotions`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }
        
        const data = await response.json();
        console.log('Fetched promotions data:', data);
        
        if (data.success && Array.isArray(data.data)) {
          console.log('Setting offers:', data.data);
          // Filter to show ACTIVE and SCHEDULED promotions (not EXPIRED)
          const validOffers = data.data.filter(offer => 
            offer.status !== 'EXPIRED' && offer.status !== 'INACTIVE'
          );
          setOffers(validOffers);
        } else {
          console.log('No valid data in response');
          setOffers([]);
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError(err.message);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return offer.promotionType === filter;
  });

  console.log('Current filter:', filter);
  console.log('Total offers:', offers.length);
  console.log('Filtered offers:', filteredOffers.length);
  console.log('Offers data:', offers);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-orange-600 bg-orange-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isOfferValid = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      
      {/* Promotional Banner */}
      <PromotionalBanner />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <Gift className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6 font-display">
              Exclusive <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">Offers</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 font-body leading-relaxed">
              Don't miss out on our amazing deals and promotions. Save more on your mobile top-ups and eSIM purchases!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Percent className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700 font-medium">Up to 70% Off</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Users className="w-5 h-5 text-pink-500" />
                <span className="text-gray-700 font-medium">Referral Rewards</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Star className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700 font-medium">Loyalty Points</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { key: 'all', label: 'All Offers', icon: Gift },
              { key: 'LIMITED_TIME', label: 'Limited Time', icon: Clock },
              { key: 'NEW_CUSTOMER', label: 'New Customer', icon: Tag },
              { key: 'REFERRAL', label: 'Referral', icon: Users },
              { key: 'LOYALTY', label: 'Loyalty', icon: Star }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  filter === key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg hover:scale-105'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading offers...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-xl mb-8">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-400" size={24} />
                <div>
                  <p className="font-semibold text-red-800">Error loading offers</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Promotions Grid */}
          {!loading && !error && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                  Active Promotions & Special Offers
                </h2>
                <p className="text-center text-gray-600">Exclusive deals just for you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOffers.map((offer) => {
                  const isScheduled = offer.status === 'SCHEDULED';
                  const isActive = offer.status === 'ACTIVE';
                  const isExpired = offer.status === 'EXPIRED';
                  
                  return (
                    <div 
                      key={offer.id} 
                      className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-purple-100 overflow-hidden"
                    >
                      {/* Top Badge */}
                      <div className="absolute -top-2 -left-2">
                        <div className={`text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg transform -rotate-3 ${
                          isScheduled ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}>
                          {offer.promotionType === 'LIMITED_TIME' ? 'LIMITED TIME' : 
                           offer.promotionType === 'NEW_CUSTOMER' ? 'NEW CUSTOMER' :
                           offer.promotionType === 'REFERRAL' ? 'REFERRAL' :
                           offer.promotionType === 'LOYALTY' ? 'LOYALTY' : 'SPECIAL OFFER'}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          isActive ? 'bg-green-100 text-green-700' : 
                          isScheduled ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {isActive ? 'Active' : isScheduled ? 'Coming Soon' : 'Not Valid'}
                        </div>
                      </div>

                      <div className="p-8 pt-12">
                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {offer.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {offer.description}
                        </p>

                        {/* Discount Badge */}
                        <div className="flex items-center gap-3 mb-6">
                          <Percent className="w-8 h-8 text-purple-600" />
                          <div>
                            <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {offer.discountValue || 0}{offer.discountType === 'PERCENTAGE' ? '%' : ' NOK'}
                            </span>
                            <span className="text-gray-600 ml-2">
                              {offer.discountType === 'PERCENTAGE' ? 'Discount' : 'Off'}
                            </span>
                          </div>
                        </div>

                        {/* Banner Image */}
                        {offer.bannerImageUrl && (
                          <div className="mb-6 rounded-xl overflow-hidden">
                            <img 
                              src={offer.bannerImageUrl} 
                              alt={offer.name}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Valid Until */}
                        <div className="flex items-center gap-2 mb-6 bg-blue-50 rounded-xl p-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            Valid until <strong>{new Date(offer.endDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}</strong>
                          </span>
                        </div>

                        {/* Terms & Conditions */}
                        {offer.termsAndConditions && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Terms & Conditions:</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {offer.termsAndConditions}
                            </p>
                          </div>
                        )}

                        {/* Action Button */}
                        <button 
                          className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                              : isScheduled
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!isActive}
                        >
                          {isActive ? (
                            <>
                              <Gift className="w-5 h-5" />
                              Claim Offer
                            </>
                          ) : isScheduled ? (
                            <>
                              <Clock className="w-5 h-5" />
                              Coming Soon
                            </>
                          ) : (
                            'Not Valid'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredOffers.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Gift className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">No Active Offers</h3>
                  <p className="text-gray-500 mb-8">Check back soon for exciting promotions and deals!</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 font-heading">Never Miss an Offer</h2>
          <p className="text-xl text-white/90 mb-8 font-body">Subscribe to get notified about exclusive deals and promotions</p>
          
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-4 focus:ring-white/30 focus:outline-none text-gray-700"
            />
            <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300 shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OffersPage;