import React, { useState } from 'react';

// A small avatar component with image + graceful fallback to initials
// Props:
// - name: string (used to generate initials)
// - src: optional image url
// - className: extra classes for the outer container
// - sizeClasses: tailwind size classes like "w-8 h-8" (defaults to w-8 h-8)
// - rounded: tailwind rounded class (defaults to rounded-lg)
export default function Avatar({ name = 'User', src, className = '', sizeClasses = 'w-8 h-8', rounded = 'rounded-lg' }) {
  const [error, setError] = useState(false);
  const initials = (name || 'U').trim().split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase();
  const showImage = src && !error;

  return (
    <div className={`${sizeClasses} ${rounded} overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          className={`object-cover ${sizeClasses} ${rounded}`}
          onError={() => setError(true)}
        />)
        : (
        <span className="font-semibold text-sm select-none">
          {initials}
        </span>
      )}
    </div>
  );
}
