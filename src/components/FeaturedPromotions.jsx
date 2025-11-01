import React, { useState, useEffect } from 'react';
import { Tag, Gift, Calendar, Percent, TrendingUp, Award, Clock } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function FeaturedPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      // Fetch featured promotions (public endpoint)
      const promoResponse = await fetch(`${API_BASE_URL}/admin/promotions/featured`);
      if (promoResponse.ok) {
        const promoData = await promoResponse.json();
        setPromotions(promoData.data || []);
      }

      // Fetch featured campaigns (public endpoint)
      const campaignResponse = await fetch(`${API_BASE_URL}/admin/rewards/featured`);
      if (campaignResponse.ok) {
        const campaignData = await campaignResponse.json();
        setCampaigns(campaignData.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (promotions.length === 0 && campaigns.length === 0) {
    return null; // Don't show section if no featured content
  }

  return (
    <div className="space-y-12 py-12">
      {/* Featured Promotions */}
      {promotions.length > 0 && (
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <Tag className="text-indigo-600" size={32} />
              Special Offers & Promotions
            </h2>
            <p className="text-gray-600">Save more with our exclusive promotional codes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div 
                key={promo.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                {promo.bannerImageUrl && (
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                    <img 
                      src={promo.bannerImageUrl} 
                      alt={promo.name}
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{promo.name}</h3>
                      <p className="text-gray-600 text-sm">{promo.description}</p>
                    </div>
                    {promo.isFeatured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="text-indigo-600" size={20} />
                        <span className="text-sm font-medium text-gray-700">Promo Code</span>
                      </div>
                      <code className="text-lg font-bold text-indigo-600 tracking-wider">
                        {promo.promoCode}
                      </code>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Percent className="text-green-600" size={20} />
                        <span className="text-sm font-medium text-gray-700">Discount</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {promo.discountType === 'PERCENTAGE' 
                          ? `${promo.discountValue}% OFF`
                          : `NOK ${promo.discountValue} OFF`}
                      </span>
                    </div>

                    {promo.minOrderValue && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="text-gray-600" size={20} />
                          <span className="text-sm font-medium text-gray-700">Min. Order</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          NOK {promo.minOrderValue}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-purple-600" size={20} />
                        <span className="text-sm font-medium text-gray-700">Valid Until</span>
                      </div>
                      <span className="text-sm font-semibold text-purple-900">
                        {new Date(promo.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {promo.usageLimit && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Usage: {promo.usageCount || 0} / {promo.usageLimit}</span>
                        <span>{Math.round(((promo.usageCount || 0) / promo.usageLimit) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(((promo.usageCount || 0) / promo.usageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2">
                    <Tag size={18} />
                    Apply Code at Checkout
                  </button>

                  {promo.termsAndConditions && (
                    <details className="mt-4">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        Terms & Conditions
                      </summary>
                      <p className="text-xs text-gray-600 mt-2 pl-4">
                        {promo.termsAndConditions}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Reward Campaigns */}
      {campaigns.length > 0 && (
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <Gift className="text-purple-600" size={32} />
              Reward Campaigns
            </h2>
            <p className="text-gray-600">Earn rewards with every purchase</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                {campaign.bannerImageUrl && (
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600">
                    <img 
                      src={campaign.bannerImageUrl} 
                      alt={campaign.name}
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h3>
                      <p className="text-gray-600 text-sm">{campaign.description}</p>
                    </div>
                    {campaign.isFeatured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="text-purple-600" size={20} />
                        <span className="text-sm font-medium text-gray-700">Reward</span>
                      </div>
                      <span className="text-lg font-bold text-purple-600">
                        {campaign.rewardType === 'POINTS' 
                          ? `${campaign.rewardValue} Points`
                          : campaign.rewardType === 'CASHBACK_PERCENTAGE'
                          ? `${campaign.rewardValue}% Cashback`
                          : `NOK ${campaign.rewardValue}`}
                      </span>
                    </div>

                    {campaign.minOrderValue && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="text-gray-600" size={20} />
                          <span className="text-sm font-medium text-gray-700">Min. Order</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          NOK {campaign.minOrderValue}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="text-green-600" size={20} />
                        <span className="text-sm font-medium text-gray-700">Campaign Ends</span>
                      </div>
                      <span className="text-sm font-semibold text-green-900">
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {campaign.isReferralCampaign && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Gift size={20} />
                          <span className="text-sm font-medium">Referral Rewards Available</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {campaign.totalBudget && campaign.budgetUsed !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Budget Used: NOK {campaign.budgetUsed.toLocaleString()}</span>
                        <span>{Math.round((campaign.budgetUsed / campaign.totalBudget) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((campaign.budgetUsed / campaign.totalBudget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2">
                    <Gift size={18} />
                    Learn More
                  </button>

                  {campaign.termsAndConditions && (
                    <details className="mt-4">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        Terms & Conditions
                      </summary>
                      <p className="text-xs text-gray-600 mt-2 pl-4">
                        {campaign.termsAndConditions}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
