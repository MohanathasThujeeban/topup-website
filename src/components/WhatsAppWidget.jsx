import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const whatsappNumber = '47XXXXXXXXX'; // Replace with actual number
  const message = 'Hi, I need help with my order';

  useEffect(() => {
    // Show widget after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Handle scroll behavior
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 300) {
        // Scrolling down
        setIsVisible(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className={`fixed bottom-5 right-5 z-50 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-75'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-3 animate-float">
            <div className="bg-gray-900/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-2xl text-sm whitespace-nowrap border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                Need help? Chat with us!
              </div>
              <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900/90"></div>
            </div>
          </div>
        )}

        {/* Notification Badge */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-xs font-bold">1</span>
        </div>

        {/* WhatsApp Button */}
        <button
          onClick={handleClick}
          className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 animate-glow group"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={32} className="text-white group-hover:scale-110 transition-transform duration-300" />
          
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping" style={{animationDelay: '0.5s'}}></div>
        </button>
      </div>
    </>
  );
};

export default WhatsAppWidget;
