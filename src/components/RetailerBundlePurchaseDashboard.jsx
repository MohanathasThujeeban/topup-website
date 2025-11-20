import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, CreditCard, TrendingUp, AlertCircle,
  CheckCircle, DollarSign, Award, Bell, RefreshCw, Eye, Lock,
  Download, ChevronRight, Info, Activity, Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function RetailerBundlePurchaseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bundles, setBundles] = useState([]);
  const [creditStatus, setCreditStatus] = useState(null);
  const [creditLevels, setCreditLevels] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(null);
  const [purchasingBundleId, setPurchasingBundleId] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [bundlesRes, creditStatusRes, levelsRes, inventoryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/retailer/bundles`, { headers }),
        fetch(`${API_BASE_URL}/retailer/credit-status`, { headers }),
        fetch(`${API_BASE_URL}/retailer/credit-levels`, { headers }),
        fetch(`${API_BASE_URL}/retailer/inventory`, { headers })
      ]);

      if (bundlesRes.ok) {
        const data = await bundlesRes.json();
        setBundles(data.bundles || []);
      }

      if (creditStatusRes.ok) {
        const data = await creditStatusRes.json();
        setCreditStatus(data.data);
      }

      if (levelsRes.ok) {
        const data = await levelsRes.json();
        setCreditLevels(data.levels || []);
      }

      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        setInventory(data.data?.inventory || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPurchase = async (bundle, quantity) => {
    if (!bundle || !quantity) return;

    try {
      setPurchasingBundleId(bundle.id);
      setPurchasing(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      
      const requestBody = {
        productId: bundle.id,
        quantity: quantity
      };
      
      console.log('🛒 Direct purchase:', requestBody);
      console.log('📦 Bundle:', bundle);
      
      const response = await fetch(`${API_BASE_URL}/retailer/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('📥 Response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        const textResponse = await response.text();
        console.error('📄 Raw response:', textResponse);
        throw new Error('Server returned invalid response');
      }

      if (response.ok && data.success) {
        setSuccess(`✅ Purchase successful! ${data.itemsAllocated || quantity} items added to your inventory.`);
        
        // Close modal and refresh data
        setShowPurchaseModal(false);
        await fetchDashboardData();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorMessage = data.message || data.error || `Purchase failed with status ${response.status}`;
        console.error('❌ Purchase failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('💥 Purchase error:', error);
      setError('Purchase failed: ' + error.message);
    } finally {
      setPurchasing(false);
      setPurchasingBundleId(null);
    }
  };

  // Helper function to get unique prices from bundles
  const getUniquePrices = () => {
    const prices = new Set();
    // Filter out ESIM bundles, only show EPIN bundles
    bundles.filter(bundle => bundle.productType !== 'ESIM').forEach(bundle => {
      if (bundle.basePrice) {
        prices.add(bundle.basePrice);
      }
    });
    return Array.from(prices).sort((a, b) => a - b);
  };

  // Helper function to get bundles by price (exclude eSIM)
  const getBundlesByPrice = (price) => {
    const epinBundles = bundles.filter(bundle => bundle.productType !== 'ESIM');
    if (!price) return epinBundles;
    return epinBundles.filter(bundle => bundle.basePrice === price);
  };

  // Helper function to get bundle count by price (exclude eSIM)
  const getBundleCountByPrice = (price) => {
    return bundles.filter(bundle => bundle.productType !== 'ESIM' && bundle.basePrice === price).length;
  };

  const getCreditLevelColor = (usagePercent) => {
    if (usagePercent >= 100) return 'text-red-600 bg-red-50';
    if (usagePercent >= 90) return 'text-orange-600 bg-orange-50';
    if (usagePercent >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getCreditLevelBadge = (usagePercent) => {
    if (usagePercent >= 100) return { text: 'LIMIT EXCEEDED', color: 'bg-red-500' };
    if (usagePercent >= 90) return { text: 'WARNING', color: 'bg-orange-500' };
    if (usagePercent >= 75) return { text: 'HIGH USAGE', color: 'bg-yellow-500' };
    return { text: 'GOOD', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Retailer Panel</h1>
          <p className="text-gray-600">EasyTopup.no</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Credit Status Card - Enhanced */}
        {creditStatus && (
          <div className="mb-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 animate-gradient p-6 md:p-8 text-white overflow-hidden">
              {/* Animated Background Circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold">Credit Status</h2>
                        <p className="text-blue-100 text-sm">Real-time account overview</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <Award className="w-10 h-10 opacity-80" />
                  </div>
                </div>

                {/* Warning Alert */}
                {creditStatus.needsWarning && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-start gap-3 border border-white/30">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-yellow-900" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1">
                        {creditStatus.isBlocked ? '⛔ Credit Limit Exceeded' : '⚠️ Credit Warning'}
                      </p>
                      <p className="text-sm text-blue-100">
                        {creditStatus.isBlocked 
                          ? 'Your credit limit has been exceeded. Please contact admin or make a payment to continue purchasing.'
                          : 'You have used 90% of your credit limit. Consider planning your payments or requesting a limit increase.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
                {/* Credit Limit */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Credit Limit</p>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    NOK {creditStatus.creditLimit?.toLocaleString() || '0'}
                  </p>
                </div>

                {/* Available Credit */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Available</p>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    NOK {creditStatus.availableCredit?.toLocaleString() || '0'}
                  </p>
                </div>

                {/* Used Credit */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Used</p>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-orange-600">
                    NOK {creditStatus.usedCredit?.toLocaleString() || '0'}
                  </p>
                </div>

                {/* Usage Percentage */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Usage</p>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {creditStatus.usagePercentage?.toFixed(1) || '0'}%
                    </p>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getCreditLevelBadge(creditStatus.usagePercentage).color} text-white`}>
                      {getCreditLevelBadge(creditStatus.usagePercentage).text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Credit Usage</span>
                  <span className="text-sm font-bold text-gray-900">
                    {creditStatus.usagePercentage?.toFixed(1) || '0'}% of {creditStatus.creditLimit?.toLocaleString()} NOK
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-200 animate-shimmer"></div>
                  
                  {/* Progress bar */}
                  <div 
                    className={`relative h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${
                      creditStatus.usagePercentage >= 100 ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' :
                      creditStatus.usagePercentage >= 90 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      creditStatus.usagePercentage >= 75 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ width: `${Math.min(creditStatus.usagePercentage || 0, 100)}%` }}
                  >
                    <span className="text-[10px] font-bold text-white drop-shadow">
                      {creditStatus.usagePercentage?.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                {/* Progress markers */}
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-xs text-gray-500">0%</span>
                  <span className="text-xs text-yellow-600 font-medium">75%</span>
                  <span className="text-xs text-orange-600 font-medium">90%</span>
                  <span className="text-xs text-red-600 font-medium">100%</span>
                </div>
              </div>

              {/* Current Level Info Card */}
              {creditStatus.currentLevel && (
                <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Current Level</p>
                        <p className="text-xl font-bold text-blue-900">{creditStatus.currentLevel.name}</p>
                        <p className="text-sm text-gray-700">{creditStatus.currentLevel.description}</p>
                      </div>
                    </div>
                    {creditStatus.currentLevel.nextLevel && (
                      <div className="flex items-center gap-3">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                        <div className="text-right">
                          <p className="text-xs text-gray-600 font-medium mb-1">Next Level</p>
                          <p className="text-lg font-bold text-purple-900">{creditStatus.currentLevel.nextLevelName}</p>
                          <p className="text-xs text-gray-600">Contact admin to upgrade</p>
                        </div>
                      </div>
                    )}
                    {!creditStatus.currentLevel.nextLevel && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
                        <Award className="w-5 h-5 text-white" />
                        <span className="text-sm font-bold text-white">Max Level</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Credit Levels - Enhanced Design */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Credit Levels</h2>
              <p className="text-sm text-gray-600">Your account tier and available credit limits</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {creditLevels.filter(l => l.isCurrentLevel).length > 0 ? 'Active Account' : 'Setup Required'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {creditLevels.map((level, index) => (
              <div
                key={index}
                className={`relative group transition-all duration-300 ${
                  level.isCurrentLevel ? 'transform scale-105' : ''
                }`}
              >
                {/* Card */}
                <div
                  className={`rounded-2xl border-2 p-4 md:p-5 transition-all duration-300 ${
                    level.isCurrentLevel
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-blue-50 to-purple-50 shadow-xl ring-4 ring-blue-100'
                      : level.isAvailable
                      ? 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
                      : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  } ${!level.isAvailable && !level.isCurrentLevel ? 'blur-[1px]' : ''}`}
                >
                  {/* Lock Icon for Unavailable */}
                  {!level.isAvailable && !level.isCurrentLevel && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Lock className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  )}

                  {/* Current Level Badge */}
                  {level.isCurrentLevel && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                        <span className="relative flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                          <CheckCircle className="w-3 h-3" />
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Level Number Badge */}
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold mb-3 ${
                    level.isCurrentLevel
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md'
                      : level.isAvailable
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    {/* Amount */}
                    <div className={`text-lg md:text-xl font-bold ${
                      level.isCurrentLevel
                        ? 'text-blue-900'
                        : level.isAvailable
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}>
                      {level.displayName}
                    </div>

                    {/* Description */}
                    <p className={`text-xs leading-tight ${
                      level.isCurrentLevel
                        ? 'text-blue-700'
                        : level.isAvailable
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}>
                      {level.description}
                    </p>

                    {/* Status Indicator */}
                    {level.isCurrentLevel ? (
                      <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold pt-1">
                        <Award className="w-3 h-3" />
                        <span>Your Level</span>
                      </div>
                    ) : level.isAvailable ? (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-medium pt-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-medium pt-1">
                        <Lock className="w-3 h-3" />
                        <span>Contact Admin</span>
                      </div>
                    )}
                  </div>

                  {/* Hover Effect for Available Levels */}
                  {level.isAvailable && !level.isCurrentLevel && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                  )}
                </div>

                {/* Connector Line (except last item) */}
                {index < creditLevels.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-gray-300 to-transparent transform -translate-y-1/2 z-0">
                    <div className={`h-full bg-gradient-to-r transition-all duration-500 ${
                      level.isCurrentLevel ? 'from-blue-500 to-blue-300 w-full' : 'from-gray-300 to-transparent w-0'
                    }`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Level Progress Bar - Always Show */}
          {creditLevels.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Level Progression</h4>
                    <p className="text-xs text-gray-500">Your journey through credit tiers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Current Progress</p>
                  <p className="text-lg font-bold text-blue-600">
                    {creditStatus?.currentLevel 
                      ? `Level ${creditLevels.findIndex(l => l.isCurrentLevel) + 1} of ${creditLevels.length}`
                      : 'Not Started'
                    }
                  </p>
                </div>
              </div>

              {/* Visual Progress Bar with Steps */}
              <div className="relative mb-6">
                {/* Background Track */}
                <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 rounded-full"></div>
                
                {/* Progress Track */}
                {creditStatus?.currentLevel && (
                  <div 
                    className="absolute top-5 left-0 h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${((creditLevels.findIndex(l => l.isCurrentLevel) + 1) / creditLevels.length) * 100}%` 
                    }}
                  ></div>
                )}

                {/* Level Steps */}
                <div className="relative flex justify-between">
                  {creditLevels.map((level, index) => {
                    const currentLevelIndex = creditLevels.findIndex(l => l.isCurrentLevel);
                    const isCurrentOrPassed = creditStatus?.currentLevel && index <= currentLevelIndex;
                    const isCurrent = level.isCurrentLevel;
                    
                    return (
                      <div key={index} className="flex flex-col items-center" style={{ width: `${100 / creditLevels.length}%` }}>
                        {/* Step Circle */}
                        <div 
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isCurrent
                              ? 'bg-gradient-to-br from-blue-600 to-purple-600 ring-4 ring-blue-200 shadow-lg scale-125'
                              : isCurrentOrPassed
                              ? 'bg-gradient-to-br from-green-500 to-blue-500 shadow-md'
                              : 'bg-gray-300 border-2 border-gray-200'
                          }`}
                        >
                          {isCurrent ? (
                            <Award className="w-5 h-5 text-white animate-pulse" />
                          ) : isCurrentOrPassed ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        
                        {/* Level Info */}
                        <div className="mt-3 text-center">
                          <p className={`text-xs font-bold mb-1 ${
                            isCurrent ? 'text-blue-600' : isCurrentOrPassed ? 'text-gray-700' : 'text-gray-400'
                          }`}>
                            {level.displayName?.split(' ')[0] || `L${index + 1}`}
                          </p>
                          {isCurrent && (
                            <span className="inline-block px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                              CURRENT
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Details */}
              {creditStatus?.currentLevel ? (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {creditStatus.currentLevel.nextLevel ? 'Progress to Next Level' : 'Maximum Level Achieved'}
                      </h4>
                      {creditStatus.currentLevel.nextLevel ? (
                        <p className="text-sm text-gray-600">
                          You're currently at <span className="font-bold text-blue-600">{creditStatus.currentLevel.name}</span>.
                          Contact admin to upgrade to <span className="font-bold text-purple-600">{creditStatus.currentLevel.nextLevelName}</span> for higher credit limits.
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          🎉 Congratulations! You've reached the highest credit level at <span className="font-bold text-blue-600">{creditStatus.currentLevel.name}</span>.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Setup Required</h4>
                      <p className="text-sm text-gray-600">
                        Your credit level has not been set up yet. Please contact the administrator to assign your credit limit and start purchasing bundles.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Available Bundles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Available EPIN Bundles for Purchase</h2>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Catalog
            </button>
          </div>

          {/* Price Category Filter Cards */}
          {bundles.filter(b => b.productType !== 'ESIM').length > 0 && getUniquePrices().length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Filter size={16} className="text-indigo-600" />
                Filter by Price Category
              </h4>
              <div className="flex flex-wrap gap-3">
                {/* All Bundles Card */}
                <button
                  onClick={() => setSelectedPriceFilter(null)}
                  className={`px-6 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    selectedPriceFilter === null
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold">All Bundles</span>
                    <span className="text-xs opacity-80">{bundles.filter(b => b.productType !== 'ESIM').length} items</span>
                  </div>
                </button>

                {/* Price Category Cards */}
                {getUniquePrices().map((price) => (
                  <button
                    key={price}
                    onClick={() => setSelectedPriceFilter(price)}
                    className={`px-6 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      selectedPriceFilter === price
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold">{price} NOK</span>
                      <span className="text-xs opacity-80">{getBundleCountByPrice(price)} bundles</span>
                    </div>
                  </button>
                ))}
              </div>
              {selectedPriceFilter && (
                <div className="mt-4 flex items-center gap-2 text-sm text-indigo-700">
                  <CheckCircle size={14} />
                  <span>Showing {getBundlesByPrice(selectedPriceFilter).length} bundles at {selectedPriceFilter} NOK</span>
                </div>
              )}
            </div>
          )}

          {bundles.filter(b => b.productType !== 'ESIM').length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No EPIN bundles available for purchase</p>
              <p className="text-gray-500 text-sm">EPIN bundles will appear here once admin adds them to the catalog</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getBundlesByPrice(selectedPriceFilter).map((bundle) => (
                <div key={bundle.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
                        {bundle.productType}
                      </span>
                      <span className="text-2xl font-bold">NOK {bundle.basePrice}</span>
                    </div>
                    <h3 className="text-lg font-bold">{bundle.name}</h3>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>
                    
                    <div className="mb-4">
                      {bundle.dataAmount && (
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Data</span>
                          <span className="font-semibold text-gray-900">{bundle.dataAmount}</span>
                        </div>
                      )}
                      {bundle.validity && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Validity</span>
                          <span className="font-semibold text-gray-900">{bundle.validity}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBundle(bundle);
                        setPurchaseQuantity(1);
                        setShowPurchaseModal(true);
                      }}
                      disabled={bundle.stockQuantity === 0}
                      className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                        bundle.stockQuantity === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {bundle.stockQuantity === 0 ? (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Out of Stock
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Buy Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Button - Removed, using new RetailerInventoryDisplay component instead */}

        {/* Purchase Modal with Quantity Selector */}
        {showPurchaseModal && selectedBundle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Select Quantity</h3>
                <p className="text-blue-100">{selectedBundle.name}</p>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many would you like to purchase?
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                      disabled={purchaseQuantity <= 1}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedBundle.stockQuantity}
                      value={purchaseQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setPurchaseQuantity(Math.min(Math.max(1, val), selectedBundle.stockQuantity));
                      }}
                      className="flex-1 px-4 py-3 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => setPurchaseQuantity(Math.min(selectedBundle.stockQuantity, purchaseQuantity + 1))}
                      disabled={purchaseQuantity >= selectedBundle.stockQuantity}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700"
                    >
                      +
                    </button>
                  </div>

                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Unit Price</span>
                    <span className="font-semibold">NOK {selectedBundle.basePrice}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold">{purchaseQuantity}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Amount</span>
                      <span className="font-bold text-blue-600 text-2xl">
                        NOK {(selectedBundle.basePrice * purchaseQuantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPurchaseModal(false);
                      setError('');
                    }}
                    disabled={purchasing}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDirectPurchase(selectedBundle, purchaseQuantity)}
                    disabled={purchasing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Purchase
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Modal - Removed, using new RetailerInventoryDisplay component instead */}
      </div>
    </div>
  );
}
