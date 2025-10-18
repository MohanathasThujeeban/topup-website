import React, { useState, useEffect } from 'react';
import { Calendar, Percent, Gift, Clock, Star, Tag, Users, Zap } from 'lucide-react';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [filter, setFilter] = useState('all');

  // Sample offers data (would come from admin dashboard/API in production)
  const offersData = [
    {
      id: 1,
      title: "New Customer Special",
      description: "Get 50% off your first eSIM purchase",
      discount: 50,
      validFrom: "2024-01-01",
      validUntil: "2024-12-31",
      applicableProducts: ["esim"],
      type: "limited-time",
      status: "active",
      terms: "Valid for new customers only. Cannot be combined with other offers.",
      badge: "NEW CUSTOMER",
      badgeColor: "bg-green-500"
    },
    {
      id: 2,
      title: "Bundle Bonanza",
      description: "Buy 3 prepaid bundles and get 20% off",
      discount: 20,
      validFrom: "2024-10-01",
      validUntil: "2024-11-30",
      applicableProducts: ["prepaid"],
      type: "promotional",
      status: "active",
      terms: "Minimum 3 bundles required. Discount applied automatically at checkout.",
      badge: "LIMITED TIME",
      badgeColor: "bg-orange-500"
    },
    {
      id: 3,
      title: "Refer & Earn",
      description: "Invite friends and earn NOK 25 for each successful referral",
      discount: 0,
      reward: 25,
      validFrom: "2024-01-01",
      validUntil: "2024-12-31",
      applicableProducts: ["all"],
      type: "referral",
      status: "active",
      terms: "Friend must complete their first purchase. Reward credited within 24 hours.",
      badge: "REFERRAL",
      badgeColor: "bg-purple-500"
    },
    {
      id: 4,
      title: "Black Friday Mega Deal",
      description: "Massive 70% discount on all eSIM packages",
      discount: 70,
      validFrom: "2024-11-29",
      validUntil: "2024-12-02",
      applicableProducts: ["esim"],
      type: "limited-time",
      status: "upcoming",
      terms: "Valid during Black Friday weekend only. Limited stock available.",
      badge: "COMING SOON",
      badgeColor: "bg-gray-500"
    },
    {
      id: 5,
      title: "Loyalty Rewards",
      description: "Earn double points on all purchases this month",
      discount: 0,
      multiplier: 2,
      validFrom: "2024-10-01",
      validUntil: "2024-10-31",
      applicableProducts: ["all"],
      type: "loyalty",
      status: "active",
      terms: "Valid for all registered customers. Points credited automatically.",
      badge: "LOYALTY",
      badgeColor: "bg-blue-500"
    }
  ];

  useEffect(() => {
    setOffers(offersData);
  }, []);

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return offer.type === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-orange-600 bg-orange-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isOfferValid = (validFrom, validUntil) => {
    const now = new Date();
    const from = new Date(validFrom);
    const until = new Date(validUntil);
    return now >= from && now <= until;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      
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
              { key: 'limited-time', label: 'Limited Time', icon: Clock },
              { key: 'promotional', label: 'Promotions', icon: Tag },
              { key: 'referral', label: 'Referral', icon: Users },
              { key: 'loyalty', label: 'Loyalty', icon: Star }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20">
                
                {/* Badge */}
                <div className={`absolute -top-4 left-8 ${offer.badgeColor} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                  {offer.badge}
                </div>

                {/* Status Indicator */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                  {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 font-heading">{offer.title}</h3>
                  <p className="text-gray-600 mb-4 font-body leading-relaxed">{offer.description}</p>

                  {/* Offer Details */}
                  <div className="space-y-3 mb-6">
                    {offer.discount > 0 && (
                      <div className="flex items-center gap-3">
                        <Percent className="w-5 h-5 text-purple-500" />
                        <span className="text-gray-700">
                          <span className="font-bold text-2xl text-purple-600">{offer.discount}%</span> Discount
                        </span>
                      </div>
                    )}
                    
                    {offer.reward && (
                      <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-pink-500" />
                        <span className="text-gray-700">
                          <span className="font-bold text-2xl text-pink-600">NOK {offer.reward}</span> Reward
                        </span>
                      </div>
                    )}

                    {offer.multiplier && (
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <span className="text-gray-700">
                          <span className="font-bold text-2xl text-orange-600">{offer.multiplier}x</span> Points
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-600 text-sm">
                        Valid until {new Date(offer.validUntil).toLocaleDateString('no-NO')}
                      </span>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Terms & Conditions:</h4>
                    <p className="text-sm text-gray-600">{offer.terms}</p>
                  </div>

                  {/* Action Button */}
                  <button 
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                      offer.status === 'active' && isOfferValid(offer.validFrom, offer.validUntil)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={offer.status !== 'active' || !isOfferValid(offer.validFrom, offer.validUntil)}
                  >
                    {offer.status === 'upcoming' ? 'Coming Soon' : 
                     offer.status === 'expired' ? 'Expired' :
                     !isOfferValid(offer.validFrom, offer.validUntil) ? 'Not Valid' :
                     'Claim Offer'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredOffers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No offers found</h3>
              <p className="text-gray-500">Try adjusting your filter to see more offers.</p>
            </div>
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