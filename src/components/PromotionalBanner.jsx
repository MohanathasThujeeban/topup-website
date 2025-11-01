import React, { useState, useEffect } from 'react';
import { X, Tag, Clock } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function PromotionalBanner() {
  const [activePromo, setActivePromo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const dismissed = sessionStorage.getItem('promoBannerDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    fetchActivePromotion();
  }, []);

  const fetchActivePromotion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/promotions/featured`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          // Get the first featured promotion
          setActivePromo(data.data[0]);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Error fetching promotion:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('promoBannerDismissed', 'true');
  };

  const handleCopyCode = () => {
    if (activePromo?.promoCode) {
      navigator.clipboard.writeText(activePromo.promoCode);
      alert(`Code "${activePromo.promoCode}" copied to clipboard!`);
    }
  };

  if (!isVisible || isDismissed || !activePromo) {
    return null;
  }

  const getDaysRemaining = () => {
    const now = new Date();
    const end = new Date(activePromo.endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left side - Promo info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
              <Tag size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white bg-opacity-20 backdrop-blur-sm">
                  🎉 LIMITED OFFER
                </span>
                {getDaysRemaining() > 0 && getDaysRemaining() <= 7 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium">
                    <Clock size={14} />
                    {getDaysRemaining()} {getDaysRemaining() === 1 ? 'day' : 'days'} left!
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold truncate">{activePromo.name}</h3>
              <p className="text-sm opacity-90 hidden sm:block">{activePromo.description}</p>
            </div>
          </div>

          {/* Center - Promo Code */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xs opacity-90 mb-1">Use Code</div>
              <button
                onClick={handleCopyCode}
                className="group relative px-6 py-2 bg-white text-indigo-600 font-mono font-bold text-lg rounded-lg hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95"
              >
                {activePromo.promoCode}
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Click to copy
                </span>
              </button>
            </div>

            {/* Discount Badge */}
            <div className="text-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-xs opacity-90">Save</div>
              <div className="text-2xl font-bold">
                {activePromo.discountType === 'PERCENTAGE' 
                  ? `${activePromo.discountValue}%`
                  : `${activePromo.discountValue} kr`}
              </div>
            </div>
          </div>

          {/* Right side - CTA & Close */}
          <div className="flex items-center gap-3">
            <a
              href="/bundles"
              className="px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Shop Now
            </a>

            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              aria-label="Dismiss banner"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom progress bar for time remaining */}
      {getDaysRemaining() > 0 && getDaysRemaining() <= 30 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20">
          <div 
            className="h-full bg-white transition-all duration-1000"
            style={{ 
              width: `${Math.max(0, 100 - (getDaysRemaining() / 30 * 100))}%` 
            }}
          />
        </div>
      )}
    </div>
  );
}
