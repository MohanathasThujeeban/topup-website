import React, { useState, useEffect } from 'react';
import { Tag, Percent, Gift } from 'lucide-react';

const AnimatedPhone = ({ promotion = null }) => {
  const [showPromo, setShowPromo] = useState(false);
  
  // Debug log
  console.log('AnimatedPhone promotion:', promotion);
  
  // Show promo after 3 seconds delay
  useEffect(() => {
    if (promotion) {
      const timer = setTimeout(() => {
        setShowPromo(true);
      }, 3000); // 3 second delay
      
      return () => clearTimeout(timer);
    }
  }, [promotion]);
  
  return (
    <div className="relative w-full max-w-lg mx-auto animate-float" style={{ paddingBottom: '20%' }}>
      <svg
        viewBox="0 0 716 850"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B6FF5" />
            <stop offset="100%" stopColor="#4F9CFF" />
          </linearGradient>
          
          <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F5F5F7" />
          </linearGradient>

          <linearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FAFAFA" />
            <stop offset="100%" stopColor="#EFEFEF" />
          </linearGradient>

          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
            <feOffset dx="0" dy="10" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Animated floating icons around phone */}
        <g className="animate-float-slow">
          <circle cx="150" cy="150" r="30" fill="#10B981" opacity="0.2">
            <animate attributeName="cy" values="150;130;150" dur="3s" repeatCount="indefinite"/>
          </circle>
          <text x="150" y="160" textAnchor="middle" fontSize="24" fill="#10B981">✓</text>
        </g>

        <g className="animate-float-delay">
          <circle cx="580" cy="400" r="30" fill="#EC4899" opacity="0.2">
            <animate attributeName="cy" values="400;380;400" dur="3s" repeatCount="indefinite"/>
          </circle>
          <text x="580" y="410" textAnchor="middle" fontSize="24" fill="#EC4899">🌐</text>
        </g>

        <g className="animate-float">
          <circle cx="200" cy="600" r="30" fill="#3B82F6" opacity="0.2">
            <animate attributeName="cy" values="600;580;600" dur="3s" repeatCount="indefinite"/>
          </circle>
          <text x="200" y="610" textAnchor="middle" fontSize="24" fill="#3B82F6">⚡</text>
        </g>

        {/* Phone Body - With shadow */}
        <g filter="url(#shadow)">
          <rect
            x="280"
            y="160"
            width="290"
            height="440"
            rx="40"
            fill="url(#phoneGradient)"
            stroke="#1F2937"
            strokeWidth="12"
          />

          {/* Phone Screen */}
          <rect
            x="300"
            y="200"
            width="250"
            height="380"
            rx="25"
            fill="url(#screenGradient)"
          />

          {/* Notch */}
          <rect
            x="370"
            y="180"
            width="110"
            height="30"
            rx="15"
            fill="#1F2937"
          />
          <circle cx="425" cy="195" r="5" fill="#374151"/>
        </g>

        {/* Screen Content */}
        <g>
          {/* Always show original content first - but hide when promo shows */}
          <g opacity={showPromo ? "0" : "1"}>
            {/* PIN Delivered notification */}
            <g className="notification-pop">
              <rect
                x="230"
                y="150"
                width="160"
                height="50"
                rx="25"
                fill="white"
                filter="url(#shadow)"
              >
                <animate attributeName="y" values="150;145;150" dur="2s" repeatCount="indefinite"/>
              </rect>
              <circle cx="250" cy="175" r="6" fill="#5B6FF5">
                <animate attributeName="fill" values="#5B6FF5;#7C8FFF;#5B6FF5" dur="2s" repeatCount="indefinite"/>
              </circle>
              <text x="270" y="180" fill="#6B7280" fontSize="16" fontWeight="600" fontFamily="Inter, sans-serif">
                PIN Delivered!
              </text>
            </g>

            {/* eSIM Delivered notification */}
            <g className="notification-pop" style={{ animationDelay: '1s' }}>
              <rect
                x="230"
                y="220"
                width="180"
                height="50"
                rx="25"
                fill="white"
                filter="url(#shadow)"
              >
                <animate attributeName="y" values="220;215;220" dur="2s" begin="1s" repeatCount="indefinite"/>
              </rect>
              <circle cx="250" cy="245" r="6" fill="#14B8A6">
                <animate attributeName="fill" values="#14B8A6;#5EEAD4;#14B8A6" dur="2s" begin="1s" repeatCount="indefinite"/>
              </circle>
              <text x="270" y="250" fill="#6B7280" fontSize="16" fontWeight="600" fontFamily="Inter, sans-serif">
                eSIM Delivered!
              </text>
            </g>

            {/* E-PIN Icon */}
            <rect
              x="395"
              y="250"
              width="60"
              height="60"
              rx="15"
              fill="#EC4899"
            >
              <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite"/>
            </rect>
            <text x="425" y="290" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" fontFamily="Poppins, sans-serif">
              E
            </text>

            {/* QR Code */}
            <rect
              x="355"
              y="330"
              width="140"
              height="140"
              rx="20"
              fill="#1E5A50"
            >
              <animate attributeName="transform" values="scale(1) translate(0,0); scale(1.05) translate(-3.5,-3.5); scale(1) translate(0,0)" dur="3s" repeatCount="indefinite"/>
            </rect>
            
            {/* QR Code pattern */}
            <g fill="white">
              <rect x="375" y="350" width="100" height="100" rx="5"/>
              <g fill="#1E5A50">
                <rect x="385" y="360" width="20" height="20"/>
                <rect x="415" y="360" width="20" height="20"/>
                <rect x="445" y="360" width="20" height="20"/>
                <rect x="385" y="390" width="20" height="20"/>
                <rect x="445" y="390" width="20" height="20"/>
                <rect x="385" y="420" width="20" height="20"/>
                <rect x="415" y="420" width="20" height="20"/>
                <rect x="445" y="420" width="20" height="20"/>
              </g>
              {/* Corner markers */}
              <rect x="380" y="355" width="25" height="25" fill="none" stroke="#1E5A50" strokeWidth="3"/>
              <rect x="445" y="355" width="25" height="25" fill="none" stroke="#1E5A50" strokeWidth="3"/>
              <rect x="380" y="420" width="25" height="25" fill="none" stroke="#1E5A50" strokeWidth="3"/>
            </g>

            {/* Text: 0:0:r */}
            <text x="425" y="415" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="monospace" letterSpacing="4">
              0:0:r
            </text>

            {/* Progress bar */}
            <rect x="355" y="495" width="140" height="8" rx="4" fill="#D1D5DB"/>
            <rect x="355" y="495" width="90" height="8" rx="4" fill="#10B981">
              <animate attributeName="width" values="40;140;40" dur="3s" repeatCount="indefinite"/>
            </rect>

            {/* Status text */}
            <text x="425" y="540" textAnchor="middle" fill="#6B7280" fontSize="14" fontFamily="Inter, sans-serif">
              Activating eSIM...
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
            </text>
          </g>

          {/* Promotional Overlay - Full Screen Inside Phone - Shows after delay */}
          {promotion && showPromo && (
            <g>
              {/* Full screen promotional overlay with fade-in animation */}
              <rect
                x="300"
                y="200"
                width="250"
                height="380"
                rx="25"
                fill="white"
              >
                <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
              </rect>

              <defs>
                <clipPath id="topRounded">
                  <rect x="300" y="200" width="250" height="180" rx="25" ry="25"/>
                </clipPath>
                <linearGradient id="promoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333EA" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
                <linearGradient id="overlayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Promotional Banner Image or Gradient Background */}
              {promotion.bannerImageUrl ? (
                <>
                  <image
                    href={promotion.bannerImageUrl}
                    x="300"
                    y="200"
                    width="250"
                    height="180"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#topRounded)"
                    crossOrigin="anonymous"
                  >
                    <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
                  </image>
                  {/* Overlay gradient on image for better text visibility */}
                  <rect
                    x="300"
                    y="200"
                    width="250"
                    height="180"
                    fill="url(#overlayGradient)"
                    clipPath="url(#topRounded)"
                  >
                    <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
                  </rect>
                </>
              ) : (
                <rect
                  x="300"
                  y="200"
                  width="250"
                  height="180"
                  fill="url(#promoGradient)"
                  clipPath="url(#topRounded)"
                >
                  <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
                </rect>
              )}

              {/* FEATURED Badge - Top Left */}
              <rect x="310" y="210" width="80" height="22" rx="11" fill="#FFD700">
                <animate attributeName="opacity" values="0;1" dur="0.7s" fill="freeze"/>
              </rect>
              <text x="350" y="226" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="bold" fontFamily="Inter, sans-serif">
                ⭐ FEATURED
                <animate attributeName="opacity" values="0;1" dur="0.7s" fill="freeze"/>
              </text>

              {/* Discount Badge - Top Right Corner */}
              <circle cx="520" cy="230" r="30" fill="#DC2626">
                <animate attributeName="opacity" values="0;1" dur="0.7s" fill="freeze"/>
                <animate attributeName="r" values="0;30" dur="0.5s" fill="freeze"/>
              </circle>
              <text x="520" y="228" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">
                {promotion.discountPercentage || promotion.discountAmount}%
                <animate attributeName="opacity" values="0;1" dur="0.7s" fill="freeze"/>
              </text>
              <text x="520" y="240" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">
                OFF
                <animate attributeName="opacity" values="0;1" dur="0.7s" fill="freeze"/>
              </text>

              {/* Content Section - White Background */}
              {/* Promotion Name - Larger, bold, centered */}
              <text x="425" y="410" textAnchor="middle" fill="#1F2937" fontSize="18" fontWeight="bold" fontFamily="Inter, sans-serif">
                <animate attributeName="opacity" values="0;1" dur="0.9s" fill="freeze"/>
                {(promotion.name || 'Special Offer').substring(0, 16)}
              </text>
              {promotion.name && promotion.name.length > 16 && (
                <text x="425" y="430" textAnchor="middle" fill="#1F2937" fontSize="18" fontWeight="bold" fontFamily="Inter, sans-serif">
                  <animate attributeName="opacity" values="0;1" dur="0.9s" fill="freeze"/>
                  {promotion.name.substring(16, 32)}
                </text>
              )}

              {/* Description - Smaller, gray */}
              {promotion.description && (
                <>
                  <text x="425" y="455" textAnchor="middle" fill="#6B7280" fontSize="11" fontFamily="Inter, sans-serif">
                    <animate attributeName="opacity" values="0;1" dur="1s" fill="freeze"/>
                    {promotion.description.substring(0, 28)}
                  </text>
                  {promotion.description.length > 28 && (
                    <text x="425" y="470" textAnchor="middle" fill="#6B7280" fontSize="11" fontFamily="Inter, sans-serif">
                      <animate attributeName="opacity" values="0;1" dur="1s" fill="freeze"/>
                      {promotion.description.substring(28, 56)}...
                    </text>
                  )}
                </>
              )}

              {/* Promo Code Box - Prominent */}
              <rect x="330" y="490" width="190" height="40" rx="10" fill="#7C3AED">
                <animate attributeName="opacity" values="0;1" dur="1.1s" fill="freeze"/>
                <animate attributeName="y" values="500;490" dur="0.3s" fill="freeze"/>
              </rect>
              <text x="425" y="507" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10" fontFamily="Inter, sans-serif">
                <animate attributeName="opacity" values="0;1" dur="1.1s" fill="freeze"/>
                Use Promo Code
              </text>
              <text x="425" y="523" textAnchor="middle" fill="#FDE047" fontSize="16" fontWeight="bold" fontFamily="monospace" letterSpacing="2">
                <animate attributeName="opacity" values="0;1" dur="1.1s" fill="freeze"/>
                {promotion.promoCode}
              </text>

              {/* Valid Until - Small text */}
              <text x="425" y="550" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontFamily="Inter, sans-serif">
                <animate attributeName="opacity" values="0;1" dur="1.2s" fill="freeze"/>
                {promotion.endDate ? 
                  `Valid until ${new Date(promotion.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 
                  '⏰ Limited Time Only'}
              </text>

              {/* Call to Action - Eye-catching */}
              <text x="425" y="570" textAnchor="middle" fill="#10B981" fontSize="13" fontWeight="bold" fontFamily="Inter, sans-serif">
                <animate attributeName="opacity" values="0;1" dur="1.3s" fill="freeze"/>
                👉 Shop Now & Save!
              </text>
            </g>
          )}
        </g>
      </svg>

      {/* Animation styles are defined in index.css */}
    </div>
  );
};

export default AnimatedPhone;
