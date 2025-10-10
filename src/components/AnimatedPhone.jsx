import React from 'react';

const AnimatedPhone = () => {
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
      </svg>

      <style jsx>{`
        .notification-pop {
          animation: notificationSlide 2s ease-in-out infinite;
        }

        @keyframes notificationSlide {
          0% {
            transform: translateX(-20px);
            opacity: 0;
          }
          20%, 80% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedPhone;
