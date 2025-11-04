import React, { useState, useEffect } from 'react';
import { Sparkles, X, Gift, Percent, Calendar, Info, Tag } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function RetailerPromotionalBanner({ onClose }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % promotions.length);
        setImageLoaded(false); // Reset image loaded state when changing promo
      }, 5000); // Change promotion every 5 seconds

      return () => clearInterval(interval);
    }
  }, [promotions.length]);

  const fetchActivePromotions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/promotions/active`);
      
      if (response.ok) {
        const data = await response.json();
        // Filter for public and active promotions - KEEP the bannerImage
        const publicPromotions = (data.data || []).filter(
          promo => promo.public && promo.status === 'ACTIVE'
        );
        
        setPromotions(publicPromotions);
        console.log('Active promotions loaded:', publicPromotions.length);
        if (publicPromotions.length > 0) {
          console.log('Banner image (bannerImage):', !!publicPromotions[0].bannerImage);
          console.log('Banner image (bannerImageUrl):', !!publicPromotions[0].bannerImageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl p-4 mb-6 animate-pulse">
        <div className="h-24 bg-white/20 rounded"></div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  const currentPromo = promotions[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 shadow-2xl animate-slideIn bg-gradient-to-r from-pink-500 via-rose-500 to-red-500">
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-gradient-x"></div>
      
      {/* Main Content - Split Layout */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
          
          {/* LEFT SIDE - Promotional Content */}
          <div className="space-y-3 sm:space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1">
                <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                    <span className="px-2 sm:px-3 py-1 bg-yellow-400 text-purple-900 text-xs font-bold rounded-full uppercase tracking-wide">
                      Special Offer
                    </span>
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                      {currentPromo.status}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words">
                    {currentPromo.name || 'Exclusive Promotion'}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm mt-1 line-clamp-2">
                    {currentPromo.description}
                  </p>
                </div>
              </div>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* Promo Code Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border-2 border-white/30">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                    <Percent className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 flex-shrink-0" />
                    <span className="text-white/80 text-xs font-medium">Promo Code</span>
                  </div>
                  <code className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wider break-all">
                    {currentPromo.promoCode}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentPromo.promoCode);
                    alert('Promo code copied!');
                  }}
                  className="px-3 sm:px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-semibold rounded-lg transition-all duration-200 hover:scale-105 text-sm whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Discount Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="bg-yellow-400 text-purple-900 rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-center flex-shrink-0">
                <div className="text-3xl sm:text-4xl font-bold">
                  {currentPromo.discountType === 'PERCENTAGE' 
                    ? `${currentPromo.discountValue}%`
                    : `${currentPromo.discountValue}`
                  }
                </div>
                <div className="text-xs font-semibold uppercase">OFF</div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-1 sm:space-y-2 w-full">
                <div className="flex items-center space-x-2 text-white text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 flex-shrink-0" />
                  <span className="break-words">Valid Until: <strong>{formatDate(currentPromo.endDate)}</strong></span>
                </div>
                {currentPromo.minOrderValue > 0 && (
                  <div className="flex items-center space-x-2 text-white text-xs sm:text-sm">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 flex-shrink-0" />
                    <span>Min. Order: <strong>NOK {currentPromo.minOrderValue}</strong></span>
                  </div>
                )}
                {currentPromo.maxDiscountAmount > 0 && (
                  <div className="flex items-center space-x-2 text-white text-xs sm:text-sm">
                    <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 flex-shrink-0" />
                    <span>Max Discount: <strong>NOK {currentPromo.maxDiscountAmount}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            {currentPromo.termsAndConditions && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                <p className="text-white/80 text-xs">
                  <strong>Terms & Conditions:</strong> {currentPromo.termsAndConditions}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - Promotional Image */}
          <div className="relative order-first md:order-last">
            {(currentPromo.bannerImage || currentPromo.bannerImageUrl) ? (
              <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img 
                  src={currentPromo.bannerImage 
                    ? `data:image/jpeg;base64,${currentPromo.bannerImage}`
                    : currentPromo.bannerImageUrl
                  }
                  alt={currentPromo.name}
                  className="w-full h-48 sm:h-56 md:h-80 object-cover"
                  onError={(e) => {
                    console.error('Image failed to load');
                    e.target.style.display = 'none';
                  }}
                />
                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            ) : (
              /* Placeholder when no image */
              <div className="relative rounded-xl overflow-hidden shadow-2xl h-48 sm:h-56 md:h-80 bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                <div className="text-center text-white/50">
                  <Gift className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-2 sm:mb-4 animate-bounce" />
                  <p className="text-base sm:text-lg font-semibold">Promotional Offer</p>
                </div>
              </div>
            )}
            
            {/* Decorative sparkles around image */}
            <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 animate-bounce-slow">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 animate-bounce delay-1000">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 drop-shadow-lg" />
            </div>
          </div>

        </div>

        {/* Pagination Dots */}
        {promotions.length > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-yellow-300' 
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
