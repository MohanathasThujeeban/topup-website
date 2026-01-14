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
    if (tab === 'pos') {
      addActivity('navigation', 'Opened Point of Sale', { action: 'navigation', section: 'pos' });
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
  const [availableEsims, setAvailableEsims] = useState([]); // eSIM products with QR codes
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [selectedEsim, setSelectedEsim] = useState(null); // Selected eSIM with QR code
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [saleLoading, setSaleLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [generatedPins, setGeneratedPins] = useState([]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [fetchingPromotions, setFetchingPromotions] = useState(false);
  const [fetchingMarginRate, setFetchingMarginRate] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState('All Operators');
  const [selectedProductCategory, setSelectedProductCategory] = useState('Bundle plans');
  
  // eSIM customer form state
  const [showEsimCustomerForm, setShowEsimCustomerForm] = useState(false);
  const [esimCustomerData, setEsimCustomerData] = useState({
    email: '',
    fullName: '',
    passportId: ''
  });
  const [esimSaleLoading, setEsimSaleLoading] = useState(false);
  
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
  const [productMarginRates, setProductMarginRates] = useState([]); // Array of product-specific margin rates
  
  // Profit tracking state - starts from zero
  const [totalProfit, setTotalProfit] = useState(0);
  
  const [dailyProfit, setDailyProfit] = useState(0);
  
  // Profit analytics state
  const [profitData, setProfitData] = useState({
    daily: [],   // Array of {date, profit, sales}
    monthly: [], // Array of {month, profit, sales}
    yearly: []   // Array of {year, profit, sales}
  });
  const [profitTimeRange, setProfitTimeRange] = useState('daily'); // 'daily', 'monthly', 'yearly'
  const [analyticsSubTab, setAnalyticsSubTab] = useState('overview'); // 'overview', 'profit'
  
  // Credit Level state
  const [creditLimit, setCreditLimit] = useState(0);
  const [usedCredit, setUsedCredit] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [creditUsagePercentage, setCreditUsagePercentage] = useState(0);
  const [creditTransactions, setCreditTransactions] = useState([]);
  
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
  
  // Refresh inventory when POS tab is opened
  useEffect(() => {
    if (activeTab === 'pos') {
      console.log('🔄 POS tab opened - refreshing inventory...');
      fetchInventoryBundles();
    }
  }, [activeTab]);
  
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
  
  // Enhanced profit calculation using product-specific margin rates
  const updateProfit = (saleAmount, costPrice, bundleName, bundleId = null) => {
    // Find product-specific margin rate
    let marginRate = null;
    
    // Try to find by bundleId first
    if (bundleId) {
      const productRate = productMarginRates.find(p => p.productId === bundleId);
      if (productRate) {
        marginRate = parseFloat(productRate.marginRate || 0);
      }
    }
    
    // If not found by ID, try by name
    if (!marginRate && bundleName) {
      const productRate = productMarginRates.find(p => 
        p.productName?.toLowerCase() === bundleName.toLowerCase()
      );
      if (productRate) {
        marginRate = parseFloat(productRate.marginRate || 0);
      }
    }
    
    // Fallback to retailer margin rate
    if (!marginRate) {
      marginRate = retailerMarginRate;
    }
    
    // Only calculate profits if a margin rate exists
    if (!marginRate || marginRate <= 0) {
      console.log(`⚠️ No margin rate set for ${bundleName} - skipping profit calculation`);
      return;
    }
    
    // Calculate profit based on margin rate
    const profitAmount = (saleAmount * marginRate) / 100;
    const actualCostPrice = saleAmount - profitAmount;
    
    console.log(`💰 Real Profit Calculation (${bundleName}):`);
    console.log(`  Sale Amount: NOK ${saleAmount.toFixed(2)}`);
    console.log(`  Margin Rate: ${marginRate}%`);
    console.log(`  Cost Price: NOK ${actualCostPrice.toFixed(2)}`);
    console.log(`  Profit Amount: NOK ${profitAmount.toFixed(2)}`);
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentYear = new Date().getFullYear().toString();
    
    // Update total profit
    setTotalProfit(prevTotal => {
      const newTotal = prevTotal + profitAmount;
      console.log(`📈 Updated total profit: NOK ${prevTotal.toFixed(2)} → NOK ${newTotal.toFixed(2)}`);
      
      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        totalProfit: newTotal,
        profitMargin: marginRate.toString()
      }));
      
      return newTotal;
    });
    
    // Update daily profit
    setDailyProfit(prevDaily => {
      const newDaily = prevDaily + profitAmount;
      
      setAnalytics(prev => ({
        ...prev,
        dailyProfit: newDaily
      }));
      
      return newDaily;
    });
    
    // Update profit data for analytics graphs
    setProfitData(prev => {
      const newData = { ...prev };
      
      // Update daily data
      const dailyIndex = newData.daily.findIndex(d => d.date === today);
      if (dailyIndex >= 0) {
        newData.daily[dailyIndex].profit += profitAmount;
        newData.daily[dailyIndex].sales += 1;
        newData.daily[dailyIndex].revenue += saleAmount;
      } else {
        newData.daily.push({
          date: today,
          profit: profitAmount,
          sales: 1,
          revenue: saleAmount,
          marginRate: marginRate
        });
      }
      
      // Update monthly data
      const monthlyIndex = newData.monthly.findIndex(m => m.month === currentMonth);
      if (monthlyIndex >= 0) {
        newData.monthly[monthlyIndex].profit += profitAmount;
        newData.monthly[monthlyIndex].sales += 1;
        newData.monthly[monthlyIndex].revenue += saleAmount;
      } else {
        newData.monthly.push({
          month: currentMonth,
          profit: profitAmount,
          sales: 1,
          revenue: saleAmount,
          marginRate: marginRate
        });
      }
      
      // Update yearly data
      const yearlyIndex = newData.yearly.findIndex(y => y.year === currentYear);
      if (yearlyIndex >= 0) {
        newData.yearly[yearlyIndex].profit += profitAmount;
        newData.yearly[yearlyIndex].sales += 1;
        newData.yearly[yearlyIndex].revenue += saleAmount;
      } else {
        newData.yearly.push({
          year: currentYear,
          profit: profitAmount,
          sales: 1,
          revenue: saleAmount,
          marginRate: marginRate
        });
      }
      
      // Keep last 30 days, 12 months, 5 years
      newData.daily = newData.daily.slice(-30);
      newData.monthly = newData.monthly.slice(-12);
      newData.yearly = newData.yearly.slice(-5);
      
      // Save to localStorage
      localStorage.setItem('profitData', JSON.stringify(newData));
      
      return newData;
    });
    
    // Save profit to backend database
    saveProfitToBackend(saleAmount, actualCostPrice, bundleName, bundleId, marginRate);
    
    // Add activity for profit tracking
    addActivity('pos_sale', `Profit earned: NOK ${profitAmount.toFixed(2)} from ${bundleName}`, {
      saleAmount,
      costPrice: actualCostPrice,
      profitAmount,
      bundleName,
      bundleId,
      marginRate,
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

  // Fetch product margin rates when margin tab becomes active
  useEffect(() => {
    if (activeTab === 'margin' && productMarginRates.length === 0) {
      fetchAllProductMarginRates();
    }
  }, [activeTab]);
  
  // Load profit data from localStorage on initialization
  useEffect(() => {
    const savedProfitData = localStorage.getItem('profitData');
    if (savedProfitData) {
      try {
        const parsed = JSON.parse(savedProfitData);
        setProfitData(parsed);
        
        // Calculate total profit from all data
        const totalFromData = parsed.daily.reduce((sum, day) => sum + (day.profit || 0), 0);
        if (totalFromData > 0) {
          setTotalProfit(totalFromData);
          setAnalytics(prev => ({
            ...prev,
            totalProfit: totalFromData
          }));
        }
        
        console.log('📊 Loaded profit data from localStorage:', parsed);
      } catch (error) {
        console.error('Error loading profit data:', error);
      }
    }
    
    // Load credit level
    const savedCredit = localStorage.getItem('creditLevel');
    if (savedCredit) {
      try {
        const parsed = JSON.parse(savedCredit);
        setCreditLimit(parsed.creditLimit || 0);
        setUsedCredit(parsed.usedCredit || 0);
        setAvailableCredit(parsed.availableCredit || 0);
        setCreditUsagePercentage(parsed.creditUsagePercentage || 0);
      } catch (error) {
        console.error('Error loading credit level:', error);
      }
    }
    
    // Fetch credit from server
    fetchCreditLevel();
    
    // Fetch profit data from backend
    fetchProfitDataFromBackend();
  }, []);

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

  const fetchAllProductMarginRates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('📊 No token: Cannot fetch product margin rates');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('📊 Fetching all product margin rates...');
      
      const response = await fetch(`${API_BASE_URL}/retailer/margin-rates/all`, { 
        headers,
        keepalive: false
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.productMarginRates) {
          setProductMarginRates(data.productMarginRates);
          console.log(`📊 Loaded ${data.productMarginRates.length} product margin rates`);
        }
      } else {
        console.log(`📊 Failed to fetch product margin rates: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching product margin rates:', error.message);
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

      console.log('📦 Fetching products from admin stock pool...');
      const response = await fetch(`${API_BASE_URL}/admin/stock/pools`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        signal
      });

      if (response.ok) {
        const stockPools = await response.json();
        console.log('✅ Stock pools response:', stockPools);
        console.log('📦 Raw stock pool data:', JSON.stringify(stockPools, null, 2));
        
        // Transform stock pools into product bundles for POS
        const bundles = (stockPools || [])
          .filter(pool => pool.availableQuantity > 0) // Only show pools with available stock
          .map(pool => {
          console.log('🔍 Processing stock pool:', pool);
          const processed = {
            id: pool.id,
            bundleId: pool.productId || pool.id,
            bundleName: pool.name || 'Unknown Product',
            bundlePrice: parseFloat(pool.price) || 0,
            purchasePrice: parseFloat(pool.price) || 0, // Admin sets the price
            availableQuantity: pool.availableQuantity || 0,
            availablePins: pool.availableQuantity || 0,
            totalPins: pool.totalQuantity || 0,
            encryptedPins: [], // Not needed for POS display
            poolName: pool.name || 'Standard Pool',
            networkProvider: pool.networkProvider || 'Unknown',
            productType: pool.productType || 'Bundle plans',
            stockType: pool.stockType || 'EPIN',
            status: 'ACTIVE'
          };
          console.log('✅ Processed stock pool as bundle:', processed);
          return processed;
        });
        
        console.log('📦 Final processed inventory bundles from stock pool:', bundles);
        setInventoryBundles(bundles);
      } else {
        console.error('❌ Failed to fetch stock pools:', response.status);
        setInventoryBundles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching stock pools:', error);
      setInventoryBundles([]);
    }
  };

  const fetchAvailableEsims = async (signal = null) => {
    if (isDemoMode()) {
      console.log('📱 Demo mode - skipping eSIM fetch');
      setAvailableEsims([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('📱 No token - cannot fetch eSIMs');
        setAvailableEsims([]);
        return;
      }

      console.log('📱 Fetching available eSIMs from stock pool...');
      console.log('   - Network Provider:', selectedOperator);
      
      const params = new URLSearchParams();
      if (selectedOperator && selectedOperator !== 'All Operators') {
        params.append('networkProvider', selectedOperator);
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/stock/esims/available?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        signal
      });

      if (response.ok) {
        const esimProducts = await response.json();
        console.log('✅ eSIM products response:', esimProducts);
        setAvailableEsims(esimProducts);
      } else {
        console.error('❌ Failed to fetch eSIMs:', response.status);
        setAvailableEsims([]);
      }
    } catch (error) {
      console.error('❌ Error fetching eSIMs:', error);
      setAvailableEsims([]);
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

  const fetchCreditLevel = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token - using demo credit data');
        setCreditLimit(900);
        setUsedCredit(829);
        setAvailableCredit(71);
        setCreditUsagePercentage(92.1);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/retailer/credit-level`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCreditLimit(data.creditLimit || 0);
          setUsedCredit(data.usedCredit || 0);
          setAvailableCredit(data.availableCredit || 0);
          setCreditUsagePercentage(data.creditUsagePercentage || 0);
          
          console.log('📊 Credit Level:', {
            limit: data.creditLimit,
            used: data.usedCredit,
            available: data.availableCredit,
            usage: data.creditUsagePercentage
          });
        }
      } else {
        console.log('Using demo credit data');
        setCreditLimit(900);
        setUsedCredit(829);
        setAvailableCredit(71);
        setCreditUsagePercentage(92.1);
      }
    } catch (error) {
      console.error('Error fetching credit level:', error);
      // Set demo data
      setCreditLimit(900);
      setUsedCredit(829);
      setAvailableCredit(71);
      setCreditUsagePercentage(92.1);
    }
  };

  const updateCreditOnSale = (saleAmount) => {
    setUsedCredit(prev => {
      const newUsed = prev + saleAmount;
      const newAvailable = creditLimit - newUsed;
      const newPercentage = (newUsed / creditLimit) * 100;
      
      setAvailableCredit(newAvailable);
      setCreditUsagePercentage(newPercentage);
      
      // Add to credit transactions
      setCreditTransactions(prevTrans => [{
        date: new Date().toISOString(),
        amount: saleAmount,
        type: 'sale',
        balance: newAvailable
      }, ...prevTrans.slice(0, 49)]);
      
      // Save to localStorage
      localStorage.setItem('creditLevel', JSON.stringify({
        creditLimit,
        usedCredit: newUsed,
        availableCredit: newAvailable,
        creditUsagePercentage: newPercentage
      }));
      
      console.log(`💳 Credit updated: Used ${newUsed.toFixed(2)} / ${creditLimit} (${newPercentage.toFixed(1)}%)`);
      
      return newUsed;
    });
  };

  // Save profit to backend database
  const saveProfitToBackend = async (saleAmount, costPrice, bundleName, bundleId = null, marginRate = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token - skipping backend profit save (using localStorage only)');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/retailer/record-profit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          saleAmount,
          costPrice,
          bundleName,
          bundleId: bundleId || '',
          marginRate
        })
      });

      if (response.ok) {
        console.log('✅ Profit saved to database');
      } else {
        console.warn('⚠️ Failed to save profit to backend, using localStorage fallback');
      }
    } catch (error) {
      console.error('❌ Error saving profit to backend:', error);
      console.log('⚠️ Profit saved to localStorage only');
    }
  };

  // Fetch profit data from backend
  const fetchProfitDataFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token - using localStorage profit data');
        return;
      }

      // Fetch all three periods
      const [dailyRes, monthlyRes, yearlyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/retailer/profit/daily`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/retailer/profit/monthly`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/retailer/profit/yearly`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (dailyRes.ok && monthlyRes.ok && yearlyRes.ok) {
        const daily = await dailyRes.json();
        const monthly = await monthlyRes.json();
        const yearly = await yearlyRes.json();

        // Update profitData state with backend data
        setProfitData({
          daily: daily.data || [],
          monthly: monthly.data || [],
          yearly: yearly.data || []
        });

        // Calculate totals from backend data
        const totalProfitFromBackend = yearly.data?.reduce((sum, y) => sum + (y.profit || 0), 0) || 0;
        const todayProfit = daily.data?.find(d => d.date === new Date().toISOString().split('T')[0])?.profit || 0;

        setTotalProfit(totalProfitFromBackend);
        setDailyProfit(todayProfit);

        console.log('✅ Profit data loaded from backend:', {
          daily: daily.data?.length || 0,
          monthly: monthly.data?.length || 0,
          yearly: yearly.data?.length || 0,
          totalProfit: totalProfitFromBackend
        });

        // Also save to localStorage as backup
        localStorage.setItem('profitData', JSON.stringify({
          daily: daily.data || [],
          monthly: monthly.data || [],
          yearly: yearly.data || []
        }));
      } else {
        console.log('⚠️ Backend profit data not available, using localStorage');
      }
    } catch (error) {
      console.error('❌ Error fetching profit from backend:', error);
      console.log('⚠️ Using localStorage profit data as fallback');
    }
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
    if (!selectedBundle || selectedBundle.availableQuantity < saleQuantity) {
      alert(`Please select a valid bundle. Only ${selectedBundle?.availableQuantity || 0} PINs available.`);
      return;
    }

    // Calculate total amount first to check credit
    const totalAmount = selectedBundle.bundlePrice * saleQuantity;

    // Check credit limit before processing sale
    if (availableCredit < totalAmount) {
      alert(
        `❌ Credit Limit Exceeded!\n\n` +
        `Sale Amount: ${totalAmount.toFixed(2)} kr\n` +
        `Available Credit: ${availableCredit.toFixed(2)} kr\n` +
        `Shortage: ${(totalAmount - availableCredit).toFixed(2)} kr\n\n` +
        `You need ${(totalAmount - availableCredit).toFixed(2)} kr more credit to complete this sale.\n` +
        `Please contact the administrator to increase your credit limit.`
      );
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
      const profitPerUnit = salePrice - costPrice;
      const totalProfit = profitPerUnit * saleQuantity;
      const totalAmount = salePrice * saleQuantity;
      
      console.log('💰 POS Sale Calculation:');
      console.log(`  Quantity: ${saleQuantity}`);
      console.log(`  Margin Rate: ${realMarginRate}%`);
      console.log(`  Sale Price per unit: NOK ${salePrice}`);
      console.log(`  Cost Price per unit: NOK ${costPrice.toFixed(2)}`);
      console.log(`  Profit per unit: NOK ${profitPerUnit.toFixed(2)}`);
      console.log(`  Total Profit: NOK ${totalProfit.toFixed(2)}`);
      
      // Real API sale - with offline fallback if backend is unavailable
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
            quantity: saleQuantity,
            customer: 'Walk-in Customer',
            apiUrl: `${API_BASE_URL}/retailer/direct-sale`
          });

          const saleData = {
            bundleId: selectedBundle.bundleId || selectedBundle.id || 'BUNDLE-' + Date.now(),
            bundleName: selectedBundle.bundleName,
            quantity: saleQuantity,
            unitPrice: selectedBundle.bundlePrice,
            totalAmount: totalAmount,
            customerName: 'Walk-in Customer',
            customerPhone: '',
            customerEmail: '',
            saleType: 'DIRECT_SALE'
          };

          console.log('📤 Sending sale data:', saleData);

          // Add timeout to API call
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(`${API_BASE_URL}/retailer/direct-sale`, {
            method: 'POST',
            headers,
            body: JSON.stringify(saleData),
            signal: controller.signal,
            credentials: 'include'
          });

          clearTimeout(timeoutId);
          console.log('📡 Sale response status:', response.status, response.statusText);

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Direct sale successful via API:', result);
            
            // Extract generated PINs from response
            const pins = result.data?.pins || result.pins || result.allocatedPins || [];
            
            console.log('📌 Received PINs from API:', pins);
            
            if (!pins || pins.length === 0) {
              console.error('❌ No PINs received from API, falling back to offline mode');
              throw new Error('No PINs in API response');
            }
            
            // Update local inventory after successful API sale
            setInventoryBundles(prev => {
              const updatedBundles = prev.map(bundle => 
                bundle.id === selectedBundle.id 
                  ? { ...bundle, availableQuantity: Math.max(0, bundle.availableQuantity - saleQuantity) }
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
                  customerSales: prev.customerSales + saleQuantity,
                  totalOrders: prev.totalOrders + 1,
                  totalRevenue: prev.totalRevenue + totalAmount
                }));
                console.log(`📈 API Sale - Analytics updated: +${saleQuantity} customer sales, inventory: ${newTotalUnits}`);
              }, 100);
              
              return updatedBundles;
            });
            
            // Update profit and activity
            updateProfit(totalAmount, costPrice * saleQuantity, selectedBundle.bundleName);
            
            // Update credit level after successful sale
            updateCreditOnSale(totalAmount);
            
            addActivity(
              'pos_sale',
              `Sold ${saleQuantity}x ${selectedBundle.bundleName} - Profit: NOK ${totalProfit.toFixed(2)} (API)`,
              {
                bundleName: selectedBundle.bundleName,
                quantity: saleQuantity,
                saleAmount: totalAmount,
                costPrice: costPrice * saleQuantity,
                profitAmount: totalProfit,
                pins: pins.length || 0,
                customerType: 'walk-in',
                method: 'api'
              }
            );
            
            // Prepare receipt data
            const receipt = {
              saleId: result.data?.saleId || `API-${Date.now()}`,
              bundleName: selectedBundle.bundleName,
              quantity: saleQuantity,
              unitPrice: selectedBundle.bundlePrice,
              totalAmount: totalAmount,
              costPrice: costPrice * saleQuantity,
              profitAmount: totalProfit,
              saleDate: new Date().toLocaleString(),
              pins: pins,
              retailerName: 'EasyTopup.no',
              method: 'API'
            };
            
            setReceiptData(receipt);
            setGeneratedPins(pins);
            setShowPinModal(true);
            setSelectedBundle(null);
            setSaleQuantity(1);
            
            console.log('🎯 API PIN allocation completed successfully');
            return; // Success - exit function
          } else {
            // API failed, fall through to offline mode
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ API sale failed:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
              message: errorData.message,
              details: errorData.details
            });
            console.log('⚠️ Error details:', JSON.stringify(errorData, null, 2));
            console.log('⚠️ Falling back to offline mode');
          }
        } catch (apiError) {
          console.error('❌ API error:', {
            name: apiError.name,
            message: apiError.message,
            stack: apiError.stack
          });
          console.log('⚠️ API error, falling back to offline mode');
          // Fall through to offline mode
        }
      } else {
        console.log('⚠️ No token found, using offline mode');
      }
      
      // Offline mode - generate local PINs
      console.log('🔄 Processing sale in offline mode...');
      
      // Generate offline PINs based on quantity
      const offlinePins = Array.from({ length: saleQuantity }, (_, index) => ({
        pin: `OFF-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        serialNumber: `OFF${Date.now()}${Math.random().toString().substr(2, 3)}-${index + 1}`,
        value: selectedBundle.bundlePrice,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        bundleName: selectedBundle.bundleName,
        status: 'ACTIVE',
        isOffline: true
      }));
      
      // Update local inventory for offline sale
      setInventoryBundles(prev => {
        const updatedBundles = prev.map(bundle => 
          bundle.id === selectedBundle.id 
            ? { ...bundle, availableQuantity: Math.max(0, bundle.availableQuantity - saleQuantity) }
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
            customerSales: prev.customerSales + saleQuantity,
            totalOrders: prev.totalOrders + 1,
            totalRevenue: prev.totalRevenue + totalAmount
          }));
          console.log(`📈 Offline Sale - Analytics updated: +${saleQuantity} customer sales, inventory: ${newTotalUnits}`);
        }, 100);
        
        return updatedBundles;
      });
      
      // Calculate profit amount
      const profitAmount = totalAmount - (costPrice * saleQuantity);
      
      // Update profit and activity
      updateProfit(totalAmount, costPrice * saleQuantity, selectedBundle.bundleName);
      
      // Update credit level after successful sale
      updateCreditOnSale(totalAmount);
      
      addActivity(
        'pos_sale',
        `Sold ${saleQuantity}x ${selectedBundle.bundleName} - Profit: NOK ${profitAmount.toFixed(2)} (Offline)`,
        {
          bundleName: selectedBundle.bundleName,
          quantity: saleQuantity,
          saleAmount: totalAmount,
          costPrice: costPrice * saleQuantity,
          profitAmount: profitAmount,
          pins: saleQuantity,
          customerType: 'walk-in',
          method: 'offline'
        }
      );
      
      // Prepare offline receipt
      const offlineReceipt = {
        saleId: `OFFLINE-${Date.now()}`,
        bundleName: selectedBundle.bundleName,
        quantity: saleQuantity,
        unitPrice: selectedBundle.bundlePrice,
        totalAmount: totalAmount,
        costPrice: costPrice * saleQuantity,
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

  // Helper function to mask PIN for UI display only
  const maskPin = (pin) => {
    if (!pin || pin.length < 8) return pin;
    // Show first 3 and last 3 characters, mask the middle
    return pin.substring(0, 3) + '****' + pin.substring(pin.length - 3);
  };

  // Print receipt function - shows FULL unmasked PINs
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
                id="credit"
                label="Credit Level"
                icon={DollarSign}
                active={activeTab === 'credit'}
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
              <button onClick={() => handleTabChange('credit')} className={`w-full p-3 rounded-xl ${activeTab === 'credit' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <DollarSign size={20} />
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
                {activeTab === 'offers' && 'Offers'}
                {activeTab === 'margin' && 'Margin Rate'}
                {activeTab === 'credit' && 'Credit Level'}
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
                description="Total sales"
              />
              <StatCard
                title="Total Earnings"
                value={`NOK ${totalProfit.toLocaleString('no-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                change={dailyProfit > 0 ? ((dailyProfit / Math.max(totalProfit - dailyProfit, 1)) * 100).toFixed(1) : 0}
                icon={DollarSign}
                color="bg-gradient-to-br from-green-600 to-green-700"
                description={`daily, weekly, monthly`}
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

            {/* Credit Level Status Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="text-yellow-600" size={24} />
                  Credit Level Status
                </h3>
                <button
                  onClick={() => handleTabChange('credit')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  View Details
                </button>
              </div>

              {/* Credit Usage Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">Credit Usage</span>
                  <span className={`font-bold ${
                    creditUsagePercentage > 95 ? 'text-red-600' :
                    creditUsagePercentage > 80 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {creditUsagePercentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="relative w-full h-8 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-lg transition-all duration-700 ease-out ${
                      creditUsagePercentage > 95 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      creditUsagePercentage > 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      creditUsagePercentage > 50 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      'bg-gradient-to-r from-green-400 to-green-600'
                    }`}
                    style={{ width: `${Math.min(creditUsagePercentage, 100)}%` }}
                  ></div>
                </div>

                {/* Credit Details Grid */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-blue-700 font-medium">Limit</div>
                    <div className="text-lg font-bold text-blue-900">{creditLimit.toFixed(0)} kr</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-xs text-orange-700 font-medium">Used</div>
                    <div className="text-lg font-bold text-orange-900">{usedCredit.toFixed(0)} kr</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xs text-green-700 font-medium">Available</div>
                    <div className="text-lg font-bold text-green-900">{availableCredit.toFixed(0)} kr</div>
                  </div>
                </div>

                {/* Warning Message */}
                {creditUsagePercentage > 80 && (
                  <div className={`mt-3 p-3 rounded-lg border-2 ${
                    creditUsagePercentage > 95 
                      ? 'bg-red-50 border-red-300' 
                      : 'bg-yellow-50 border-yellow-300'
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{creditUsagePercentage > 95 ? '⚠️' : '⚡'}</span>
                      <div>
                        <p className={`text-sm font-semibold ${
                          creditUsagePercentage > 95 ? 'text-red-900' : 'text-yellow-900'
                        }`}>
                          {creditUsagePercentage > 95 
                            ? 'Credit Limit Almost Reached!' 
                            : 'High Credit Usage'}
                        </p>
                        <p className={`text-xs mt-1 ${
                          creditUsagePercentage > 95 ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                          {availableCredit <= 0 
                            ? 'Cannot process sales - contact admin to increase limit' 
                            : `Only ${availableCredit.toFixed(2)} kr remaining - contact admin if needed`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="text-blue-600" size={20} />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleTabChange('pos')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group border border-blue-200"
                >
                  <ShoppingCart className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={32} />
                  <span className="text-sm font-medium text-gray-900">Point of Sale</span>
                  <span className="text-xs text-gray-500 mt-1">Sell directly from stock</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
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
                        <p>• Make Point of Sale transactions</p>
                        <p>• Sell products to customers</p>
                        <p>• Navigate between sections</p>
                      </div>
                    </div>
                  )}
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
                    Sell products directly from admin stock pool - sales automatically reduce inventory
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

            {/* Operator Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe2 className="text-blue-600" size={20} />
                Select Operator
              </h4>
              <div className="flex gap-4 flex-wrap">
                {[
                  { name: 'All Operators', icon: '🌐', color: 'from-blue-500 to-indigo-600' },
                  { name: 'Lycamobile', icon: 'https://www.lycamobile.no/wp-content/uploads/2023/06/lyca-logo.svg', color: 'from-red-500 to-pink-600' },
                  { name: 'Mycall', icon: 'https://mycall.no/wp-content/themes/mycall/images/logo.svg', color: 'from-orange-500 to-amber-600' },
                  { name: 'Telia', icon: 'https://www.telia.no/magento_no/static/version1234567890/frontend/Telia/responsive/nb_NO/images/telia-logo.svg', color: 'from-purple-500 to-violet-600' }
                ].map((operator) => (
                  <button
                    key={operator.name}
                    onClick={() => {
                      setSelectedOperator(operator.name);
                      setSelectedBundle(null);
                    }}
                    className={`group relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                      selectedOperator === operator.name
                        ? `bg-gradient-to-r ${operator.color} text-white shadow-xl shadow-${operator.color.split('-')[1]}-500/50`
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {operator.name === 'All Operators' ? (
                        <span className="text-3xl">{operator.icon}</span>
                      ) : (
                        <img 
                          src={operator.icon} 
                          alt={operator.name}
                          className={`h-8 w-auto ${selectedOperator === operator.name ? 'brightness-0 invert' : 'opacity-80 group-hover:opacity-100'}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      )}
                      <span className="hidden text-2xl font-bold" style={{display: 'none'}}>
                        {operator.name === 'Lycamobile' ? '📱' : operator.name === 'Mycall' ? '📞' : '📶'}
                      </span>
                      <span className={`text-sm font-medium ${selectedOperator === operator.name ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                        {operator.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Category Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="text-blue-600" size={20} />
                Select Product Category
              </h4>
              <div className="flex gap-3 flex-wrap">
                {['Topups', 'Bundle plans', 'Data plans', 'Esims'].map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedProductCategory(category);
                      setSelectedBundle(null);
                      setSelectedEsim(null);
                      // Fetch eSIMs if Esims category is selected
                      if (category === 'Esims') {
                        fetchAvailableEsims();
                      }
                    }}
                    className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      selectedProductCategory === category
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Tag className="text-blue-600" size={20} />
                    {selectedOperator} - {selectedProductCategory}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {/* Show eSIMs if Esims category is selected */}
                  {selectedProductCategory === 'Esims' && availableEsims.length > 0 ? (
                    (() => {
                      // Filter eSIMs by selected network provider
                      const filteredEsims = selectedOperator === 'All Operators' 
                        ? availableEsims 
                        : availableEsims.filter(esimProduct => esimProduct.networkProvider === selectedOperator);
                      
                      if (filteredEsims.length === 0) {
                        return (
                          <div className="col-span-2 text-center py-8">
                            <Package size={32} className="text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No {selectedOperator} eSIMs available</p>
                          </div>
                        );
                      }
                      
                      return filteredEsims.map((esimProduct) => (
                      <div key={esimProduct.id} className="col-span-2 space-y-3">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                          <h5 className="font-bold text-gray-900 mb-1">{esimProduct.poolName}</h5>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {esimProduct.networkProvider}
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              NOK {esimProduct.price}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {esimProduct.availableCount} eSIMs available
                          </p>
                        </div>
                        
                        {/* Display individual eSIMs with QR codes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {esimProduct.availableEsims && esimProduct.availableEsims.slice(0, 10).map((esim, idx) => (
                            <div
                              key={esim.itemId || idx}
                              onClick={() => {
                                setSelectedEsim({ ...esim, productInfo: esimProduct });
                                setSelectedBundle(null);
                              }}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                selectedEsim?.itemId === esim.itemId
                                  ? 'border-green-500 bg-green-50 shadow-lg'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              {/* eSIM Details - QR Code Hidden */}
                              <div className="text-left space-y-1">
                                <div className="text-xs font-mono text-gray-600 truncate">
                                  ICCID: {esim.iccid ? esim.iccid.slice(0, 12) + '...' : 'N/A'}
                                </div>
                                {esim.activationCode && (
                                  <div className="text-xs text-blue-600 font-medium truncate">
                                    {esim.activationCode.slice(0, 20)}...
                                  </div>
                                )}
                                <div className="pt-2 border-t border-gray-200">
                                  <span className="text-lg font-bold text-gray-900">
                                    NOK {esimProduct.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                    })()
                  ) : selectedProductCategory !== 'Esims' && inventoryBundles.length > 0 ? (
                    (() => {
                      console.log('🔍 Filtering inventory bundles for POS:');
                      console.log(`   - Selected Operator: "${selectedOperator}"`);
                      console.log(`   - Selected Category: "${selectedProductCategory}"`);
                      console.log(`   - Total bundles: ${inventoryBundles.length}`);
                      
                      const filtered = inventoryBundles.filter((bundle) => {
                        // EXCLUDE eSIM stock type from non-Esims categories
                        if (bundle.stockType === 'ESIM') {
                          console.log(`   🚫 Excluding eSIM: ${bundle.bundleName} (stockType: ESIM)`);
                          return false; // Don't show eSIMs in Bundle plans, Topups, Data plans
                        }
                        
                        // Filter by network provider
                        const matchesOperator = selectedOperator === 'All Operators' 
                          ? true 
                          : bundle.networkProvider === selectedOperator;
                        
                        // Filter by product type
                        const matchesCategory = bundle.productType === selectedProductCategory;
                        
                        console.log(`   📦 Bundle: ${bundle.bundleName}`);
                        console.log(`      - Provider: "${bundle.networkProvider}" (matches: ${matchesOperator})`);
                        console.log(`      - Type: "${bundle.productType}" (matches: ${matchesCategory})`);
                        console.log(`      - Show: ${matchesOperator && matchesCategory}`);
                        
                        // Must match both operator and category
                        return matchesOperator && matchesCategory;
                      });
                      
                      console.log(`   ✅ Filtered results: ${filtered.length} bundles match`);
                      
                      return filtered.map((bundle) => (
                      <div
                        key={bundle.id}
                        onClick={() => setSelectedBundle(bundle)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                          selectedBundle?.id === bundle.id
                            ? 'border-green-500 bg-green-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-left">
                          <div className="text-3xl font-bold text-gray-900 mb-2">
                            NOK{bundle.bundlePrice.toFixed(2)}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            {bundle.bundleName}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {bundle.poolName}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {bundle.networkProvider}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              {bundle.productType}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Available: {bundle.availableQuantity}
                          </div>
                        </div>
                      </div>
                    ));
                    })()
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <Package size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No {selectedProductCategory.toLowerCase()} available</p>
                      <p className="text-sm text-gray-400 mb-4">
                        No {selectedOperator} {selectedProductCategory.toLowerCase()} in admin stock pool
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sale Details - Cart Style */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <ShoppingCart className="text-gray-600" size={20} />
                  <h4 className="text-lg font-semibold text-gray-900">Your Cart</h4>
                </div>
                
                {/* eSIM Cart - Different UI without QR Code */}
                {selectedEsim ? (
                  <div className="space-y-4">
                    {/* eSIM Cart Item - QR Code Hidden */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 mb-1">
                            {selectedEsim.productInfo?.poolName || 'eSIM'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {selectedEsim.productInfo?.networkProvider}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedEsim(null);
                          }}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      {/* eSIM Details - No QR Code Shown */}
                      <div className="space-y-2 text-xs bg-white p-3 rounded-lg">
                        <div className="flex justify-between items-center py-1 border-b border-blue-200">
                          <span className="text-gray-600">ICCID:</span>
                          <span className="font-mono text-gray-900">{selectedEsim.iccid?.slice(0, 15)}...</span>
                        </div>
                        {selectedEsim.activationCode && (
                          <div className="flex justify-between items-center py-1 border-b border-blue-200">
                            <span className="text-gray-600">Activation:</span>
                            <span className="font-mono text-blue-600 text-[10px]">{selectedEsim.activationCode?.slice(0, 18)}...</span>
                          </div>
                        )}
                        {selectedEsim.pin1 && (
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600">PIN 1:</span>
                            <span className="font-mono text-gray-900">{selectedEsim.pin1}</span>
                          </div>
                        )}
                        {selectedEsim.puk1 && (
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600">PUK 1:</span>
                            <span className="font-mono text-gray-900">{selectedEsim.puk1}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 font-medium">Price:</span>
                          <span className="text-2xl font-bold text-green-600">
                            NOK {selectedEsim.productInfo?.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* eSIM Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEsimCustomerForm(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 px-4 rounded-lg font-bold text-base hover:from-blue-600 hover:to-indigo-600 flex items-center justify-center gap-2 shadow-md"
                      >
                        Sell eSIM - NOK {selectedEsim.productInfo?.price}
                      </button>
                    </div>
                  </div>
                ) : selectedBundle ? (
                  <div className="space-y-4">
                    {/* Regular Bundle Cart Item */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            NOK{selectedBundle.bundlePrice.toFixed(2)} 1 mo with {selectedBundle.poolName || '2GB'} Plan
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedBundle(null);
                            setSaleQuantity(1);
                          }}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSaleQuantity(Math.max(1, saleQuantity - 1))}
                            disabled={saleQuantity <= 1}
                            className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{saleQuantity}</span>
                          <button
                            onClick={() => setSaleQuantity(Math.min(selectedBundle.availableQuantity, saleQuantity + 1))}
                            disabled={saleQuantity >= selectedBundle.availableQuantity}
                            className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-base font-bold text-gray-900">
                          NOK{(selectedBundle.bundlePrice * saleQuantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">SUBTOTAL</span>
                        <span className="text-2xl font-bold text-gray-900">
                          NOK{(selectedBundle.bundlePrice * saleQuantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      {/* Print Button - Working */}
                      <button
                        type="button"
                        onClick={handleDirectSale}
                        disabled={saleLoading || !retailerMarginRate}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3.5 px-4 rounded-lg font-bold text-base hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                      >
                        {saleLoading ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Print NOK{(selectedBundle.bundlePrice * saleQuantity).toFixed(2)}
                          </>
                        )}
                      </button>

                      {/* Direct Topup Button - Disabled */}
                      <button
                        type="button"
                        disabled
                        className="w-full bg-red-500 text-white py-3.5 px-4 rounded-lg font-bold text-base opacity-50 cursor-not-allowed"
                      >
                        Direct Topup
                      </button>

                      {/* SMS Button - Disabled */}
                      <button
                        type="button"
                        disabled
                        className="w-full bg-gray-300 text-gray-700 py-3.5 px-4 rounded-lg font-bold text-base opacity-50 cursor-not-allowed"
                      >
                        SMS
                      </button>
                    </div>

                    {!retailerMarginRate && (
                      <div className="mt-3">
                        <p className="text-xs text-amber-600 text-center">
                          ⚠️ Waiting for admin margin rate settings...
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                    <p className="text-sm text-gray-400 mt-2">Select a bundle to add to cart</p>
                  </div>
                )}
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
                          <p className="text-xs text-gray-600 mb-1">PIN Code (Masked for Security)</p>
                          <p className="text-xl font-mono font-bold text-green-600">{maskPin(pin.pin)}</p>
                          <p className="text-xs text-gray-500 mt-1">Full PIN will be shown on printed receipt</p>
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

            {/* eSIM Customer Information Form Modal */}
            {showEsimCustomerForm && selectedEsim && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Customer Information</h3>
                      <button
                        onClick={() => {
                          setShowEsimCustomerForm(false);
                          setEsimCustomerData({ email: '', fullName: '', passportId: '' });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Enter customer details to send eSIM QR code via email
                    </p>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      
                      // Check credit limit before processing eSIM sale
                      const esimPrice = selectedEsim.productInfo?.price || 0;
                      if (availableCredit < esimPrice) {
                        alert(
                          `❌ Credit Limit Exceeded!\n\n` +
                          `eSIM Price: ${esimPrice.toFixed(2)} kr\n` +
                          `Available Credit: ${availableCredit.toFixed(2)} kr\n` +
                          `Shortage: ${(esimPrice - availableCredit).toFixed(2)} kr\n\n` +
                          `You need ${(esimPrice - availableCredit).toFixed(2)} kr more credit to complete this sale.\n` +
                          `Please contact the administrator to increase your credit limit.`
                        );
                        return;
                      }
                      
                      setEsimSaleLoading(true);
                      
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API_BASE_URL}/admin/stock/esims/send-qr`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            itemId: selectedEsim.itemId,
                            iccid: selectedEsim.iccid,
                            customerEmail: esimCustomerData.email,
                            customerName: esimCustomerData.fullName,
                            passportId: esimCustomerData.passportId,
                            poolId: selectedEsim.productInfo.id,
                            price: selectedEsim.productInfo.price
                          })
                        });

                        const result = await response.json();
                        
                        if (response.ok && result.success) {
                          // Update credit level after successful eSIM sale
                          updateCreditOnSale(esimPrice);
                          
                          alert(`✅ eSIM QR code sent successfully to ${esimCustomerData.email}!`);
                          setShowEsimCustomerForm(false);
                          setSelectedEsim(null);
                          setEsimCustomerData({ email: '', fullName: '', passportId: '' });
                          // Refresh eSIM list
                          fetchAvailableEsims();
                        } else {
                          alert('❌ Failed to send eSIM: ' + (result.error || 'Unknown error'));
                        }
                      } catch (error) {
                        console.error('Error sending eSIM:', error);
                        alert('❌ Error: ' + error.message);
                      } finally {
                        setEsimSaleLoading(false);
                      }
                    }}
                    className="p-6 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={esimCustomerData.fullName}
                        onChange={(e) => setEsimCustomerData({ ...esimCustomerData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={esimCustomerData.email}
                        onChange={(e) => setEsimCustomerData({ ...esimCustomerData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="customer@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passport ID / Identity Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={esimCustomerData.passportId}
                        onChange={(e) => setEsimCustomerData({ ...esimCustomerData, passportId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="AB1234567"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-600">eSIM Price:</span>
                        <span className="text-xl font-bold text-green-600">
                          NOK {selectedEsim.productInfo?.price}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={esimSaleLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-lg font-bold hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {esimSaleLoading ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send eSIM QR Code
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Sub-tabs for Analytics */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex space-x-2">
                <button
                  onClick={() => setAnalyticsSubTab('overview')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    analyticsSubTab === 'overview'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setAnalyticsSubTab('profit')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    analyticsSubTab === 'profit'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📊 Profit Analytics
                </button>
              </div>
            </div>

            {/* Overview Sub-tab */}
            {analyticsSubTab === 'overview' && (
              <>
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
              </>
            )}

            {/* Profit Analytics Sub-tab */}
            {analyticsSubTab === 'profit' && (
              <div className="space-y-6">
                {/* Profit Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Total Profit</h4>
                      <DollarSign className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      NOK {totalProfit.toLocaleString('no-NO', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-green-100 text-sm">All-time earnings</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Today's Profit</h4>
                      <TrendingUp className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      NOK {dailyProfit.toLocaleString('no-NO', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-blue-100 text-sm">
                      {profitData.daily.length > 0 ? `${profitData.daily[profitData.daily.length - 1]?.sales || 0} sales` : 'No sales yet'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Avg. Margin</h4>
                      <Award className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {(() => {
                        if (productMarginRates.length > 0) {
                          const avg = productMarginRates.reduce((sum, p) => sum + parseFloat(p.marginRate || 0), 0) / productMarginRates.length;
                          return `${avg.toFixed(1)}%`;
                        }
                        return retailerMarginRate !== null ? `${retailerMarginRate}%` : 'N/A';
                      })()}
                    </div>
                    <p className="text-purple-100 text-sm">
                      {productMarginRates.length > 0 ? `${productMarginRates.length} products` : 'Set by admin'}
                    </p>
                  </div>
                </div>

                {/* Time Range Selector */}
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setProfitTimeRange('daily')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        profitTimeRange === 'daily'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setProfitTimeRange('monthly')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        profitTimeRange === 'monthly'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setProfitTimeRange('yearly')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        profitTimeRange === 'yearly'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>

                {/* Profit Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    {profitTimeRange === 'daily' ? 'Daily' : profitTimeRange === 'monthly' ? 'Monthly' : 'Yearly'} Profit Trends
                  </h4>
                  
                  {(() => {
                    const data = profitData[profitTimeRange];
                    if (data.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No profit data yet</h3>
                          <p className="text-gray-500">Make sales through Point of Sale to see profit analytics</p>
                        </div>
                      );
                    }

                    const maxProfit = Math.max(...data.map(d => d.profit));
                    
                    return (
                      <div className="space-y-4">
                        <div className="grid gap-3">
                          {data.map((item, index) => {
                            const label = profitTimeRange === 'daily' 
                              ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : profitTimeRange === 'monthly'
                              ? new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                              : item.year;
                            
                            const percentage = (item.profit / maxProfit) * 100;
                            
                            return (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="font-medium text-gray-700">{label}</span>
                                  <div className="text-right">
                                    <span className="font-bold text-green-600">NOK {item.profit.toFixed(2)}</span>
                                    <span className="text-gray-500 ml-2">({item.sales} sales)</span>
                                  </div>
                                </div>
                                <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                  <div className="absolute inset-0 flex items-center justify-end pr-3">
                                    <span className="text-xs font-medium text-gray-700">
                                      {item.marginRate ? `${item.marginRate}%` : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary Stats */}
                        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                            <p className="text-xl font-bold text-blue-600">
                              NOK {data.reduce((sum, d) => sum + (d.revenue || 0), 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Total Profit</p>
                            <p className="text-xl font-bold text-green-600">
                              NOK {data.reduce((sum, d) => sum + d.profit, 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                            <p className="text-xl font-bold text-purple-600">
                              {data.reduce((sum, d) => sum + d.sales, 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
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
                Product Margin Rates
              </h3>
              <p className="text-purple-100">
                View all product-specific margin rates set by the admin for your account.
              </p>
            </div>

            {/* Product Margin Rates Table */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="text-purple-600" size={20} />
                Your Product Margin Rates
              </h4>
              
              {productMarginRates.length === 0 ? (
                <div className="text-center py-12">
                  <Award size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">No product margin rates set yet</p>
                  <p className="text-sm text-gray-500">Contact admin to set margin rates for your products</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit on NOK 100</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {productMarginRates.map((product, index) => {
                        const marginRate = parseFloat(product.marginRate || 0);
                        const profitPer100 = marginRate.toFixed(2);
                        const setDate = product.setDate ? new Date(product.setDate).toLocaleDateString() : 'N/A';
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{product.productName || 'Unknown Product'}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{product.poolName || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                                {marginRate}%
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-green-600">NOK {profitPer100}</div>
                              <div className="text-xs text-gray-500">per NOK 100 sale</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {setDate}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {product.setBy || 'Admin'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Overall Margin Summary */}
            {productMarginRates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Total Products</h4>
                    <Package className="text-purple-600" size={24} />
                  </div>
                  <div className="text-4xl font-bold text-purple-600">{productMarginRates.length}</div>
                  <p className="text-sm text-gray-600 mt-2">Products with margin rates</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Average Margin</h4>
                    <Award className="text-green-600" size={24} />
                  </div>
                  <div className="text-4xl font-bold text-green-600">
                    {(productMarginRates.reduce((sum, p) => sum + parseFloat(p.marginRate || 0), 0) / productMarginRates.length).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Across all products</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Highest Margin</h4>
                    <TrendingUp className="text-blue-600" size={24} />
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    {Math.max(...productMarginRates.map(p => parseFloat(p.marginRate || 0))).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Best earning rate</p>
                </div>
              </div>
            )}

            {/* Legacy Single Margin Rate Display (if exists) */}
            {retailerMarginRate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 text-sm">ℹ️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800">Legacy Margin Rate</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      A global margin rate of {retailerMarginRate}% is also set for your account. Product-specific rates take precedence.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Credit Level Tab */}
        {activeTab === 'credit' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign size={40} className="text-white" />
                    <h2 className="text-3xl font-bold">Credit Level Management</h2>
                  </div>
                  <p className="text-yellow-50 text-lg">Monitor your credit usage and transaction history</p>
                </div>
                <div className="hidden lg:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <DollarSign size={48} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Warning Banner - Shows when usage > 95% */}
            {creditUsagePercentage > 95 && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-900 text-lg">Credit Limit Almost Reached!</h4>
                    <p className="text-red-800 mt-1">
                      You have used {creditUsagePercentage.toFixed(1)}% of your credit limit. 
                      {availableCredit <= 0 
                        ? ' You cannot process any more sales until your credit is replenished.' 
                        : ` Only ${availableCredit.toFixed(2)} kr remaining. Contact admin to increase your limit.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Credit High Usage Warning - Shows when usage 80-95% */}
            {creditUsagePercentage > 80 && creditUsagePercentage <= 95 && (
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-900 text-lg">High Credit Usage</h4>
                    <p className="text-yellow-800 mt-1">
                      You have used {creditUsagePercentage.toFixed(1)}% of your credit limit. 
                      Consider contacting admin to request a credit limit increase.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Credit Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Credit Limit */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Credit Limit</h4>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{creditLimit.toFixed(2)} kr</div>
                <p className="text-sm text-gray-600">Maximum allowed credit</p>
              </div>

              {/* Used Credit */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-orange-100 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Used Credit</h4>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-orange-600" size={24} />
                  </div>
                </div>
                <div className="text-4xl font-bold text-orange-600 mb-2">{usedCredit.toFixed(2)} kr</div>
                <p className="text-sm text-gray-600">Total credit consumed</p>
              </div>

              {/* Available Credit */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Available Credit</h4>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="text-green-600" size={24} />
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">{availableCredit.toFixed(2)} kr</div>
                <p className="text-sm text-gray-600">Remaining credit balance</p>
              </div>

              {/* Usage Percentage */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Usage Rate</h4>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <PieChart className="text-purple-600" size={24} />
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-2">{creditUsagePercentage.toFixed(1)}%</div>
                <p className="text-sm text-gray-600">Of total credit limit</p>
              </div>
            </div>

            {/* Visual Credit Usage Progress Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BarChart3 className="text-indigo-600" size={28} />
                Credit Usage Visualization
              </h3>
              
              {/* Large Progress Bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-700">Credit Usage Progress</span>
                  <span className={`font-bold ${
                    creditUsagePercentage > 95 ? 'text-red-600' :
                    creditUsagePercentage > 80 ? 'text-yellow-600' :
                    creditUsagePercentage > 50 ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {creditUsagePercentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="relative w-full h-12 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      creditUsagePercentage > 95 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      creditUsagePercentage > 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      creditUsagePercentage > 50 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      'bg-gradient-to-r from-green-400 to-green-600'
                    } shadow-lg`}
                    style={{ width: `${Math.min(creditUsagePercentage, 100)}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                      {usedCredit.toFixed(2)} kr / {creditLimit.toFixed(2)} kr
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      creditUsagePercentage > 95 ? 'bg-red-500 animate-pulse' :
                      creditUsagePercentage > 80 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <span className="text-gray-700 font-medium">
                      {creditUsagePercentage > 95 ? 'Critical - Limit Almost Reached' :
                       creditUsagePercentage > 80 ? 'Warning - High Usage' :
                       creditUsagePercentage > 50 ? 'Moderate Usage' :
                       'Healthy - Good Balance'}
                    </span>
                  </div>
                  <span className="text-gray-600">
                    {availableCredit.toFixed(2)} kr remaining
                  </span>
                </div>
              </div>

              {/* Credit Usage Breakdown */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="text-sm text-blue-700 font-medium mb-1">Limit Set By Admin</div>
                  <div className="text-2xl font-bold text-blue-900">{creditLimit.toFixed(2)} kr</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                  <div className="text-sm text-orange-700 font-medium mb-1">Credit Consumed</div>
                  <div className="text-2xl font-bold text-orange-900">{usedCredit.toFixed(2)} kr</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="text-sm text-green-700 font-medium mb-1">Remaining Balance</div>
                  <div className="text-2xl font-bold text-green-900">{availableCredit.toFixed(2)} kr</div>
                </div>
              </div>
            </div>

            {/* Credit Transaction History */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <BarChart3 size={28} />
                  Credit Transaction History
                </h3>
                <p className="text-indigo-100 mt-2">Track all credit usage from your sales activities</p>
              </div>

              <div className="p-6">
                {creditTransactions && creditTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Date & Time</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Transaction Type</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-700">Amount</th>
                          <th className="text-right py-4 px-4 font-semibold text-gray-700">Balance After</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditTransactions.map((transaction, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 text-gray-900">
                              {new Date(transaction.date).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                transaction.type === 'sale' ? 'bg-orange-100 text-orange-800' :
                                transaction.type === 'refund' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {transaction.type === 'sale' ? '📤 Sale' :
                                 transaction.type === 'refund' ? '📥 Refund' :
                                 '💰 Credit Added'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`font-bold ${
                                transaction.type === 'sale' ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {transaction.type === 'sale' ? '-' : '+'}{transaction.amount.toFixed(2)} kr
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right font-semibold text-gray-900">
                              {transaction.balanceAfter.toFixed(2)} kr
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                transaction.balanceAfter < creditLimit * 0.2 ? 'bg-red-100 text-red-800' :
                                transaction.balanceAfter < creditLimit * 0.5 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {transaction.balanceAfter < creditLimit * 0.2 ? 'Low Credit' :
                                 transaction.balanceAfter < creditLimit * 0.5 ? 'Medium' :
                                 'Healthy'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="text-gray-400" size={48} />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">No Transactions Yet</h4>
                    <p className="text-gray-500">
                      Credit transactions will appear here as you make sales
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h4 className="font-bold text-blue-900 text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                About Credit Levels
              </h4>
              <div className="space-y-2 text-blue-800">
                <p>• Your credit limit is set by the administrator and determines how much you can sell on credit</p>
                <p>• Each sale reduces your available credit by the sale amount</p>
                <p>• When your credit limit is reached, you won't be able to process new sales</p>
                <p>• Contact the administrator to request a credit limit increase</p>
                <p>• Monitor your usage regularly to avoid disruptions in your business operations</p>
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
