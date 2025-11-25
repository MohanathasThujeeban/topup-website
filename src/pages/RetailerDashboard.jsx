import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, Users, Package, DollarSign, TrendingUp, Clock, 
  AlertCircle, CheckCircle, Eye, Edit, Plus, Search, RefreshCw,
  ShoppingCart, Award, Activity, Bell, Download, LogOut, Tag,
  Menu, X, Building, Box, MessageCircle, PieChart, Globe2, Copy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FeaturedPromotions from '../components/FeaturedPromotions';
import RetailerBundlePurchaseDashboard from '../components/RetailerBundlePurchaseDashboard';
import RetailerEsimPurchase from '../components/RetailerEsimPurchase';
import RetailerInventoryDisplay from '../components/RetailerInventoryDisplay';
import RetailerPromotionalBanner from '../components/RetailerPromotionalBanner';
import StockManagement from '../components/StockManagement';
import RetailerCreditManagement from '../components/RetailerCreditManagement';

// API Base URL - should match AuthContext
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

const RetailerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Enhanced demo mode detection - prioritize URL parameter
  const isDemoMode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasDemoParam = urlParams.get('demo') === 'true';
    const noToken = !localStorage.getItem('token');
    const noUser = !user;
    
    console.log('🔍 Demo mode check:', { hasDemoParam, noToken, noUser });
    // If demo=true is in URL, always use demo mode regardless of auth status
    return hasDemoParam || noToken || noUser === null;
  };
  
  // Enhanced setActiveTab with activity tracking
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Add activity for key section visits
    if (tab === 'bundles') {
      addActivity('bundle_purchase', 'Viewed bundle catalog', { action: 'navigation' });
    } else if (tab === 'esim') {
      addActivity('esim_purchase', 'Accessed eSIM products', { action: 'navigation' });
    } else if (tab === 'pos') {
      addActivity('navigation', 'Opened Point of Sale', { action: 'navigation', section: 'pos' });
    } else if (tab === 'inventory') {
      addActivity('inventory_update', 'Checked inventory status', { action: 'navigation' });
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true); // Start with true, will be set to false once data is loaded
  const [fetchingData, setFetchingData] = useState(false); // Prevent multiple simultaneous API calls
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [availableBundles, setAvailableBundles] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'offline'
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activePromotions, setActivePromotions] = useState([]);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  
  // Point of Sale state
  const [inventoryBundles, setInventoryBundles] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [saleQuantity] = useState(1); // Fixed at 1 PIN per sale
  const [saleLoading, setSaleLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [generatedPins, setGeneratedPins] = useState([]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [fetchingPromotions, setFetchingPromotions] = useState(false);
  const [fetchingMarginRate, setFetchingMarginRate] = useState(false);
  
  // Inventory state
  const [purchasedBundles, setPurchasedBundles] = useState([]);
  const [purchasedEsims, setPurchasedEsims] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  
  // Privacy Settings state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState({ type: '', text: '' });
  
  // Use ref to track if initialization has started
  const initializationStarted = useRef(false);
  
  // Helper function to calculate total inventory units
  const getTotalInventoryUnits = () => {
    if (inventoryBundles.length === 0) {
      console.log('📊 No inventory bundles available for calculation');
      return 0;
    }
    
    const totalUnits = inventoryBundles.reduce((total, bundle) => {
      const units = bundle.availableQuantity || bundle.totalPins || 0;
      console.log(`📊 Bundle "${bundle.bundleName}": ${units} units (availableQuantity: ${bundle.availableQuantity}, totalPins: ${bundle.totalPins})`);
      return total + units;
    }, 0);
    
    console.log(`📊 Total inventory units calculated: ${totalUnits} (from ${inventoryBundles.length} bundle types)`);
    return totalUnits;
  };
  
  // Retailer margin rate state (set by admin only - no defaults)
  const [retailerMarginRate, setRetailerMarginRate] = useState(null);
  
  // Profit tracking state - starts from zero
  const [totalProfit, setTotalProfit] = useState(0);
  
  const [dailyProfit, setDailyProfit] = useState(0);
  
  // Recent Activities state - starts empty
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Temporarily disable promotions fetching due to backend performance issues
  // Effect for fetching active promotions - only once on mount
  // useEffect(() => {
  //   const abortController = new AbortController();
    
  //   // Delay initial fetch to prevent conflicts with other initialization
  //   const timeoutId = setTimeout(() => {
  //     if (!fetchingPromotions) {
  //       fetchActivePromotions(abortController.signal);
  //     }
  //   }, 3000);
    
  //   return () => {
  //     clearTimeout(timeoutId);
  //     abortController.abort();
  //   };
  // }, []);
  
  // Effect to refetch promotions when user changes (but not on initial mount)
  // useEffect(() => {
  //   if (user && !fetchingPromotions) {
  //     // Only fetch if not already fetching and user just changed (not initial load)
  //     const timeoutId = setTimeout(() => {
  //       fetchActivePromotions();
  //     }, 1000);
      
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [user?.id]); // Only when user ID changes
  
  // Initialize dashboard on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasDemoParam = urlParams.get('demo') === 'true';
    const token = localStorage.getItem('token');
    const hasValidAuth = user && token;
    
    console.log('🔍 Dashboard initialization:', { 
      hasDemoParam,
      hasUser: !!user, 
      hasToken: !!token, 
      hasValidAuth,
      isDemoModeResult: isDemoMode()
    });
    
    // Only use demo mode if explicitly requested with ?demo=true
    if (hasDemoParam && urlParams.get('demo') === 'true') {
      console.log('🎯 Demo mode forced by URL parameter - loading demo data');
      setLoading(false);
      setConnectionStatus('demo');
      
      // Load rich demo data
      setOrders([
        {
          id: 'DEMO-001',
          customer: 'John Doe',
          product: 'Lebara 10GB',
          amount: 299,
          profit: 29.9,
          status: 'completed',
          date: new Date().toISOString(),
          marginRate: 10
        },
        {
          id: 'DEMO-002',
          customer: 'Jane Smith',
          product: 'Lycamobile 5GB',
          amount: 199,
          profit: 19.9,
          status: 'pending',
          date: new Date().toISOString(),
          marginRate: 10
        }
      ]);
      
      setProducts([
        { id: 1, name: 'Demo Bundle', price: 299, stock: 100 }
      ]);
      
      setAnalytics({
        totalOrders: 45,
        totalRevenue: 15750,
        monthlyGrowth: 12,
        pendingOrders: 3,
        orderGrowth: 8,
        successRate: 95,
        customerSales: 42,
        totalProfit: 1575,
        bundleInventory: 100,
        profitMargin: 10,
        salesPerformance: {
          daily: 5,
          weekly: 12,
          monthly: 45
        },
        topProducts: [
          { name: 'Lebara 10GB', sales: 25 },
          { name: 'Lycamobile 5GB', sales: 20 }
        ]
      });
      
      setInventoryBundles([
        {
          id: 'demo-bundle-1',
          bundleId: 'DEMO001',
          bundleName: 'Lyca 49 NOK Bundle (Demo)',
          bundlePrice: 49.00,
          purchasePrice: 34.30, // 30% margin
          availableQuantity: 50,
          availablePins: 50,
          totalPins: 50,
          status: 'ACTIVE',
          productType: 'EPIN',
          realMarginRate: 30,
          expectedProfit: 14.70
        },
        {
          id: 'demo-bundle-2',
          bundleId: 'DEMO002',
          bundleName: 'Lyca 99 NOK Bundle (Demo)',
          bundlePrice: 99.00,
          purchasePrice: 69.30, // 30% margin
          availableQuantity: 30,
          availablePins: 30,
          totalPins: 30,
          status: 'ACTIVE',
          productType: 'EPIN',
          realMarginRate: 30,
          expectedProfit: 29.70
        },
        {
          id: 'demo-bundle-3',
          bundleId: 'DEMO003',
          bundleName: 'Lyca 149 NOK Bundle (Demo)',
          bundlePrice: 149.00,
          purchasePrice: 104.30, // 30% margin
          availableQuantity: 20,
          availablePins: 20,
          totalPins: 20,
          status: 'ACTIVE',
          productType: 'EPIN',
          realMarginRate: 30,
          expectedProfit: 44.70
        }
      ]);
      
      setAvailableBundles([
        {
          id: 'DEMO001',
          name: 'Demo Bundle',
          price: 299,
          category: 'Demo',
          description: 'Demo bundle for testing'
        }
      ]);
      
      return;
    }
    
    // Always try to fetch real data if user exists, even without full auth
    if (user || hasValidAuth) {
      console.log('🔄 Starting real API data fetch...');
      
      // Prevent multiple initializations
      if (initializationStarted.current) {
        console.log('⏹️ Initialization already started - skipping');
        return;
      }
      
      initializationStarted.current = true;
      setLoading(true);
      setConnectionStatus('connecting');
      
      // Prevent multiple simultaneous calls
      if (!fetchingData) {
        fetchRetailerData();
        // Fetch inventory for POS functionality with delay to prevent conflicts
        setTimeout(() => {
          if (!fetchingData && !loading) {
            fetchInventoryBundles();
          }
        }, 2000);
        
        // Safety timeout to ensure loading never gets stuck
        setTimeout(() => {
          if (loading) {
            console.log('⚠️ Safety timeout triggered - forcing loading to false');
            setLoading(false);
          }
        }, 10000); // 10 second safety timeout
      }
      return;
    }
    
    // If no user at all, show minimal interface
    console.log('⚠️ No user found - minimal interface');
    setLoading(false);
    setConnectionStatus('offline');
    setAnalytics({
      totalOrders: 0,
      totalRevenue: 0,
      monthlyGrowth: 0,
      pendingOrders: 0,
      orderGrowth: 0,
      successRate: 0,
      customerSales: 0,
      totalProfit: 0,
      bundleInventory: 0,
      profitMargin: retailerMarginRate && retailerMarginRate > 0 ? retailerMarginRate : 0,
      salesPerformance: { daily: 0, weekly: 0, monthly: 0 },
      topProducts: []
    });
  }, [user]);
  
  // Reset initialization flag when user changes
  useEffect(() => {
    initializationStarted.current = false;
  }, [user?.id]);
  
  // Update analytics when inventory changes to reflect current bundle count
  useEffect(() => {
    console.log(`📊 Inventory useEffect triggered: ${inventoryBundles.length} bundles available`);
    
    if (inventoryBundles.length > 0) {
      const totalUnits = getTotalInventoryUnits();
      console.log(`📊 Inventory updated: ${inventoryBundles.length} bundle types, ${totalUnits} total units`);
      
      // Update analytics with new inventory count
      setAnalytics(prev => {
        console.log(`📊 Updating analytics from ${prev.bundleInventory} to ${totalUnits}`);
        return {
          ...prev,
          bundleInventory: totalUnits
        };
      });
    } else {
      console.log('📊 No inventory available, setting bundle inventory to 0');
      setAnalytics(prev => ({ ...prev, bundleInventory: 0 }));
    }
  }, [inventoryBundles]); // Trigger when inventory changes
  
  // Fetch real data on component mount or when user changes
  useEffect(() => {
    const loadRealData = async () => {
      if (!isDemoMode() && user && retailerMarginRate === null && !fetchingMarginRate) {
        console.log('🔄 Loading real retailer data...');
        await fetchRetailerMarginRate();
        const salesData = await fetchCustomerSalesData();
        console.log('📈 Sales data loaded:', salesData);
      }
    };

    loadRealData();
  }, [user]); // Remove retailerMarginRate from dependencies to prevent loop  // Mock orders data
  // Function to add new activity
  const addActivity = (type, description, details = {}) => {
    const newActivity = {
      id: Date.now() + Math.random(),
      type, // 'bundle_purchase', 'esim_purchase', 'pos_sale', 'inventory_update'
      description,
      timestamp: new Date().toISOString(),
      details,
      iconType: type, // Store type for icon lookup
      colorType: type  // Store type for color lookup
    };
    
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 most recent
  };
  
  // Enhanced profit calculation using admin-set margin rates only
  const updateProfit = (saleAmount, costPrice, bundleName) => {
    // Only calculate profits if admin has set a margin rate
    if (!retailerMarginRate || retailerMarginRate <= 0) {
      console.log(`⚠️ No admin margin rate set - skipping profit calculation for ${bundleName}`);
      return;
    }
    
    const profitAmount = saleAmount - costPrice;
    const profitMarginPercent = ((profitAmount / saleAmount) * 100).toFixed(2);
    
    console.log(`💰 Real Profit Calculation (Admin Rate: ${retailerMarginRate}%):`);
    console.log(`  Bundle: ${bundleName}`);
    console.log(`  Sale Amount: NOK ${saleAmount.toFixed(2)}`);
    console.log(`  Cost Price: NOK ${costPrice.toFixed(2)}`);
    console.log(`  Profit Amount: NOK ${profitAmount.toFixed(2)}`);
    console.log(`  Actual Profit Margin: ${profitMarginPercent}%`);
    console.log(`  Admin Set Margin Rate: ${retailerMarginRate}%`);
    
    // Update total profit with real calculations
    setTotalProfit(prevTotal => {
      const newTotal = prevTotal + profitAmount;
      console.log(`📈 Updated total profit: NOK ${prevTotal.toFixed(2)} → NOK ${newTotal.toFixed(2)}`);
      
      // Update analytics with real profit data
      setAnalytics(prev => ({
        ...prev,
        totalProfit: newTotal,
        profitMargin: retailerMarginRate.toString() // Use real admin-set margin rate
      }));
      
      return newTotal;
    });
    
    // Update daily profit with real calculations
    setDailyProfit(prevDaily => {
      const newDaily = prevDaily + profitAmount;
      console.log(`📅 Updated daily profit: NOK ${prevDaily.toFixed(2)} → NOK ${newDaily.toFixed(2)}`);
      
      // Update analytics with real daily profit
      setAnalytics(prev => ({
        ...prev,
        dailyProfit: newDaily
      }));
      
      return newDaily;
    });
    
    // Add activity for profit tracking
    addActivity('pos_sale', `Profit earned: NOK ${profitAmount.toFixed(2)} from ${bundleName}`, {
      saleAmount,
      costPrice,
      profitAmount,
      bundleName,
      timestamp: new Date().toISOString()
    });
  };
  
  // Fix activities loaded from localStorage to have proper icons/colors and recalculate analytics
  useEffect(() => {
    if (recentActivities.length > 0) {
      // Ensure all activities have proper icons and colors
      const hasValidIcons = recentActivities.every(activity => 
        typeof activity.icon === 'function'
      );
      
      if (!hasValidIcons) {
        console.log('🔧 Fixing activity icons and colors from localStorage...');
        const updatedActivities = recentActivities.map(activity => ({
          ...activity,
          icon: getActivityIcon(activity.iconType || activity.type || 'pos_sale'),
          color: getActivityColor(activity.colorType || activity.type || 'pos_sale')
        }));
        setRecentActivities(updatedActivities);
      }

    }
  }, []); // Run once on mount
  
  const getActivityIcon = (type) => {
    switch(type) {
      case 'bundle_purchase': return Package;
      case 'esim_purchase': return Globe2;
      case 'pos_sale': return ShoppingCart;
      case 'inventory_update': return Box;
      case 'navigation': return Activity;
      default: return Activity;
    }
  };
  
  const getActivityColor = (type) => {
    switch(type) {
      case 'bundle_purchase': return 'bg-green-100 text-green-600';
      case 'esim_purchase': return 'bg-blue-100 text-blue-600';
      case 'pos_sale': return 'bg-purple-100 text-purple-600';
      case 'inventory_update': return 'bg-orange-100 text-orange-600';
      case 'navigation': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  


  const generateMockOrders = () => {
    const bundleNames = [
      "Lyca 11GB Bundle", "Lyca 22GB Bundle", "Lyca 33GB Bundle",
      "Data Bundle 10GB", "Data Bundle 20GB", "Voice Bundle Premium",
      "International Bundle", "Unlimited Bundle", "Student Bundle"
    ];
    
    const customerNames = [
      "John Smith", "Emma Johnson", "Michael Brown", "Sarah Davis",
      "David Wilson", "Lisa Anderson", "James Taylor", "Maria Garcia",
      "Robert Martinez", "Jennifer Lopez", "William Robinson", "Elizabeth Clark"
    ];
    
    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    
    const mockOrders = [];
    for (let i = 0; i < 25; i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomAmount = (49 + Math.floor(Math.random() * 200)) * (1 + Math.floor(Math.random() * 20));
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - randomDaysAgo);
      
      mockOrders.push({
        id: `mock-order-${i + 1}`,
        orderNumber: `ORD-MOCK-${Date.now()}-${i}`,
        productName: bundleNames[Math.floor(Math.random() * bundleNames.length)],
        productType: 'BUNDLE',
        customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
        customerEmail: `customer${i + 1}@example.com`,
        customerPhone: `+47${10000000 + Math.floor(Math.random() * 90000000)}`,
        amount: randomAmount,
        currency: 'NOK',
        status: randomStatus,
        createdDate: orderDate.toISOString(),
        paymentStatus: randomStatus === 'DELIVERED' ? 'COMPLETED' : randomStatus === 'CANCELLED' ? 'FAILED' : 'PENDING'
      });
    }
    
    return mockOrders.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  };

  useEffect(() => {
    let isMounted = true;
    
    // Load mock orders immediately
    const mockOrdersData = generateMockOrders();
    if (isMounted) {
      setOrders(mockOrdersData);
      
      // Set mock analytics with profit data
      const totalRevenue = mockOrdersData.reduce((sum, order) => 
        order.status === 'DELIVERED' ? sum + order.amount : sum, 0
      );
      
      // Use real data where available, mock data for other metrics
      const realCustomerSales = recentActivities.filter(a => a.type === 'pos_sale').length;
      const realBundleInventory = inventoryBundles.reduce((sum, bundle) => sum + (bundle.availableQuantity || 0), 0);
      
      setAnalytics({
        totalOrders: mockOrdersData.length,
        totalRevenue: totalRevenue,
        totalProfit: totalProfit || 0, // Real total profit from POS sales
        dailyProfit: dailyProfit || 0, // Real daily profit
        profitMargin: retailerMarginRate !== null ? retailerMarginRate.toString() : '0', // Real admin-set margin rate
        monthlyGrowth: 12.5,
        pendingOrders: mockOrdersData.filter(o => o.status === 'PENDING').length,
        orderGrowth: 8.3,
        successRate: 85,
        customerSales: realCustomerSales, // Real customer sales from POS
        bundleInventory: getTotalInventoryUnits() || 0 // Real total units available
      });
      
      setConnectionStatus('connected');
      setLoading(false);
    }
    
    // Skip all background API calls in demo mode or if data is already loading
    const urlParams = new URLSearchParams(window.location.search);
    const hasDemoParam = urlParams.get('demo') === 'true';
    
    if (!hasDemoParam && !isDemoMode() && !loading) {
      console.log('🎯 Skipping background API calls to prevent lag - data already loaded via main fetch');
    } else {
      console.log('🎯 Skipping all background API calls in demo mode or during loading');
    }
    
    return () => {
      isMounted = false;
    };
  }, []);  // Remove dependencies to prevent constant re-fetching that causes lag

  // Fetch inventory when inventory tab is opened
  useEffect(() => {
    if (activeTab === 'inventory' && !isDemoMode() && user) {
      console.log('📦 Inventory tab opened - fetching purchased items...');
      fetchPurchasedBundles();
      fetchPurchasedEsims();
    }
  }, [activeTab]);

  const fetchRetailerMarginRate = async () => {
    // Prevent multiple concurrent calls
    if (fetchingMarginRate) {
      console.log('⏳ Margin rate already being fetched - skipping');
      return;
    }
    
    setFetchingMarginRate(true);

    const urlParams = new URLSearchParams(window.location.search);
    const hasDemoParam = urlParams.get('demo') === 'true';
    
    try {
      if (hasDemoParam || isDemoMode()) {
        console.log('📊 Demo mode: Using demo margin rate of 30%');
        setRetailerMarginRate(30);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('📊 No token: Cannot fetch admin margin rate - waiting for authentication');
        setRetailerMarginRate(null);
        return;
      }
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('📊 Fetching retailer margin rate...');
      
      // Add timeout to prevent hanging
      const marginController = new AbortController();
      const timeoutId = setTimeout(() => marginController.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`${API_BASE_URL}/retailer/margin-rate`, { 
        headers,
        signal: marginController.signal,
        keepalive: false // Prevent connection hanging
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const marginRate = data.marginRate;
        const isSet = data.isSet;
        
        if (isSet && marginRate !== null && typeof marginRate === 'number') {
          setRetailerMarginRate(marginRate);
          console.log(`📊 Margin rate set by admin: ${marginRate}%`);
        } else {
          console.log('📊 No margin rate set by admin yet');
          setRetailerMarginRate(null);
        }
      } else {
        if (response.status === 500) {
          console.log('📊 Server error (500) - backend may be starting up, cannot get admin margin rate');
          setConnectionStatus('offline');
        } else {
          console.log(`📊 Margin rate API returned ${response.status}, cannot get admin margin rate`);
        }
        setRetailerMarginRate(null);
      }
    } catch (error) {
      console.error('❌ Error fetching margin rate:', error.message);
      setRetailerMarginRate(null);
      
      // If margin rate fetch fails, don't block the dashboard loading
      if (loading && error.name !== 'AbortError') {
        console.log('🚫 Margin rate fetch failed - allowing dashboard to load without it');
        setLoading(false);
      }
    } finally {
      setFetchingMarginRate(false);
    }
  };

  const fetchCustomerSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('📈 No token - skipping sales data fetch');
        return { customerSales: 0, totalRevenue: 0 };
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('📈 Fetching customer sales data and direct sales orders...');
      const salesController = new AbortController();
      const timeoutId = setTimeout(() => salesController.abort(), 8000);
      
      // First try to fetch from orders endpoint for direct sales
      let ordersData = { customerSales: 0, totalRevenue: 0 };
      let ordersResponse;
      
      // First check if we have direct sales in recent activities as fallback
      const localDirectSales = recentActivities.filter(activity => 
        activity.type === 'pos_sale' || activity.type === 'direct_sale'
      );
      
      if (localDirectSales.length > 0) {
        ordersData.customerSales = localDirectSales.length;
        ordersData.totalRevenue = localDirectSales.reduce((sum, activity) => {
          return sum + (activity.details?.saleAmount || activity.details?.amount || 0);
        }, 0);
        console.log(`📦 Using local activities: ${localDirectSales.length} sales, NOK ${ordersData.totalRevenue} revenue`);
      }
      
      // Add a demo direct sale if no data exists (for testing)
      if (ordersData.customerSales === 0) {
        const demoSale = {
          type: 'direct_sale',
          description: 'Demo direct sale: EPIN Bundle',
          details: {
            orderId: 'DEMO-DIRECT-001',
            amount: 99.0,
            product: 'EPIN Bundle',
            customer: 'Demo Customer',
            timestamp: new Date().toISOString(),
            paymentMethod: 'DIRECT_SALE'
          }
        };
        
        // Add demo sale to activities if not already present
        const hasDemoSale = recentActivities.find(a => a.details?.orderId === 'DEMO-DIRECT-001');
        if (!hasDemoSale) {
          addActivity(demoSale.type, demoSale.description, demoSale.details);
          ordersData.customerSales = 1;
          ordersData.totalRevenue = 99.0;
          console.log('📦 Added demo direct sale for testing purposes');
        }
      }
      
      // Try to fetch from backend orders endpoints (may not exist yet)
      const orderEndpoints = [
        `${API_BASE_URL}/retailer/orders`,
        `${API_BASE_URL}/orders`
      ];
      
      let foundValidEndpoint = false;
      for (const endpoint of orderEndpoints) {
        try {
          console.log(`📦 Trying orders endpoint: ${endpoint}`);
          ordersResponse = await fetch(endpoint, {
            headers,
            signal: salesController.signal,
            keepalive: false
          });
          
          if (ordersResponse.ok) {
            console.log(`📦 Success with endpoint: ${endpoint}`);
            foundValidEndpoint = true;
            break;
          } else if (ordersResponse.status === 500) {
            console.log(`📦 Server error (500) for ${endpoint} - backend may not have this endpoint yet`);
          } else if (ordersResponse.status === 404) {
            console.log(`📦 Endpoint ${endpoint} not found (404) - trying next endpoint`);
          }
        } catch (endpointError) {
          console.log(`📦 Network error for ${endpoint}:`, endpointError.message);
          continue;
        }
      }
      
      if (!foundValidEndpoint) {
        console.log('📦 No valid orders endpoints found - using local data only');
      }
      
      // Only process backend orders if we found a valid endpoint
      if (foundValidEndpoint && ordersResponse && ordersResponse.ok) {
        try {
          const ordersResult = await ordersResponse.json();
          console.log('📦 Backend orders data received:', ordersResult);
          
          // Parse direct sales from backend orders
          let backendDirectSales = [];
          if (ordersResult.success && Array.isArray(ordersResult.data)) {
            backendDirectSales = ordersResult.data.filter(order => 
              order.paymentMethod === 'DIRECT_SALE' && order.status === 'SOLD'
            );
          } else if (Array.isArray(ordersResult)) {
            backendDirectSales = ordersResult.filter(order => 
              order.paymentMethod === 'DIRECT_SALE' && order.status === 'SOLD'
            );
          }
          
          if (backendDirectSales.length > 0) {
            // Replace local data with backend data if available
            ordersData.customerSales = backendDirectSales.length;
            ordersData.totalRevenue = backendDirectSales.reduce((sum, order) => sum + (order.amount || 0), 0);
            console.log(`📦 Backend: Found ${backendDirectSales.length} direct sales orders totaling NOK ${ordersData.totalRevenue}`);
            
            // Add backend direct sales to recent activities
            backendDirectSales.forEach(order => {
              const existingActivity = recentActivities.find(activity => 
                activity.type === 'direct_sale' && activity.id === order._id
              );
              
              if (!existingActivity) {
                addActivity('direct_sale', `Direct sale: ${order.productName || 'Unknown Product'}`, {
                  orderId: order._id,
                  amount: order.amount,
                  product: order.productName || 'Unknown Product',
                  customer: order.retailer || 'Customer',
                  timestamp: order.createdDate || new Date().toISOString(),
                  paymentMethod: 'DIRECT_SALE'
                });
              }
            });
          } else {
            console.log('📦 Backend: No direct sales found in orders, keeping local data');
          }
        } catch (ordersParseError) {
          console.log('📦 Error parsing backend orders data:', ordersParseError.message);
        }
      } else {
        console.log('📦 Backend orders not available - using local activities only');
      }
      
      // Fallback to original sales endpoint
      const response = await fetch(`${API_BASE_URL}/retailer/sales`, {
        headers,
        signal: salesController.signal,
        keepalive: false
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        console.log('📈 Sales data received:', result);
        
        let customerSales = ordersData.customerSales; // Start with direct sales count
        let totalRevenue = ordersData.totalRevenue;   // Start with direct sales revenue
        
        // Add additional sales data from various response formats
        if (result.success && result.data) {
          customerSales += result.data.customerSales || result.data.totalSales || 0;
          totalRevenue += result.data.totalRevenue || result.data.revenue || 0;
        } else if (result.sales) {
          const additionalSales = Array.isArray(result.sales) ? result.sales.length : result.sales;
          customerSales += additionalSales;
          totalRevenue += result.totalRevenue || 0;
        }
        
        console.log(`📈 Final totals - Customer sales: ${customerSales} (${ordersData.customerSales} from orders/activities), Revenue: NOK ${totalRevenue}`);
        return { customerSales, totalRevenue };
      } else {
        if (response.status === 500) {
          console.log('📈 Server error (500) for sales data - backend may be starting up');
        } else if (response.status === 404) {
          console.log('📈 Sales endpoint not found (404) - backend may not have this endpoint yet');
        } else {
          console.log(`📈 Sales API returned ${response.status}, using direct sales data only`);
        }
        
        // Return available data even if sales endpoint fails
        if (ordersData.customerSales > 0) {
          console.log(`📈 Using available data only: ${ordersData.customerSales} sales, NOK ${ordersData.totalRevenue} revenue`);
          return ordersData;
        }
        
        return { customerSales: 0, totalRevenue: 0 };
      }
    } catch (error) {
      console.log('📈 Error in fetchCustomerSalesData:', error.message);
      
      // Return any local activity data as fallback
      const localSales = recentActivities.filter(a => a.type === 'pos_sale' || a.type === 'direct_sale').length;
      const localRevenue = recentActivities
        .filter(a => a.type === 'pos_sale' || a.type === 'direct_sale')
        .reduce((sum, a) => sum + (a.details?.saleAmount || a.details?.amount || 0), 0);
      
      if (localSales > 0) {
        console.log(`📈 Using local fallback: ${localSales} sales, NOK ${localRevenue} revenue`);
        return { customerSales: localSales, totalRevenue: localRevenue };
      }
      
      return { customerSales: 0, totalRevenue: 0 };
    }
  };

  // Track promotion fetch state to prevent multiple calls (declared with other states)
  
  const fetchActivePromotions = async (signal = null) => {
    // Prevent multiple simultaneous calls
    if (fetchingPromotions) {
      console.log('🎯 Promotions already being fetched - skipping');
      return;
    }
    
    try {
      setFetchingPromotions(true);
      
      const controller = new AbortController();
      const fetchSignal = signal || controller.signal;
      
      // Add timeout to prevent hanging requests
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      console.log('🎯 Fetching active promotions...');
      const response = await fetch(`${API_BASE_URL}/admin/promotions/active`, {
        signal: fetchSignal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        // Filter for public and active promotions
        const publicPromotions = (data.data || []).filter(
          promo => promo.public && promo.status === 'ACTIVE'
        );
        setActivePromotions(publicPromotions);
        console.log('✅ Active promotions loaded:', publicPromotions.length);
      } else {
        console.log('⚠️ Promotions API returned:', response.status);
        setActivePromotions([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error fetching promotions:', error.message);
        // Don't retry immediately to prevent connection spam
        setTimeout(() => {
          console.log('🔄 Will retry promotions fetch in 30 seconds...');
        }, 30000);
      }
      setActivePromotions([]);
    } finally {
      setFetchingPromotions(false);
    }
  };

  // Fetch purchased bundles from backend
  const fetchPurchasedBundles = async () => {
    if (!user || isDemoMode()) {
      console.log('🔒 Cannot fetch purchased bundles in demo mode');
      return;
    }

    try {
      setLoadingInventory(true);
      const token = localStorage.getItem('token');
      
      console.log('📦 Fetching purchased bundles...');
      const response = await fetch(`${API_BASE_URL}/retailer/purchased-bundles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Purchased bundles response:', data);
        setPurchasedBundles(data.data || []);
        console.log('✅ Purchased bundles loaded:', data.data?.length || 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch purchased bundles:', response.status, errorData);
        console.log('⚠️ Error details:', errorData.message || 'No error message');
        setPurchasedBundles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching purchased bundles:', error);
      console.error('❌ Error details:', error.message, error.stack);
      setPurchasedBundles([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Fetch purchased eSIMs from backend
  const fetchPurchasedEsims = async () => {
    if (!user || isDemoMode()) {
      console.log('🔒 Cannot fetch purchased eSIMs in demo mode');
      return;
    }

    try {
      setLoadingInventory(true);
      const token = localStorage.getItem('token');
      
      console.log('🌐 Fetching purchased eSIMs...');
      const response = await fetch(`${API_BASE_URL}/retailer/purchased-esims`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Purchased eSIMs response:', data);
        setPurchasedEsims(data.data || []);
        console.log('✅ Purchased eSIMs loaded:', data.data?.length || 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch purchased eSIMs:', response.status, errorData);
        console.log('⚠️ Error details:', errorData.message || 'No error message');
        setPurchasedEsims([]);
      }
    } catch (error) {
      console.error('❌ Error fetching purchased eSIMs:', error);
      console.error('❌ Error details:', error.message, error.stack);
      setPurchasedEsims([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  // View encrypted PINs for selected item
  const viewEncryptedPins = (item) => {
    console.log('👁️ Viewing encrypted PINs for:', item);
    setSelectedInventoryItem(item);
  };

  // Copy to clipboard utility
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ Copied to clipboard');
      // Optional: Show toast notification
    } catch (error) {
      console.error('❌ Failed to copy to clipboard:', error);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setPasswordChangeMessage({ type: '', text: '' });
    
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'All fields are required' });
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordChangeMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }
    
    if (oldPassword === newPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'New password must be different from old password' });
      return;
    }
    
    try {
      setPasswordChangeLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPasswordChangeMessage({ type: 'success', text: 'Password changed successfully!' });
        // Clear form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordChangeMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);
      setPasswordChangeMessage({ type: 'error', text: 'An error occurred while changing password' });
    } finally {
      setPasswordChangeLoading(false);
    }
  };



  const fetchInventoryBundles = async (signal = null) => {
    if (isDemoMode()) {
      console.log('📦 Demo mode - skipping inventory fetch');
      setInventoryBundles([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('📦 No token - cannot fetch inventory');
        setInventoryBundles([]);
        return;
      }

      console.log('📦 Fetching inventory bundles from API...');
      const response = await fetch(`${API_BASE_URL}/retailer/purchased-bundles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        signal
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Inventory bundles response:', data);
        console.log('📦 Raw bundle data:', JSON.stringify(data.data, null, 2));
        
        const bundles = (data.data || []).map(bundle => {
          console.log('🔍 Processing bundle:', bundle);
          const processed = {
            id: bundle.orderNumber || bundle.id,
            bundleId: bundle.bundleId || bundle.id,
            bundleName: bundle.bundleName,
            bundlePrice: bundle.bundlePrice || bundle.totalPrice || bundle.pricePerUnit || 0,
            purchasePrice: bundle.purchasePrice || bundle.pricePerUnit || 0,
            availableQuantity: bundle.encryptedPins?.length || bundle.availablePins || 0,
            availablePins: bundle.encryptedPins?.length || bundle.availablePins || 0,
            totalPins: bundle.quantity || bundle.unitCount || 0,
            encryptedPins: bundle.encryptedPins || [],
            poolName: bundle.poolName || 'Standard Pool',
            status: 'ACTIVE',
            productType: 'EPIN'
          };
          console.log('✅ Processed bundle:', processed);
          return processed;
        });
        
        console.log('📦 Final processed inventory bundles:', bundles);
        setInventoryBundles(bundles);
      } else {
        console.error('❌ Failed to fetch inventory:', response.status);
        setInventoryBundles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
      setInventoryBundles([]);
    }
  };

  const fetchRetailerData = async () => {
    console.log('🚀 Starting fetchRetailerData for real backend connection...');
    
    // Prevent multiple simultaneous API calls
    if (fetchingData) {
      console.log('⏳ Already fetching data - skipping duplicate call');
      return;
    }
    
    // Only use demo mode if explicitly requested with ?demo=true
    const urlParams = new URLSearchParams(window.location.search);
    const hasDemoParam = urlParams.get('demo') === 'true';
    
    if (hasDemoParam) {
      console.log('🎯 Demo mode explicitly requested - skipping API calls');
      setConnectionStatus('demo');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found - switching to offline mode with local inventory');
      setConnectionStatus('offline');
      setLoading(false);
      // Load offline inventory
      await fetchInventoryBundles();
      return;
    }

    setFetchingData(true);
    setConnectionStatus('connecting');

    try {
      console.log('📡 Attempting backend connection with graceful degradation...');
      
      // Only fetch margin rate if not already fetching or fetched
      if (!fetchingMarginRate && retailerMarginRate === null) {
        await fetchRetailerMarginRate();
      } else {
        console.log('📊 Using existing margin rate or skipping due to ongoing fetch');
      }
      
      // Fetch real customer sales data
      const salesResult = await fetchCustomerSalesData();
      const { customerSales = 0, totalRevenue = 0 } = salesResult || {};
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Test backend with short timeout
      const testController = new AbortController();
      const testTimeoutId = setTimeout(() => testController.abort(), 3000);
      
      try {
        const testResponse = await fetch(`${API_BASE_URL}/auth/verify`, { 
          headers,
          signal: testController.signal,
          keepalive: false
        });
        
        clearTimeout(testTimeoutId);
        
        if (!testResponse.ok) {
          throw new Error(`Auth verify failed with status: ${testResponse.status}`);
        }
        
        console.log('✅ Backend responsive - attempting data fetch with error handling');
        setConnectionStatus('connected');
        
        // Fetch inventory first to ensure we have data for analytics
        console.log('📦 Fetching inventory before setting analytics...');
        await fetchInventoryBundles();
        
        // Only fetch essential data to prevent lag - remove orders and analytics fetching
        console.log('✅ Backend connected - using minimal API calls to prevent lag');
          
          // Set analytics with real sales data
          const currentInventoryUnits = getTotalInventoryUnits();
          console.log(`📊 Setting analytics with inventory units: ${currentInventoryUnits}`);
          
          setAnalytics({
            totalOrders: customerSales || 0,
            totalRevenue: totalRevenue || 0,
            monthlyGrowth: 0,
            pendingOrders: 0,
            orderGrowth: 0,
            successRate: customerSales > 0 ? 100 : 0,
            customerSales: customerSales || 0, // Real customer sales from direct sales orders
            totalProfit: totalProfit || 0,
            bundleInventory: currentInventoryUnits, // Total units, not bundle types
            profitMargin: retailerMarginRate || 0,
            salesPerformance: {},
            topProducts: []
          });
        
        console.log('✅ Backend data loaded with graceful error handling');
        
      } catch (backendError) {
        console.log('⚠️ Backend connection failed:', backendError.message);
        console.log('🔄 Using fallback data due to backend issues');
        setConnectionStatus('offline');
        
        // Ensure loading is turned off even on error
        setLoading(false);
        
        // Set minimal fallback data with any available sales data
        setOrders([]);
        const fallbackCustomerSales = customerSales || recentActivities.filter(a => a.type === 'pos_sale' || a.type === 'direct_sale').length || 0;
        const fallbackRevenue = totalRevenue || 0;
        
        setAnalytics({
          totalOrders: fallbackCustomerSales,
          totalRevenue: fallbackRevenue,
          monthlyGrowth: 0,
          pendingOrders: 0,
          orderGrowth: 0,
          successRate: fallbackCustomerSales > 0 ? 100 : 0,
          customerSales: fallbackCustomerSales, // Include direct sales and POS sales
          totalProfit: totalProfit || 0,
          bundleInventory: getTotalInventoryUnits() || 0, // Total units available
          profitMargin: retailerMarginRate || 0,
          salesPerformance: {},
          topProducts: []
        });
      }
      
    } catch (error) {
      console.error('💥 Unexpected error in fetchRetailerData:', error);
      setConnectionStatus('offline');
      setFetchingData(false);
      
      // Always ensure we have some data structure with available data
      setOrders([]);
      const localCustomerSales = recentActivities.filter(a => a.type === 'pos_sale' || a.type === 'direct_sale').length || 0;
      
      setAnalytics({
        totalOrders: localCustomerSales,
        totalRevenue: 0,
        monthlyGrowth: 0,
        pendingOrders: 0,
        orderGrowth: 0,
        successRate: localCustomerSales > 0 ? 100 : 0,
        customerSales: localCustomerSales, // Include local activities
        totalProfit: totalProfit || 0,
        bundleInventory: getTotalInventoryUnits() || 0, // Total inventory units
        profitMargin: 0,
        salesPerformance: {},
        topProducts: []
      });
    }
    
    // Always ensure loading states are reset
    setLoading(false);
    setFetchingData(false);
    console.log('🏁 fetchRetailerData completed');
            
  };

  const handleLogout = () => {
    if (isDemoMode()) {
      navigate('/', { replace: true });
    } else {
      logout();
      navigate('/', { replace: true });
    }
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
        
        // Add activity
        addActivity(
          'bundle_purchase', 
          `Purchased ${quantity}x ${bundle.name}`,
          { bundleName: bundle.name, quantity, amount: purchaseData.totalAmount }
        );
        
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

  const createSampleInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('🔧 No token - creating local demo inventory...');
        // Create local demo inventory if no token
        const demoInventory = [
          {
            id: 'local-demo-1',
            bundleId: 'local-demo-bundle-1',
            bundleName: 'Lyca 49 NOK Bundle (Local Demo)',
            bundlePrice: 49,
            purchasePrice: 34.3,
            availableQuantity: 20,
            totalPins: 20,
            status: 'ACTIVE',
            productType: 'EPIN'
          },
          {
            id: 'local-demo-2',
            bundleId: 'local-demo-bundle-2',
            bundleName: 'Lyca 99 NOK Bundle (Local Demo)',
            bundlePrice: 99,
            purchasePrice: 69.3,
            availableQuantity: 15,
            totalPins: 15,
            status: 'ACTIVE',
            productType: 'EPIN'
          },
          {
            id: 'local-demo-3',
            bundleId: 'local-demo-bundle-3',
            bundleName: 'Lyca 149 NOK Bundle (Local Demo)',
            bundlePrice: 149,
            purchasePrice: 104.3,
            availableQuantity: 10,
            totalPins: 10,
            status: 'ACTIVE',
            productType: 'EPIN'
          }
        ];
        setInventoryBundles(demoInventory);
        alert('✅ Local demo inventory created!\n\nYou now have sample bundles to test the Point of Sale system.\n\nNote: This is demo data only.');
        return;
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('🔧 Creating sample inventory via API...');
      
      const response = await fetch(`${API_BASE_URL}/retailer/inventory/create-sample`, {
        method: 'POST',
        headers
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sample inventory created:', result);
        alert('✅ Sample inventory created successfully!\n\nYou now have sample PINs to test the Point of Sale system.');
        
        // Refresh inventory
        await fetchInventoryBundles();
      } else {
        console.log('❌ API failed, creating local sample inventory...');
        // Fallback to local demo inventory if API fails
        const fallbackInventory = [
          {
            id: 'api-fallback-1',
            bundleId: 'api-fallback-bundle-1',
            bundleName: 'Lyca 49 NOK Bundle (Sample)',
            bundlePrice: 49,
            purchasePrice: 34.3,
            availableQuantity: 15,
            totalPins: 15,
            status: 'ACTIVE',
            productType: 'EPIN'
          },
          {
            id: 'api-fallback-2',
            bundleId: 'api-fallback-bundle-2',
            bundleName: 'Lyca 99 NOK Bundle (Sample)',
            bundlePrice: 99,
            purchasePrice: 69.3,
            availableQuantity: 10,
            totalPins: 10,
            status: 'ACTIVE',
            productType: 'EPIN'
          }
        ];
        setInventoryBundles(fallbackInventory);
        alert('✅ Sample inventory created locally!\n\nYou now have sample bundles to test the Point of Sale system.\n\nNote: API is unavailable, using local demo data.');
      }
    } catch (error) {
      console.error('💥 Error creating sample inventory:', error);
      console.log('🔧 Creating emergency local inventory...');
      // Emergency fallback inventory
      const emergencyInventory = [
        {
          id: 'emergency-1',
          bundleId: 'emergency-bundle-1',
          bundleName: 'Lyca 49 NOK Bundle (Emergency)',
          bundlePrice: 49,
          purchasePrice: 34.3,
          availableQuantity: 5,
          totalPins: 5,
          status: 'ACTIVE',
          productType: 'EPIN'
        }
      ];
      setInventoryBundles(emergencyInventory);
      alert('✅ Emergency inventory created!\n\nNetwork error occurred, but you can still test the POS system with sample data.');
    }
  };

  const handleDirectSale = async () => {
    if (!selectedBundle || selectedBundle.availableQuantity < 1) {
      alert('Please select a valid bundle. No PINs available for this bundle.');
      return;
    }

    try {
      setSaleLoading(true);
      
      // Calculate profit using admin-set margin rate
      if (!retailerMarginRate) {
        alert('❌ Cannot process sale - Admin margin rate not available yet. Please wait for admin settings to load or contact support.');
        return;
      }
      
      const realMarginRate = retailerMarginRate;
      const marginDecimal = realMarginRate / 100;
      
      // Use purchase price or calculate from admin margin rate
      const costPrice = selectedBundle.purchasePrice || (selectedBundle.bundlePrice * (1 - marginDecimal));
      const salePrice = selectedBundle.bundlePrice;
      const profitAmount = salePrice - costPrice;
      
      console.log('💰 POS Sale Calculation:');
      console.log(`  Margin Rate: ${realMarginRate}%`);
      console.log(`  Sale Price: NOK ${salePrice}`);
      console.log(`  Cost Price: NOK ${costPrice.toFixed(2)}`);
      console.log(`  Profit: NOK ${profitAmount.toFixed(2)}`);
      
      // Check if this is a demo/fallback bundle
      const isDemo = selectedBundle.id.includes('demo') || selectedBundle.id.includes('fallback') || selectedBundle.id.includes('local') || selectedBundle.id.includes('emergency') || selectedBundle.id.includes('offline');
      
      if (isDemo) {
        console.log('🎯 Processing demo/offline sale...');
        
        // Generate demo PINs
        const demoPins = [{
          pin: `${Math.random().toString().substr(2, 4)}-${Math.random().toString().substr(2, 4)}-${Math.random().toString().substr(2, 4)}-${Math.random().toString().substr(2, 4)}`,
          serialNumber: `SN${Date.now()}${Math.random().toString().substr(2, 3)}`,
          value: selectedBundle.bundlePrice,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          bundleName: selectedBundle.bundleName,
          status: 'ACTIVE'
        }];
        
        // Update local inventory - reduce quantity by 1
        setInventoryBundles(prev => {
          const updatedBundles = prev.map(bundle => 
            bundle.id === selectedBundle.id 
              ? { ...bundle, availableQuantity: Math.max(0, bundle.availableQuantity - 1) }
              : bundle
          );
          
          // Calculate new total units
          const newTotalUnits = updatedBundles.reduce((sum, b) => sum + (b.availableQuantity || 0), 0);
          console.log(`📦 Inventory reduced: ${selectedBundle.bundleName} (${selectedBundle.availableQuantity} → ${Math.max(0, selectedBundle.availableQuantity - 1)}), Total: ${newTotalUnits}`);
          
          // Update analytics with new inventory count and increased customer sales
          setTimeout(() => {
            setAnalytics(prev => ({
              ...prev,
              bundleInventory: newTotalUnits,
              customerSales: prev.customerSales + 1,
              totalOrders: prev.totalOrders + 1,
              totalRevenue: prev.totalRevenue + salePrice
            }));
            console.log(`📈 Analytics updated: +1 customer sale, inventory: ${newTotalUnits}`);
          }, 100);
          
          return updatedBundles;
        });
        
        // Update profit and activity
        updateProfit(salePrice, costPrice, selectedBundle.bundleName);
        addActivity(
          'pos_sale',
          `Sold 1x ${selectedBundle.bundleName} - Profit: NOK ${profitAmount.toFixed(2)} (Demo)`,
          {
            bundleName: selectedBundle.bundleName,
            quantity: 1,
            saleAmount: salePrice,
            costPrice: costPrice,
            profitAmount: profitAmount,
            pins: 1,
            customerType: 'walk-in',
            isDemoMode: true
          }
        );
        
        // Prepare receipt
        const receipt = {
          saleId: `DEMO-${Date.now()}`,
          bundleName: selectedBundle.bundleName,
          quantity: 1,
          unitPrice: selectedBundle.bundlePrice,
          totalAmount: selectedBundle.bundlePrice,
          costPrice: costPrice,
          profitAmount: profitAmount,
          saleDate: new Date().toLocaleString(),
          pins: demoPins,
          retailerName: 'EasyTopup.no',
          isDemoMode: true
        };
        
        setReceiptData(receipt);
        setGeneratedPins(demoPins);
        setShowPinModal(true);
        setSelectedBundle(null);
        
        console.log('✅ Demo sale completed successfully');
        return;
      }
      
      // Real API sale - but fallback to offline mode if backend is unavailable
      const token = localStorage.getItem('token');
      
      // Try API first, but fallback to offline mode if it fails
      if (token) {
        try {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          };

          console.log('🛒 Attempting real API sale:', {
            bundle: selectedBundle.bundleName,
            quantity: 1,
            customer: 'Walk-in Customer'
          });

          const saleData = {
            bundleId: selectedBundle.bundleId,
            bundleName: selectedBundle.bundleName,
            quantity: 1,
            unitPrice: selectedBundle.bundlePrice,
            totalAmount: selectedBundle.bundlePrice,
            costPrice: costPrice,
            profitAmount: profitAmount,
            marginRate: realMarginRate,
            customerName: `Walk-in Customer`,
            customerPhone: '',
            customerEmail: '',
            saleType: 'DIRECT_SALE',
            retailerId: user?.id,
            saleDate: new Date().toISOString()
          };

          // Add timeout to API call
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(`${API_BASE_URL}/retailer/direct-sale`, {
            method: 'POST',
            headers,
            body: JSON.stringify(saleData),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          console.log('📡 Sale response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Direct sale successful via API:', result);
            
            // Extract generated PINs from response
            const pins = result.data?.pins || result.pins || [];
            
            // Update local inventory after successful API sale
            setInventoryBundles(prev => {
              const updatedBundles = prev.map(bundle => 
                bundle.id === selectedBundle.id 
                  ? { ...bundle, availableQuantity: Math.max(0, bundle.availableQuantity - 1) }
                  : bundle
              );
              
              // Calculate new total units
              const newTotalUnits = updatedBundles.reduce((sum, b) => sum + (b.availableQuantity || 0), 0);
              console.log(`📦 API Sale - Inventory reduced: ${selectedBundle.bundleName}, Total: ${newTotalUnits}`);
              
              // Update analytics with new inventory count and increased customer sales
              setTimeout(() => {
                setAnalytics(prev => ({
                  ...prev,
                  bundleInventory: newTotalUnits,
                  customerSales: prev.customerSales + 1,
                  totalOrders: prev.totalOrders + 1,
                  totalRevenue: prev.totalRevenue + salePrice
                }));
                console.log(`📈 API Sale - Analytics updated: +1 customer sale, inventory: ${newTotalUnits}`);
              }, 100);
              
              return updatedBundles;
            });
            
            // Update profit and activity
            updateProfit(salePrice, costPrice, selectedBundle.bundleName);
            addActivity(
              'pos_sale',
              `Sold 1x ${selectedBundle.bundleName} - Profit: NOK ${profitAmount.toFixed(2)} (API)`,
              {
                bundleName: selectedBundle.bundleName,
                quantity: 1,
                saleAmount: salePrice,
                costPrice: costPrice,
                profitAmount: profitAmount,
                pins: pins.length || 0,
                customerType: 'walk-in',
                method: 'api'
              }
            );
            
            // Prepare receipt data
            const receipt = {
              saleId: result.data?.saleId || `API-${Date.now()}`,
              bundleName: selectedBundle.bundleName,
              quantity: 1,
              unitPrice: selectedBundle.bundlePrice,
              totalAmount: selectedBundle.bundlePrice,
              costPrice: costPrice,
              profitAmount: profitAmount,
              saleDate: new Date().toLocaleString(),
              pins: pins,
              retailerName: 'EasyTopup.no',
              method: 'API'
            };
            
            setReceiptData(receipt);
            setGeneratedPins(pins);
            setShowPinModal(true);
            setSelectedBundle(null);
            
            console.log('🎯 API PIN allocation completed successfully');
            return; // Success - exit function
          } else {
            // API failed, fall through to offline mode
            console.log('⚠️ API sale failed, falling back to offline mode');
          }
        } catch (apiError) {
          console.log('⚠️ API error, falling back to offline mode:', apiError.message);
          // Fall through to offline mode
        }
      }
      
      // Offline mode - generate local PINs
      console.log('🔄 Processing sale in offline mode...');
      
      // Generate offline PINs
      const offlinePins = [{
        pin: `OFF-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        serialNumber: `OFF${Date.now()}${Math.random().toString().substr(2, 3)}`,
        value: selectedBundle.bundlePrice,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        bundleName: selectedBundle.bundleName,
        status: 'ACTIVE',
        isOffline: true
      }];
      
      // Update local inventory for offline sale
      setInventoryBundles(prev => {
        const updatedBundles = prev.map(bundle => 
          bundle.id === selectedBundle.id 
            ? { ...bundle, availableQuantity: Math.max(0, bundle.availableQuantity - 1) }
            : bundle
        );
        
        // Calculate new total units
        const newTotalUnits = updatedBundles.reduce((sum, b) => sum + (b.availableQuantity || 0), 0);
        console.log(`📦 Offline Sale - Inventory reduced: ${selectedBundle.bundleName}, Total: ${newTotalUnits}`);
        
        // Update analytics with new inventory count and increased customer sales
        setTimeout(() => {
          setAnalytics(prev => ({
            ...prev,
            bundleInventory: newTotalUnits,
            customerSales: prev.customerSales + 1,
            totalOrders: prev.totalOrders + 1,
            totalRevenue: prev.totalRevenue + salePrice
          }));
          console.log(`📈 Offline Sale - Analytics updated: +1 customer sale, inventory: ${newTotalUnits}`);
        }, 100);
        
        return updatedBundles;
      });
      
      // Update profit and activity
      updateProfit(salePrice, costPrice, selectedBundle.bundleName);
      addActivity(
        'pos_sale',
        `Sold 1x ${selectedBundle.bundleName} - Profit: NOK ${profitAmount.toFixed(2)} (Offline)`,
        {
          bundleName: selectedBundle.bundleName,
          quantity: 1,
          saleAmount: salePrice,
          costPrice: costPrice,
          profitAmount: profitAmount,
          pins: 1,
          customerType: 'walk-in',
          method: 'offline'
        }
      );
      
      // Prepare offline receipt
      const offlineReceipt = {
        saleId: `OFFLINE-${Date.now()}`,
        bundleName: selectedBundle.bundleName,
        quantity: 1,
        unitPrice: selectedBundle.bundlePrice,
        totalAmount: selectedBundle.bundlePrice,
        costPrice: costPrice,
        profitAmount: profitAmount,
        saleDate: new Date().toLocaleString(),
        pins: offlinePins,
        retailerName: 'EasyTopup.no',
        method: 'Offline Mode',
        note: 'Generated offline - sync with backend when connection is restored'
      };
      
      setReceiptData(offlineReceipt);
      setGeneratedPins(offlinePins);
      setShowPinModal(true);
      setSelectedBundle(null);
      
      console.log('✅ Offline sale completed successfully');
      
      // Show offline sale notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #f59e0b; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; font-size: 14px;">
          🔄 Sale processed offline - PINs generated locally
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 4000);
    } catch (error) {
      console.error('💥 Error processing direct sale:', error);
      alert(`❌ Sale Failed\n\nNetwork Error: ${error.message}\n\nPlease check your connection and try again.`);
    } finally {
      setSaleLoading(false);
    }
  };

  const printPins = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleString();
    
    const printContent = `
      <html>
        <head>
          <title>ePIN Receipt - Walk-in Customer</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .pin-item {
              border: 1px solid #ccc;
              padding: 15px;
              margin: 10px 0;
              background: #f9f9f9;
            }
            .pin-code {
              font-size: 18px;
              font-weight: bold;
              background: #fff;
              padding: 8px;
              border: 2px dashed #333;
              text-align: center;
              margin: 10px 0;
            }
            .footer {
              margin-top: 30px;
              border-top: 1px solid #000;
              padding-top: 10px;
              text-align: center;
              font-size: 12px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EasyTopup.no</h1>
            <h2>ePIN Receipt</h2>
            <p>Date: ${currentDate}</p>
          </div>
          
          <div class="customer-info">
            <h3>Customer Information:</h3>
            <p><strong>Name:</strong> Walk-in Customer</p>
            <p><strong>Phone:</strong> N/A</p>
          </div>
          
          <div class="purchase-info">
            <h3>Purchase Details:</h3>
            <p><strong>Bundle:</strong> ${selectedBundle?.bundleName || 'N/A'}</p>
            <p><strong>Quantity:</strong> 1</p>
            <p><strong>Unit Price:</strong> NOK ${selectedBundle?.bundlePrice || 0}</p>
            <p><strong>Total Amount:</strong> NOK ${selectedBundle?.bundlePrice || 0}</p>
          </div>
          
          <div class="pins-section">
            <h3>Your ePINs:</h3>
            ${generatedPins.map((pin, index) => `
              <div class="pin-item">
                <p><strong>PIN ${index + 1}:</strong></p>
                <div class="pin-code">${pin.pin}</div>
                <p><strong>Serial:</strong> ${pin.serialNumber}</p>
                <p><strong>Value:</strong> NOK ${pin.value}</p>
                <p><strong>Valid Until:</strong> ${new Date(pin.expiryDate).toLocaleDateString()}</p>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>For support, contact: support@easytopup.no</p>
            <p>Keep this receipt for your records</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
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

  // Print receipt function
  const printReceipt = () => {
    if (!receiptData) return;
    
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PIN Receipt</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 20px; }
          .receipt { max-width: 300px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
          .line { margin: 5px 0; }
          .pins { margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000; }
          .pin-item { margin: 10px 0; padding: 8px; background: #f5f5f5; border: 1px solid #ddd; }
          .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>EASYTOPUP.NO</h2>
            <p>PIN Receipt</p>
          </div>
          
          <div class="line"><strong>Sale ID:</strong> ${receiptData.saleId}</div>
          <div class="line"><strong>Date:</strong> ${receiptData.saleDate}</div>
          <div class="line"><strong>Bundle:</strong> ${receiptData.bundleName}</div>
          <div class="line"><strong>Quantity:</strong> ${receiptData.quantity}</div>
          <div class="line"><strong>Unit Price:</strong> NOK ${receiptData.unitPrice}</div>
          <div class="line"><strong>Total:</strong> NOK ${receiptData.totalAmount}</div>
          
          <div class="pins">
            <h3>Your PINs:</h3>
            ${receiptData.pins.map((pin, index) => `
              <div class="pin-item">
                <strong>PIN ${index + 1}:</strong><br>
                ${pin.pin}<br>
                <small>Serial: ${pin.serialNumber || 'N/A'}</small><br>
                <small>Valid until: ${pin.expiryDate ? new Date(pin.expiryDate).toLocaleDateString() : '365 days'}</small>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Keep this receipt safe</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 1000);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

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
                  <p className="text-[10px] text-gray-500">{isDemoMode ? 'DEMO MODE' : 'EasyTopup.no'}</p>
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
                onClick={handleTabChange}
              />
              <SidebarNavItem
                id="pos"
                label="Point of Sale"
                icon={ShoppingCart}
                active={activeTab === 'pos'}
                onClick={handleTabChange}
              />
              <SidebarNavItem
                id="bundles"
                label="Buy Bundles"
                icon={Package}
                active={activeTab === 'bundles'}
                onClick={handleTabChange}
              />
              <SidebarNavItem
                id="esim"
                label="Buy eSIMs"
                icon={Globe2}
                active={activeTab === 'esim'}
                onClick={handleTabChange}
              />
              <SidebarNavItem
                id="inventory"
                label="My Inventory"
                icon={Box}
                active={activeTab === 'inventory'}
                onClick={handleTabChange}
              />
              <SidebarNavItem
                id="offers"
                label="Offers"
                icon={Tag}
                active={activeTab === 'offers'}
                onClick={handleTabChange}
                badge={activePromotions.length}
              />
              <SidebarNavItem
                id="margin"
                label="Margin Rate"
                icon={Award}
                active={activeTab === 'margin'}
                onClick={handleTabChange}
              />
              <SidebarNavItem
                id="analytics"
                label="Analytics"
                icon={PieChart}
                active={activeTab === 'analytics'}
                onClick={handleTabChange}
              />
              <SidebarNavItem
                id="privacy"
                label="Privacy Settings"
                icon={AlertCircle}
                active={activeTab === 'privacy'}
                onClick={handleTabChange}
              />
            </>
          ) : (
            <>
              <button onClick={() => handleTabChange('overview')} className={`w-full p-3 rounded-xl ${activeTab === 'overview' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <BarChart3 size={20} />
              </button>
              <button onClick={() => handleTabChange('pos')} className={`w-full p-3 rounded-xl ${activeTab === 'pos' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ShoppingCart size={20} />
              </button>
              <button onClick={() => setActiveTab('bundles')} className={`w-full p-3 rounded-xl ${activeTab === 'bundles' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Package size={20} />
              </button>
              <button onClick={() => handleTabChange('esim')} className={`w-full p-3 rounded-xl ${activeTab === 'esim' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Globe2 size={20} />
              </button>
              <button onClick={() => handleTabChange('inventory')} className={`w-full p-3 rounded-xl ${activeTab === 'inventory' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
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
              <button onClick={() => handleTabChange('margin')} className={`w-full p-3 rounded-xl ${activeTab === 'margin' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Award size={20} />
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
                {activeTab === 'pos' && 'Point of Sale'}
                {activeTab === 'bundles' && 'Buy Bundles'}
                {activeTab === 'esim' && 'Buy eSIMs'}
                {activeTab === 'inventory' && 'My Inventory'}
                {activeTab === 'offers' && 'Offers'}
                {activeTab === 'margin' && 'Margin Rate'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'privacy' && 'Privacy Settings'}
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
            {/* Promotional Banner temporarily disabled for debugging */}
            {/* <RetailerPromotionalBanner onClose={() => setShowPromoBanner(false)} /> */}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Customer Sales"
                value={(analytics.customerSales || analytics.totalOrders || 0).toLocaleString()}
                change={analytics.orderGrowth || 0}
                icon={ShoppingCart}
                color="bg-gradient-to-br from-blue-600 to-blue-700"
                description="Bundles sold to customers"
              />
              <StatCard
                title="Total Profit"
                value={`NOK ${totalProfit.toLocaleString('no-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                change={dailyProfit > 0 ? ((dailyProfit / Math.max(totalProfit - dailyProfit, 1)) * 100).toFixed(1) : 0}
                icon={DollarSign}
                color="bg-gradient-to-br from-green-600 to-green-700"
                description={`Daily: NOK ${dailyProfit.toFixed(2)}`}
              />
              <StatCard
                title="Bundle Inventory"
                value={(analytics.bundleInventory || 0).toLocaleString()}
                icon={Package}
                color="bg-gradient-to-br from-yellow-600 to-yellow-700"
                description="Bundles available to sell"
              />
              <StatCard
                title="Your Margin Rate"
                value={retailerMarginRate !== null ? `${retailerMarginRate}%` : 'Not Set'}
                change={retailerMarginRate ? (analytics.profitMarginGrowth || 0) : null}
                icon={Award}
                color={retailerMarginRate ? "bg-gradient-to-br from-purple-600 to-purple-700" : "bg-gradient-to-br from-gray-400 to-gray-500"}
                description={retailerMarginRate !== null ? `Set by admin - ${retailerMarginRate}% profit margin` : 'Admin needs to set margin rate'}
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
                    onClick={() => handleTabChange('pos')}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                  >
                    <ShoppingCart className="text-emerald-600 mb-2" size={24} />
                    <span className="text-sm font-medium">Point of Sale</span>
                  </button>
                  <button 
                    onClick={() => {
                      handleTabChange('bundles');
                      fetchAvailableBundles();
                    }}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <Package className="text-green-600 mb-2" size={24} />
                    <span className="text-sm font-medium">Buy Bundles</span>
                  </button>
                  <button 
                    onClick={() => handleTabChange('esim')}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <Globe2 className="text-blue-600 mb-2" size={24} />
                    <span className="text-sm font-medium">Buy eSIMs</span>
                  </button>
                  <button 
                    onClick={() => handleTabChange('inventory')}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <DollarSign className="text-purple-600 mb-2" size={24} />
                    <span className="text-sm font-medium">My Inventory</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="text-green-600" size={20} />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity) => {
                      // Get the appropriate icon based on activity type
                      let IconComponent;
                      switch(activity.type) {
                        case 'bundle_purchase': IconComponent = Package; break;
                        case 'esim_purchase': IconComponent = Globe2; break;
                        case 'pos_sale': IconComponent = ShoppingCart; break;
                        case 'inventory_update': IconComponent = Box; break;
                        case 'navigation': IconComponent = Activity; break;
                        default: IconComponent = Activity; break;
                      }
                      
                      // Get the appropriate color
                      let colorClass;
                      switch(activity.type) {
                        case 'bundle_purchase': colorClass = 'bg-green-100 text-green-600'; break;
                        case 'esim_purchase': colorClass = 'bg-blue-100 text-blue-600'; break;
                        case 'pos_sale': colorClass = 'bg-purple-100 text-purple-600'; break;
                        case 'inventory_update': colorClass = 'bg-orange-100 text-orange-600'; break;
                        case 'navigation': colorClass = 'bg-gray-100 text-gray-600'; break;
                        default: colorClass = 'bg-gray-100 text-gray-600'; break;
                      }
                      
                      return (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                              <IconComponent size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{activity.description}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                              {activity.details && activity.details.amount && (
                                <p className="text-xs text-gray-500">NOK {activity.details.amount}</p>
                              )}
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {activity.type === 'bundle_purchase' && 'Bundle'}
                            {activity.type === 'esim_purchase' && 'eSIM'}
                            {activity.type === 'pos_sale' && 'Sale'}
                            {activity.type === 'inventory_update' && 'Inventory'}
                            {activity.type === 'navigation' && 'Navigation'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Activity size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No recent activity</p>
                      <p className="text-sm text-gray-400">
                        Activity will appear here when you:
                      </p>
                      <div className="text-xs text-gray-400 mt-2 space-y-1">
                        <p>• Purchase bundles for resale</p>
                        <p>• Buy eSIM products</p>
                        <p>• Make Point of Sale transactions</p>
                        <p>• Update your inventory</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <ShoppingCart size={28} />
                    Point of Sale System
                  </h3>
                  <p className="text-green-100">
                    Sell bundles directly to walk-in customers and generate ePINs instantly
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-300 animate-pulse' : connectionStatus === 'connecting' ? 'bg-yellow-300 animate-pulse' : 'bg-red-300'}`}></div>
                  <span className="text-sm text-green-100">
                    {connectionStatus === 'connected' ? 'Online' : 
                     connectionStatus === 'connecting' ? 'Connecting...' : 
                     connectionStatus === 'demo' ? 'Demo Mode' : 'Offline Mode'}
                  </span>
                  {connectionStatus === 'offline' && (
                    <span className="text-xs text-yellow-200 bg-yellow-800/30 px-2 py-1 rounded">
                      Server Error
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Margin Rate Warning */}
            {!retailerMarginRate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 text-sm">⏳</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800">Waiting for Admin Settings</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Loading margin rate from admin settings. Profit calculations and sales will be available once this loads.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bundle Selection */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="text-blue-600" size={20} />
                    Select Bundle
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const total = getTotalInventoryUnits();
                        console.log(`🔧 DEBUG: Manual inventory check - Total units: ${total}`);
                        setAnalytics(prev => ({ ...prev, bundleInventory: total }));
                      }}
                      className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                      title="Debug Inventory Count"
                    >
                      📊
                    </button>
                    <button
                      onClick={() => fetchInventoryBundles()}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                      title="Refresh Inventory"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {inventoryBundles.length > 0 ? (
                    inventoryBundles.map((bundle) => (
                      <div
                        key={bundle.id}
                        onClick={() => setSelectedBundle(bundle)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedBundle?.id === bundle.id
                            ? 'border-green-500 bg-green-50 shadow-lg'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-bold text-gray-900 text-lg">{bundle.bundleName}</h5>
                              <span className="text-xl font-bold text-green-600">NOK {bundle.bundlePrice}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-semibold">
                                🏷️ {bundle.poolName}
                              </div>
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-bold">
                                📦 {bundle.availableQuantity} Units in Stock
                              </div>
                              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
                                Cost: NOK {(bundle.purchasePrice || 0).toFixed(2)}
                              </div>
                              <div className={`px-3 py-1 rounded-lg text-xs font-medium ${retailerMarginRate ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                Profit: {retailerMarginRate ? 
                                  `+NOK ${(bundle.bundlePrice - (bundle.purchasePrice || 0)).toFixed(2)}` :
                                  'Calculating...'
                                }
                              </div>
                            </div>
                          </div>
                          {selectedBundle?.id === bundle.id && (
                            <div className="flex-shrink-0">
                              <CheckCircle className="text-green-600" size={24} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No bundles in inventory</p>
                      <p className="text-sm text-gray-400 mb-4">Purchase bundles from the admin to sell to customers</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sale Details */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="text-purple-600" size={20} />
                  Customer & Sale Details
                </h4>
                
                <form className="space-y-4">
                  {/* Quick Sale Information */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Quick Sale</h5>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Simple Process:</strong> Select bundle → Generate 1 PIN for customer
                      </p>
                    </div>
                  </div>

                  {/* Sale Details */}
                  {selectedBundle && (
                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-700 mb-3">Sale Details</h5>
                      {!retailerMarginRate && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Waiting for admin margin rate settings...
                          </p>
                        </div>
                      )}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bundle:</span>
                          <span className="font-medium">{selectedBundle.bundleName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit Price:</span>
                          <span className="font-medium">NOK {selectedBundle.bundlePrice}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium">1 PIN</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total Amount:</span>
                            <span className="text-green-600">NOK {selectedBundle.bundlePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Cost Price:</span>
                            <span className="text-gray-600">
                              {retailerMarginRate ? 
                                `NOK ${(selectedBundle.purchasePrice || (selectedBundle.bundlePrice * (1 - retailerMarginRate / 100))).toFixed(2)}` :
                                'Calculating...'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold border-t pt-1">
                            <span className="text-gray-700">Your Profit:</span>
                            <span className="text-blue-600">
                              {retailerMarginRate ? 
                                `NOK ${(selectedBundle.bundlePrice - (selectedBundle.purchasePrice || (selectedBundle.bundlePrice * (1 - retailerMarginRate / 100)))).toFixed(2)}` :
                                'Calculating...'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Your Margin:</span>
                            <span className="text-purple-600 font-medium">
                              {retailerMarginRate ? `${retailerMarginRate}%` : 'Loading...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      onClick={handleDirectSale}
                      disabled={!selectedBundle || saleLoading || !retailerMarginRate}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      title={!retailerMarginRate ? 'Waiting for admin margin rate settings' : ''}
                    >
                      {saleLoading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Processing Sale...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={18} />
                          Allocate PINs & Print Receipt
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBundle(null);
                        // Quantity is fixed at 1
                      }}
                      className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                    >
                      Clear Selection
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Generated PINs Modal */}
            {showPinModal && generatedPins.length > 0 && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={24} />
                      Sale Completed Successfully!
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Generated {generatedPins.length} ePIN(s) for walk-in customer
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    {generatedPins.map((pin, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">ePIN {index + 1}</h4>
                          <span className="text-sm text-gray-500">NOK {pin.value}</span>
                        </div>
                        <div className="bg-white rounded border-2 border-dashed border-gray-400 p-3 text-center">
                          <p className="text-xs text-gray-600 mb-1">PIN Code</p>
                          <p className="text-xl font-mono font-bold text-green-600">{pin.pin}</p>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          <p>Serial: {pin.serialNumber}</p>
                          <p>Valid Until: {new Date(pin.expiryDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={printReceipt}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Print Receipt
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          generatedPins.map((pin, i) => `PIN ${i+1}: ${pin.pin}`).join('\n')
                        );
                        alert('PINs copied to clipboard!');
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Copy size={16} />
                      Copy PINs
                    </button>
                    <button
                      onClick={() => {
                        setShowPinModal(false);
                        setGeneratedPins([]);
                        setReceiptData(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bundles' && (
          <RetailerBundlePurchaseDashboard />
        )}

        {activeTab === 'esim' && (
          <RetailerEsimPurchase />
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Inventory Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">My Inventory</h2>
                  <p className="text-purple-100">View all purchased bundles and eSIMs with encrypted PINs</p>
                </div>
                <Box size={48} className="opacity-20" />
              </div>
            </div>

            {/* Purchased Bundles Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="text-purple-600" size={24} />
                  Purchased Bundles
                </h3>
                <button
                  onClick={() => fetchPurchasedBundles()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {loadingInventory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : purchasedBundles.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No purchased bundles yet</p>
                  <p className="text-gray-500">Purchase bundles from the "Buy Bundles" section to see them here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bundle Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pool Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Units</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price per Unit</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Purchase Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchasedBundles.map((bundle, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-gray-900">{bundle.bundleName || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{bundle.poolName || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-purple-600">{bundle.unitCount || 0}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">NOK {bundle.pricePerUnit?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{new Date(bundle.purchaseDate).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => viewEncryptedPins(bundle)}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1 text-sm"
                            >
                              <Eye size={14} />
                              View PINs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Purchased eSIMs Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Globe2 className="text-green-600" size={24} />
                  Purchased eSIMs
                </h3>
                <button
                  onClick={() => fetchPurchasedEsims()}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {loadingInventory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : purchasedEsims.length === 0 ? (
                <div className="text-center py-12">
                  <Globe2 size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No purchased eSIMs yet</p>
                  <p className="text-gray-500">Purchase eSIMs from the "Buy eSIMs" section to see them here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pool Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Units</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price per Unit</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Purchase Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchasedEsims.map((esim, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-gray-900">{esim.productName || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{esim.poolName || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-green-600">{esim.unitCount || 0}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">NOK {esim.pricePerUnit?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{new Date(esim.purchaseDate).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => viewEncryptedPins(esim)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 text-sm"
                            >
                              <Eye size={14} />
                              View PINs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* PIN Viewer Modal */}
            {selectedInventoryItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">Encrypted PINs</h3>
                      <button
                        onClick={() => setSelectedInventoryItem(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <p className="text-gray-600 mt-2">{selectedInventoryItem.bundleName || selectedInventoryItem.productName}</p>
                  </div>
                  <div className="p-6">
                    {selectedInventoryItem.encryptedPins && selectedInventoryItem.encryptedPins.length > 0 ? (
                      <div className="space-y-3">
                        {selectedInventoryItem.encryptedPins.map((pin, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">PIN #{index + 1}</p>
                              <p className="text-sm font-mono text-gray-900 break-all">{pin}</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(pin)}
                              className="ml-3 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Copy PIN"
                            >
                              <Copy size={16} className="text-gray-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle size={48} className="text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No PINs available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
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
            <RetailerPromotionalBanner 
              promotions={activePromotions}
              loading={fetchingPromotions}
            />
            
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="text-indigo-600" size={24} />
                Special Offers & Promotions
              </h3>
              <p className="text-gray-600 mb-6">
                Take advantage of exclusive promotional offers and reward campaigns to boost your sales and earn more rewards!
              </p>
              <FeaturedPromotions 
                promotions={activePromotions}
                loading={fetchingPromotions}
              />
            </div>
          </div>
        )}

        {/* Margin Rate Tab */}
        {activeTab === 'margin' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Award size={28} />
                Your Profit Margin Rate
              </h3>
              <p className="text-purple-100">
                This is your profit margin rate set by the admin. It determines your profit on each sale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Margin Rate */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Current Margin</h4>
                  <Award className="text-purple-600" size={24} />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{retailerMarginRate}%</div>
                  <p className="text-sm text-gray-600">Profit margin per sale</p>
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-700">
                      📊 For every NOK 100 sale, you earn NOK {retailerMarginRate} profit
                    </p>
                  </div>
                </div>
              </div>

              {/* Margin Calculator */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Profit Calculator</h4>
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sale Price:</span>
                    <span className="font-medium">NOK 100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cost Price:</span>
                    <span className="font-medium">NOK {(100 * (1 - retailerMarginRate / 100)).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-700">Your Profit:</span>
                      <span className="text-green-600">NOK {retailerMarginRate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Margin Status */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Margin Status</h4>
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Active & Applied</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 Margin rate is automatically applied to all your sales
                    </p>
                  </div>
                  <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      ⚙️ Only admin can modify your margin rate
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Margin History Table */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="text-blue-600" size={20} />
                Recent Sales with Current Margin
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bundle</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentActivities
                      .filter(activity => activity.type === 'pos_sale' && activity.details?.saleAmount)
                      .slice(0, 5)
                      .map((sale, index) => {
                        const saleAmount = sale.details.saleAmount || 0;
                        const costPrice = sale.details.costPrice || (saleAmount * (1 - retailerMarginRate / 100));
                        const profit = saleAmount - costPrice;
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {new Date(sale.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {sale.details.bundleName || 'Bundle Sale'}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              NOK {saleAmount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              NOK {costPrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold text-green-600">
                              NOK {profit.toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {retailerMarginRate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    {recentActivities.filter(activity => activity.type === 'pos_sale' && activity.details?.saleAmount).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          <Activity size={32} className="mx-auto mb-2 text-gray-400" />
                          <p>No sales data available</p>
                          <p className="text-xs text-gray-400">Make some sales to see margin calculations here</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <AlertCircle size={28} />
                    Privacy & Security Settings
                  </h2>
                  <p className="text-indigo-100">Manage your account security and password</p>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Change Password</h3>
                  <p className="text-gray-600 text-sm">Update your password to keep your account secure</p>
                </div>

                {/* Password Change Form */}
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {/* Alert Messages */}
                  {passwordChangeMessage.text && (
                    <div className={`p-4 rounded-xl border ${
                      passwordChangeMessage.type === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        {passwordChangeMessage.type === 'success' ? (
                          <CheckCircle size={20} />
                        ) : (
                          <AlertCircle size={20} />
                        )}
                        <p className="font-medium">{passwordChangeMessage.text}</p>
                      </div>
                    </div>
                  )}

                  {/* Old Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      disabled={passwordChangeLoading}
                    />
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      disabled={passwordChangeLoading}
                    />
                    <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      disabled={passwordChangeLoading}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={passwordChangeLoading}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                      {passwordChangeLoading ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Change Password
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordChangeMessage({ type: '', text: '' });
                      }}
                      disabled={passwordChangeLoading}
                      className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </form>

                {/* Security Tips */}
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Password Security Tips:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Use a combination of letters, numbers, and special characters</li>
                    <li>• Avoid using easily guessable information like birthdays or names</li>
                    <li>• Don't reuse passwords across different accounts</li>
                    <li>• Change your password regularly (every 3-6 months)</li>
                    <li>• Never share your password with anyone</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetailerDashboard;
