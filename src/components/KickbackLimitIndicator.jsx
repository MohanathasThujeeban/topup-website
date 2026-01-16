import React from 'react';
import { TrendingUp, Gift, AlertCircle } from 'lucide-react';

/**
 * Kickback Limit Level Indicator Component
 * Displays retailer's kickback bonus limit status with visual progress bar
 */
const KickbackLimitIndicator = ({ 
  kickbackLimit = 0, 
  usedKickback = 0, 
  availableKickback = 0,
  usagePercentage = 0,
  status = 'NOT_SET'
}) => {
  // Determine color scheme based on usage percentage
  const getColorClass = () => {
    if (status === 'NOT_SET') return 'gray';
    if (usagePercentage >= 90) return 'red';
    if (usagePercentage >= 70) return 'yellow';
    return 'green';
  };

  const colorClass = getColorClass();

  // Color configurations
  const colorConfigs = {
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      progress: 'bg-gray-400',
      barBg: 'bg-gray-200',
      icon: 'text-gray-500',
      badge: 'bg-gray-100 text-gray-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      progress: 'bg-green-500',
      barBg: 'bg-green-200',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      progress: 'bg-yellow-500',
      barBg: 'bg-yellow-200',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      progress: 'bg-red-500 animate-pulse',
      barBg: 'bg-red-200',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-700'
    }
  };

  const colors = colorConfigs[colorClass];

  // Get status message
  const getStatusMessage = () => {
    if (status === 'NOT_SET') return 'Kickback limit not set';
    if (usagePercentage >= 95) return 'Critical - Limit Almost Reached';
    if (usagePercentage >= 80) return 'Warning - High Usage';
    if (usagePercentage >= 50) return 'Moderate Usage';
    return 'Healthy - Good Balance';
  };

  if (status === 'NOT_SET') {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${colors.badge} rounded-full flex items-center justify-center`}>
            <AlertCircle className={colors.icon} size={24} />
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-semibold ${colors.text}`}>Kickback Bonus Limit</h4>
            <p className="text-xs text-gray-500 mt-1">Not configured by admin yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 transition-all hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 ${colors.badge} rounded-full flex items-center justify-center`}>
            <Gift className={colors.icon} size={20} />
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${colors.text}`}>Kickback Bonus Limit</h4>
            <p className="text-xs text-gray-500">{getStatusMessage()}</p>
          </div>
        </div>
        <div className={`px-3 py-1 ${colors.badge} rounded-full text-xs font-bold`}>
          {usagePercentage.toFixed(1)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className={`w-full h-3 ${colors.barBg} rounded-full overflow-hidden`}>
          <div 
            className={`h-full ${colors.progress} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Limit</p>
          <p className={`text-sm font-bold ${colors.text}`}>{kickbackLimit.toFixed(2)} kr</p>
        </div>
        <div className="text-center border-x border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Used</p>
          <p className={`text-sm font-bold ${colors.text}`}>{usedKickback.toFixed(2)} kr</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Available</p>
          <p className={`text-sm font-bold ${colors.text}`}>{availableKickback.toFixed(2)} kr</p>
        </div>
      </div>

      {/* Warning Message */}
      {usagePercentage >= 80 && (
        <div className={`mt-3 p-2 ${colors.bg} border ${colors.border} rounded-lg`}>
          <p className={`text-xs ${colors.text} flex items-center gap-2`}>
            <AlertCircle size={14} />
            <span>
              {usagePercentage >= 95 
                ? 'Contact admin to increase your kickback limit' 
                : 'Consider planning your kickback usage'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default KickbackLimitIndicator;
