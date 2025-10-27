import React from 'react';
import { Zap, Wifi, Database, Shield } from 'lucide-react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  submessage = '',
  variant = 'default',
  size = 'medium',
  showProgress = false,
  progress = 0
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    xlarge: 'w-32 h-32'
  };

  const iconSizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12'
  };

  const variants = {
    default: {
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-700',
      accentColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      glowColor: 'shadow-blue-500/20'
    },
    success: {
      gradient: 'from-green-600 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      textColor: 'text-green-700',
      accentColor: 'text-green-600',
      borderColor: 'border-green-200',
      glowColor: 'shadow-green-500/20'
    },
    warning: {
      gradient: 'from-yellow-600 to-orange-600',
      bgGradient: 'from-yellow-50 to-orange-50',
      textColor: 'text-orange-700',
      accentColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      glowColor: 'shadow-yellow-500/20'
    },
    error: {
      gradient: 'from-red-600 to-rose-600',
      bgGradient: 'from-red-50 to-rose-50',
      textColor: 'text-red-700',
      accentColor: 'text-red-600',
      borderColor: 'border-red-200',
      glowColor: 'shadow-red-500/20'
    },
    purple: {
      gradient: 'from-purple-600 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      textColor: 'text-purple-700',
      accentColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      glowColor: 'shadow-purple-500/20'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Main Spinner Container */}
      <div className="relative mb-6">
        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r ${currentVariant.gradient} opacity-20 animate-pulse`}></div>
        
        {/* Rotating Border */}
        <div className={`relative ${sizeClasses[size]} rounded-full border-4 ${currentVariant.borderColor} border-t-transparent`}>
          <div className={`absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r ${currentVariant.gradient} opacity-75 animate-spin`}
               style={{
                 maskImage: 'linear-gradient(transparent 25%, black 75%)',
                 WebkitMaskImage: 'linear-gradient(transparent 25%, black 75%)'
               }}></div>
        </div>

        {/* Inner Icon */}
        <div className={`absolute inset-0 flex items-center justify-center ${currentVariant.accentColor}`}>
          <Zap className={`${iconSizeClasses[size]} animate-pulse`} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${currentVariant.gradient} animate-ping`} 
               style={{ top: '10%', right: '20%', animationDelay: '0s' }}></div>
          <div className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${currentVariant.gradient} animate-ping`} 
               style={{ bottom: '15%', left: '25%', animationDelay: '0.5s' }}></div>
          <div className={`absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r ${currentVariant.gradient} animate-ping`} 
               style={{ top: '30%', left: '10%', animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className={`w-48 h-2 bg-gray-200 rounded-full overflow-hidden mb-4 ${currentVariant.glowColor} shadow-lg`}>
          <div 
            className={`h-full bg-gradient-to-r ${currentVariant.gradient} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
      )}

      {/* Text Content */}
      <div className="text-center space-y-2">
        <p className={`text-lg font-semibold ${currentVariant.textColor} animate-pulse`}>
          {message}
        </p>
        {submessage && (
          <p className="text-sm text-gray-500 max-w-xs">
            {submessage}
          </p>
        )}
      </div>

      {/* Animated Status Indicators */}
      <div className="flex items-center gap-4 mt-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Database className={`w-4 h-4 animate-pulse ${currentVariant.accentColor}`} />
          <span>Loading</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Wifi className={`w-4 h-4 animate-pulse ${currentVariant.accentColor}`} style={{ animationDelay: '0.3s' }} />
          <span>Connecting</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Shield className={`w-4 h-4 animate-pulse ${currentVariant.accentColor}`} style={{ animationDelay: '0.6s' }} />
          <span>Secure</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;