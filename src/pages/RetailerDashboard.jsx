import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Package, DollarSign, TrendingUp, Clock, 
  AlertCircle, CheckCircle, Eye, Edit, Plus, Search, RefreshCw,
  ShoppingCart, Award, Activity, Bell, Download, LogOut, Tag,
  Menu, X, Building, Box, MessageCircle, PieChart, Globe2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FeaturedPromotions from '../components/FeaturedPromotions';
import RetailerBundlePurchaseDashboard from '../components/RetailerBundlePurchaseDashboard';
import RetailerEsimPurchase from '../components/RetailerEsimPurchase';
import RetailerInventoryDisplay from '../components/RetailerInventoryDisplay';
import RetailerPromotionalBanner from '../components/RetailerPromotionalBanner';

// API Base URL - should match AuthContext
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

const RetailerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [availableBundles, setAvailableBundles] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'offline'
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activePromotions, setActivePromotions] = useState([]);
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  useEffect(() => {
    fetchRetailerData();
    fetchAvailableBundles();
    fetchActivePromotions();
  }, []);

  const fetchActivePromotions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/promotions/active`);
      if (response.ok) {
        const data = await response.json();
        // Filter for public and active promotions
        const publicPromotions = (data.data || []).filter(
          promo => promo.public && promo.status === 'ACTIVE'
        );
        setActivePromotions(publicPromotions);
        console.log('Active promotions:', publicPromotions.length);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const fetchRetailerData = async () => {
    try {
      setLoading(true);
      setConnectionStatus('connecting');
      
      console.log('Loading retailer dashboard with real data from backend...');
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log('Authenticating retailer request with token:', token ? 'Token present' : 'No token found');
      
      // Test backend connection first using a basic endpoint
      let backendConnected = false;
      try {
        // Use a simpler endpoint that should exist (like health check or auth verify)
        const testResponse = await fetch(`${API_BASE_URL}/auth/verify`, { headers });
        console.log('Backend connection test response status:', testResponse.status);
        backendConnected = testResponse.ok || testResponse.status === 401 || testResponse.status === 404; // 404 means server is running but endpoint not found
        
        if (testResponse.status === 401) {
          console.warn('Authentication failed - token may be invalid or expired');
        } else if (testResponse.status === 404) {
          console.log('Auth verify endpoint not found, but backend is running');
        }
      } catch (err) {
        console.log('Backend connection test failed:', err);
        // Try a more basic test
        try {
          const basicTest = await fetch(`${API_BASE_URL}/retailer/bundles`, { headers });
          backendConnected = basicTest.status !== 0; // Any response means backend is running
          console.log('Basic backend test result:', backendConnected, 'Status:', basicTest.status);
        } catch (basicErr) {
          console.log('Basic backend test also failed:', basicErr);
          backendConnected = false;
        }
      }
      
      if (!backendConnected) {
        setConnectionStatus('offline');
        console.log('Backend is offline, using empty data');
        setOrders([]);
        setProducts([]);
        setAnalytics({
          totalOrders: 0,
          totalRevenue: 0,
          monthlyGrowth: 0,
          pendingOrders: 0,
          orderGrowth: 0,
          successRate: 0
        });
        return;
      }
      
      setConnectionStatus('connected');
      console.log('Backend is connected, attempting to fetch retailer data...');
      
      // Fetch real data from backend APIs (these endpoints might not exist yet)
      const [ordersResponse, productsResponse, analyticsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/retailer/orders`, { headers }).catch(err => {
          console.log('Retailer Orders API not implemented yet:', err.message);
          return { ok: false, status: 404 };
        }),
        fetch(`${API_BASE_URL}/retailer/products`, { headers }).catch(err => {
          console.log('Retailer Products API not implemented yet:', err.message);
          return { ok: false, status: 404 };
        }),
        fetch(`${API_BASE_URL}/retailer/analytics`, { headers }).catch(err => {
          console.log('Retailer Analytics API not implemented yet:', err.message);
          return { ok: false, status: 404 };
        })
      ]);

      // Process orders data
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log('Orders data received:', ordersData);
        if (ordersData.success && ordersData.data) {
          setOrders(Array.isArray(ordersData.data) ? ordersData.data : []);
        } else {
          setOrders([]);
        }
      } else {
        if (ordersResponse.status === 404) {
          console.log('Retailer orders endpoint not implemented yet (404)');
        } else {
          console.log('Failed to fetch orders, status:', ordersResponse.status);
        }
        setOrders([]);
      }

      // Process products data
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('Products data received:', productsData);
        if (productsData.success && productsData.data) {
          setProducts(Array.isArray(productsData.data) ? productsData.data : []);
        } else {
          setProducts([]);
        }
      } else {
        if (productsResponse.status === 404) {
          console.log('Retailer products endpoint not implemented yet (404)');
        } else {
          console.log('Failed to fetch products, status:', productsResponse.status);
        }
        setProducts([]);
      }

      // Process analytics data
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        console.log('Analytics data received:', analyticsData);
        if (analyticsData.success && analyticsData.data) {
          setAnalytics(analyticsData.data);
        } else {
          setAnalytics({
            totalOrders: 0,
            totalRevenue: 0,
            monthlyGrowth: 0,
            pendingOrders: 0,
            orderGrowth: 0,
            successRate: 0
          });
        }
      } else {
        if (analyticsResponse.status === 404) {
          console.log('Retailer analytics endpoint not implemented yet (404)');
        } else {
          console.log('Failed to fetch analytics, status:', analyticsResponse.status);
        }
        setAnalytics({
          totalOrders: 0,
          totalRevenue: 0,
          monthlyGrowth: 0,
          pendingOrders: 0,
          orderGrowth: 0,
          successRate: 0
        });
      }

      // Check if any retailer-specific data was loaded
      const hasOrders = orders.length > 0;
      const hasProducts = products.length > 0;
      const hasAnalytics = analytics.totalOrders > 0 || analytics.totalRevenue > 0;
      
      if (hasOrders || hasProducts || hasAnalytics) {
        console.log('✅ Real retailer data loaded successfully');
      } else {
        console.log('⚠️ Backend connected but retailer endpoints may not be implemented yet');
        console.log('📝 To implement retailer functionality, add these endpoints to your backend:');
        console.log('   - GET /api/retailer/orders');
        console.log('   - GET /api/retailer/products');
        console.log('   - GET /api/retailer/analytics');
      }

    } catch (error) {
      console.error('Error fetching retailer data:', error);
      setConnectionStatus('offline');
      // Set empty data on error
      setOrders([]);
      setProducts([]);
      setAnalytics({
        totalOrders: 0,
        totalRevenue: 0,
        monthlyGrowth: 0,
        pendingOrders: 0,
        orderGrowth: 0,
        successRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const fetchAvailableBundles = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('🔄 Fetching available bundles for purchase...');
      console.log('📡 Requesting:', `${API_BASE_URL}/admin/bundles`);
      
      // Fetch bundles from admin's catalog
      const response = await fetch(`${API_BASE_URL}/admin/bundles`, { headers });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📦 Available bundles received:', result);
        
        let bundlesList = [];
        
        // Handle different response formats from backend
        if (result.success && result.data && Array.isArray(result.data)) {
          bundlesList = result.data;
          console.log('📋 Found bundles in result.data:', bundlesList.length);
        } else if (result.bundles && Array.isArray(result.bundles)) {
          bundlesList = result.bundles;
          console.log('📋 Found bundles in result.bundles:', bundlesList.length);
        } else if (Array.isArray(result)) {
          bundlesList = result;
          console.log('📋 Found bundles as direct array:', bundlesList.length);
        } else {
          console.log('⚠️ No bundles found in response:', result);
          setAvailableBundles([]);
          return;
        }
        
        // Filter only active bundles that are available for purchase
        const activeBundles = bundlesList.filter(bundle => 
          bundle.status === 'ACTIVE' && 
          (bundle.stockQuantity || 0) > 0
        );
        
        setAvailableBundles(activeBundles);
        console.log('✅ Available bundles loaded:', activeBundles.length);
        console.log('📋 Bundle details:', activeBundles);
        
        if (activeBundles.length > 0) {
          console.log('🎯 Sample bundle for testing:', {
            id: activeBundles[0].id,
            name: activeBundles[0].name,
            price: activeBundles[0].basePrice,
            stock: activeBundles[0].stockQuantity,
            status: activeBundles[0].status
          });
        }
      } else {
        console.log('❌ Failed to fetch available bundles');
        console.log('📊 Response status:', response.status);
        
        // Try to get error message
        try {
          const errorText = await response.text();
          console.log('📄 Response text:', errorText);
        } catch (readError) {
          console.log('📄 Could not read response text');
        }
        
        setAvailableBundles([]);
      }
    } catch (error) {
      console.error('💥 Error fetching available bundles:', error);
      setAvailableBundles([]);
    }
  };

  const handlePurchaseBundle = async (bundle, quantity = 1) => {
    try {
      setPurchaseLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('🛒 Purchasing bundle:', bundle.name, 'Quantity:', quantity);

      const purchaseData = {
        bundleId: bundle.id,
        quantity: quantity,
        wholesalePrice: bundle.basePrice * 0.7, // 30% discount for retailers
        totalAmount: (bundle.basePrice * 0.7) * quantity
      };

      console.log('💰 Purchase details:', purchaseData);

      // Process real purchase
      const response = await fetch(`${API_BASE_URL}/retailer/purchase-bundle`, {
        method: 'POST',
        headers,
        body: JSON.stringify(purchaseData)
      });

      console.log('📡 Purchase response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Bundle purchase successful:', result);
        
        alert(
          `✅ Purchase Successful!\n\n` +
          `Bundle: ${bundle.name}\n` +
          `Quantity: ${quantity} units\n` +
          `Unit Price: NOK ${(bundle.basePrice * 0.7).toFixed(2)}\n` +
          `Total Cost: NOK ${purchaseData.totalAmount.toFixed(2)}\n` +
          `Expected Profit: NOK ${((bundle.basePrice * 0.3) * quantity).toFixed(2)}`
        );
        
        // Refresh data to update inventory and available bundles
        await fetchRetailerData();
        await fetchAvailableBundles();
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        }
        
        console.error('❌ Bundle purchase failed:', response.status, errorMessage);
        alert(`❌ Purchase Failed\n\nReason: ${errorMessage}\n\nPlease try again or contact support.`);
      }
    } catch (error) {
      console.error('💥 Error purchasing bundle:', error);
      alert(`❌ Purchase Failed\n\nNetwork Error: ${error.message}\n\nPlease check your connection and try again.`);
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Sidebar Navigation Item Component
  const SidebarNavItem = ({ id, label, icon: Icon, active, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 scale-105' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-102'
      }`}
    >
      {/* Animated background for active state */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient"></div>
      )}
      
      {/* Icon with bounce animation */}
      <Icon size={20} className={`flex-shrink-0 relative z-10 transition-transform duration-300 ${
        active ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'
      }`} />
      
      {sidebarOpen && (
        <>
          {/* Label */}
          <span className={`font-medium flex-1 text-left relative z-10 transition-all duration-300 ${
            active ? 'translate-x-0' : 'group-hover:translate-x-1'
          }`}>
            {label}
          </span>
          
          {/* Badge with pulse animation */}
          {badge && badge > 0 && (
            <span className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              active 
                ? 'bg-white/20 text-white animate-pulse' 
                : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110'
            }`}>
              {badge}
            </span>
          )}
        </>
      )}
      
      {/* Hover effect line */}
      {!active && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-600 to-purple-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-r-full"></div>
      )}
    </button>
  );

  const StatCard = ({ title, value, change, icon: Icon, color, description }) => (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {description && <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${color} text-white flex items-center justify-center flex-shrink-0 ml-2`}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
      </div>
      {change !== undefined && change !== null && (
        <div className="mt-3 sm:mt-4">
          <span className={`inline-flex items-center text-xs sm:text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={14} className="mr-1 sm:w-4 sm:h-4" />
            {change > 0 ? '+' : ''}{change}% from last month
          </span>
        </div>
      )}
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, active, onClick, badge }) => {
    // Create shortened label for mobile
    const shortLabel = label.split(' ')[0]; // Take first word
    const isSingleWord = label.split(' ').length === 1;
    
    return (
      <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap text-xs sm:text-sm flex-shrink-0 ${
          active 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <Icon size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
        <span className="hidden lg:inline">{label}</span>
        <span className="lg:hidden">{isSingleWord ? label : shortLabel}</span>
        {badge > 0 && (
          <span className="ml-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-red-500 text-white rounded-full min-w-[18px] text-center">
            {badge}
          </span>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading retailer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-xl`}>
        {/* Logo & Brand */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg animate-pulse-slow">
                  <Building size={20} />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Retailer Panel</h1>
                  <p className="text-[10px] text-gray-500">EasyTopup.no</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg mx-auto">
              <Menu size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarOpen ? (
            <>
              <SidebarNavItem
                id="overview"
                label="Dashboard"
                icon={BarChart3}
                active={activeTab === 'overview'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="orders"
                label="Orders"
                icon={ShoppingCart}
                active={activeTab === 'orders'}
                onClick={setActiveTab}
                badge={analytics.pendingOrders}
              />
              <SidebarNavItem
                id="bundles"
                label="Buy Bundles"
                icon={Package}
                active={activeTab === 'bundles'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="esim"
                label="Buy eSIMs"
                icon={Globe2}
                active={activeTab === 'esim'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="inventory"
                label="Inventory"
                icon={Box}
                active={activeTab === 'inventory'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="offers"
                label="Offers"
                icon={Tag}
                active={activeTab === 'offers'}
                onClick={setActiveTab}
                badge={activePromotions.length}
              />
              <SidebarNavItem
                id="analytics"
                label="Analytics"
                icon={PieChart}
                active={activeTab === 'analytics'}
                onClick={setActiveTab}
              />
            </>
          ) : (
            <>
              <button onClick={() => setActiveTab('overview')} className={`w-full p-3 rounded-xl ${activeTab === 'overview' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <BarChart3 size={20} />
              </button>
              <button onClick={() => setActiveTab('orders')} className={`w-full p-3 rounded-xl relative ${activeTab === 'orders' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ShoppingCart size={20} />
                {analytics.pendingOrders > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button onClick={() => setActiveTab('bundles')} className={`w-full p-3 rounded-xl ${activeTab === 'bundles' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Package size={20} />
              </button>
              <button onClick={() => setActiveTab('esim')} className={`w-full p-3 rounded-xl ${activeTab === 'esim' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Globe2 size={20} />
              </button>
              <button onClick={() => setActiveTab('inventory')} className={`w-full p-3 rounded-xl ${activeTab === 'inventory' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Box size={20} />
              </button>
              <button onClick={() => setActiveTab('offers')} className={`w-full p-3 rounded-xl relative ${activeTab === 'offers' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Tag size={20} />
                {activePromotions.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab('analytics')} className={`w-full p-3 rounded-xl ${activeTab === 'analytics' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <PieChart size={20} />
              </button>
            </>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'orders' && 'Orders'}
                {activeTab === 'bundles' && 'Buy Bundles'}
                {activeTab === 'esim' && 'Buy eSIMs'}
                {activeTab === 'inventory' && 'Inventory'}
                {activeTab === 'offers' && 'Offers'}
                {activeTab === 'analytics' && 'Analytics'}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
                connectionStatus === 'offline' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'offline' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}></div>
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'offline' ? 'Offline' :
                 'Connecting'}
              </div>
              
              <button 
                onClick={() => fetchRetailerData()}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                title="Refresh"
              >
                <RefreshCw size={20} />
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 relative" title="Notifications">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* NEW: Beautiful Animated Promotional Banner */}
            <RetailerPromotionalBanner onClose={() => setShowPromoBanner(false)} />

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Customer Sales"
                value={analytics.totalOrders?.toLocaleString() || '0'}
                change={analytics.orderGrowth || 0}
                icon={ShoppingCart}
                color="bg-gradient-to-br from-blue-600 to-blue-700"
                description="Bundles sold to customers"
              />
              <StatCard
                title="Total Profit"
                value={`NOK ${analytics.totalRevenue?.toLocaleString() || '0'}`}
                change={analytics.monthlyGrowth || 0}
                icon={DollarSign}
                color="bg-gradient-to-br from-green-600 to-green-700"
                description="Net earnings from sales"
              />
              <StatCard
                title="Bundle Inventory"
                value={analytics.pendingOrders || 0}
                icon={Package}
                color="bg-gradient-to-br from-yellow-600 to-yellow-700"
                description="Bundles available to sell"
              />
              <StatCard
                title="Profit Margin"
                value={analytics.successRate ? `${analytics.successRate}%` : '30%'}
                change={analytics.successRateGrowth || 0}
                icon={Award}
                color="bg-gradient-to-br from-purple-600 to-purple-700"
                description="Average margin per sale"
              />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="text-blue-600" size={20} />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="text-blue-600 mb-2" size={24} />
                    <span className="text-sm font-medium">New Sale</span>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('bundles');
                      fetchAvailableBundles();
                    }}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <Package className="text-green-600 mb-2" size={24} />
                    <span className="text-sm font-medium">Buy Bundles</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <DollarSign className="text-purple-600 mb-2" size={24} />
                    <span className="text-sm font-medium">My Inventory</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <BarChart3 className="text-orange-600 mb-2" size={24} />
                    <span className="text-sm font-medium">Analytics</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="text-green-600" size={20} />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {orders && orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <ShoppingCart size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.orderNumber || order.id}</p>
                            <p className="text-sm text-gray-600">{order.productName || 'Bundle Order'}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No recent activity</p>
                      <p className="text-sm text-gray-400">
                        {connectionStatus === 'connected' 
                          ? 'Activity will appear here once retailer orders are available'
                          : 'Activity will appear here when orders are processed'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Orders Management</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={() => fetchRetailerData()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{order.orderNumber || order.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.productName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{order.productType || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.customerName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">NOK {order.amount?.toLocaleString() || '0'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status === 'COMPLETED' && <CheckCircle size={12} className="mr-1" />}
                              {order.status === 'PENDING' && <Clock size={12} className="mr-1" />}
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.createdDate ? new Date(order.createdDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye size={16} />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <ShoppingCart size={32} className="text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No orders found</p>
                          <p className="text-sm text-gray-400">
                            {connectionStatus === 'connected' 
                              ? 'Orders will appear here once retailer endpoints are implemented'
                              : 'Orders will appear here once backend is connected'
                            }
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bundles' && (
          <RetailerBundlePurchaseDashboard />
        )}

        {activeTab === 'esim' && (
          <RetailerEsimPurchase />
        )}

        {activeTab === 'inventory' && (
          <RetailerInventoryDisplay />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="text-blue-600" size={20} />
                  Sales Performance
                </h4>
                {analytics.salesPerformance ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Sales</span>
                      <span className={`font-semibold ${analytics.salesPerformance.daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analytics.salesPerformance.daily >= 0 ? '+' : ''}{analytics.salesPerformance.daily}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Weekly Sales</span>
                      <span className={`font-semibold ${analytics.salesPerformance.weekly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analytics.salesPerformance.weekly >= 0 ? '+' : ''}{analytics.salesPerformance.weekly}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly Sales</span>
                      <span className={`font-semibold ${analytics.salesPerformance.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analytics.salesPerformance.monthly >= 0 ? '+' : ''}{analytics.salesPerformance.monthly}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <BarChart3 size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No performance data</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="text-green-600" size={20} />
                  Top Selling Bundles
                </h4>
                {analytics.topProducts && analytics.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topProducts.slice(0, 3).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.sales} units sold</p>
                        </div>
                        <span className="font-bold text-green-600 text-sm">
                          NOK {product.revenue?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Package size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No bundle data</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="text-purple-600" size={20} />
                  Customer Insights
                </h4>
                {analytics.customerInsights ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">New Customers</span>
                      <span className="font-semibold text-blue-600">{analytics.customerInsights.newCustomers || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Repeat Customers</span>
                      <span className="font-semibold text-green-600">{analytics.customerInsights.repeatCustomers || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customer Retention</span>
                      <span className="font-semibold text-purple-600">{analytics.customerInsights.retentionRate || 0}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No customer data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Charts placeholder */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h4>
              <div className="text-center py-12">
                <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Chart</h3>
                <p className="text-gray-500">Revenue chart visualization will be available here</p>
              </div>
            </div>
          </div>
        )}

        {/* Special Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            {/* Beautiful Animated Promotional Banner */}
            <RetailerPromotionalBanner />
            
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="text-indigo-600" size={24} />
                Special Offers & Promotions
              </h3>
              <p className="text-gray-600 mb-6">
                Take advantage of exclusive promotional offers and reward campaigns to boost your sales and earn more rewards!
              </p>
              <FeaturedPromotions />
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;
