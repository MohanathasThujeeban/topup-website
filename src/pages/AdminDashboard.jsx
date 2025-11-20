import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe2, MapPin, BarChart3, Languages, CreditCard, Users, Download, Filter,
  Shield, UserCheck, UserX, Building, Package, DollarSign, TrendingUp,
  Clock, AlertCircle, CheckCircle, XCircle, Eye, Edit, Trash2, Plus,
  Search, RefreshCw, Bell, Settings, Upload, FileText, Target,
  MessageCircle, Mail, Phone, Calendar, User, Activity, Award,
  PieChart, LineChart, ShoppingCart, Percent, Database, Zap, LogOut, Box, Menu, X,
  QrCode, Share2, Copy, Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLoadingScreen from '../components/AdminLoadingScreen';
import StockManagement from '../components/StockManagement';
import PromotionCampaignManager from '../components/PromotionCampaignManager';
import RetailerCreditManagement from '../components/RetailerCreditManagement';
import EsimApprovals from '../components/EsimApprovals';
import { QRCodeSVG } from 'qrcode.react';

// API Base URL - should match AuthContext
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function AdminDashboard() {
  console.log('🎯 AdminDashboard component mounted - Code timestamp:', new Date().toISOString());
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [businessUsers, setBusinessUsers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [stockBundles, setStockBundles] = useState([]); // CSV uploaded bundles (EPIN only)
  const [esimBundles, setEsimBundles] = useState([]); // CSV uploaded eSIM bundles
  const [selectedEsim, setSelectedEsim] = useState(null); // For QR code modal
  const [showQrModal, setShowQrModal] = useState(false);
  const qrCodeRef = useRef(null);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'offline'
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar state
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(null); // For price filtering
  
  // User management modals
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  
  // Edit user form state
  const [editUserData, setEditUserData] = useState({
    email: '',
    mobileNumber: ''
  });
  const [updating, setUpdating] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    console.log('🎯 useEffect triggered - calling fetchAllData()');
    try {
      fetchAllData();
    } catch (err) {
      console.error('❌ Error in useEffect calling fetchAllData:', err);
    }
    
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, stopping loading state');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(loadingTimeout);
  }, []);

  // Debug: Log bundles state changes
  useEffect(() => {
    console.log('🔄 Bundles state changed:', {
      length: bundles?.length,
      isArray: Array.isArray(bundles),
      bundles: bundles
    });
  }, [bundles]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/bundles/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Analytics response:', result);
        
        if (result.success && result.data) {
          setAnalytics(prevAnalytics => ({
            ...prevAnalytics,
            totalUsers: result.data.totalUsers || 0,
            activeUsers: result.data.activeUsers || 0,
            pendingApprovals: result.data.pendingApprovals || 0,
            totalRevenue: result.data.totalRevenue || 0,
            monthlyRevenue: result.data.monthlyRevenue || 0,
            dailyRevenue: result.data.dailyRevenue || 0,
            monthlyGrowth: result.data.revenueGrowth || 0,
            // Keep existing mock data for other fields until we implement them
            topProducts: prevAnalytics.topProducts || [],
            totalOrders: prevAnalytics.totalOrders || 0,
            conversionRate: prevAnalytics.conversionRate || 0,
            activeProducts: prevAnalytics.activeProducts || 0
          }));
        }
      } else {
        console.error('Failed to fetch analytics:', response.status);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchAllData = async () => {
    console.log('🔄 ==== fetchAllData() STARTED ====');
    console.log('🔄 Current bundles state before fetch:', bundles?.length || 0);
    try {
      setLoading(true);
      setConnectionStatus('connecting');
      
      console.log('Loading admin dashboard with real data from backend...');
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log('Authenticating admin request with token:', token ? 'Token present' : 'No token found');
      
      // Test backend connection first
      let backendConnected = false;
      console.log('🔍 Testing backend connection...');
      try {
        const testResponse = await fetch(`${API_BASE_URL}/admin/bundles`, { headers });
        console.log('✅ Backend connection test response status:', testResponse.status);
        backendConnected = testResponse.ok || testResponse.status === 401; // 401 means server is running but auth issue
        
        if (testResponse.status === 401) {
          console.warn('⚠️ Authentication failed - token may be invalid or expired');
        }
      } catch (err) {
        console.log('❌ Backend connection test failed:', err);
        backendConnected = false;
      }
      
      console.log('🔍 Backend connected:', backendConnected);
      
      if (!backendConnected) {
        setConnectionStatus('offline');
        console.log('❌ Backend is offline, using empty data');
        setUsers([]);
        setBusinessUsers([]);
        setEnquiries([]);
        setBundles([]); // Set empty bundles when offline
        setAnalytics({
          totalUsers: 0,
          activeUsers: 0,
          pendingApprovals: 0,
          totalRevenue: 0,
          monthlyGrowth: 0,
          topProducts: [],
          dailyRevenue: 0,
          totalOrders: 0,
          conversionRate: 0,
          activeProducts: 0,
          dailyRevenueGrowth: 0,
          orderGrowth: 0,
          conversionGrowth: 0,
          revenueByUserType: null,
          salesPerformance: null
        });
        console.log('❌ Early return due to no backend connection');
        return;
      }
      
      console.log('✅ Backend connected! Proceeding to fetch data...');
      setConnectionStatus('connected');
      
      // Fetch real data from backend APIs
      console.log('🚀 Starting to fetch all backend data...');
      const [usersResponse, businessResponse, enquiriesResponse, analyticsResponse, bundlesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, { headers }).catch(err => {
          console.log('❌ Users API failed:', err);
          return { ok: false };
        }),
        fetch(`${API_BASE_URL}/admin/business-registrations`, { headers }).catch(err => {
          console.log('❌ Business API failed:', err);
          return { ok: false };
        }),
        fetch(`${API_BASE_URL}/admin/enquiries`, { headers }).catch(err => {
          console.log('❌ Enquiries API failed:', err);
          return { ok: false };
        }),
        fetch(`${API_BASE_URL}/admin/bundles/statistics`, { headers }).catch(err => {
          console.log('❌ Analytics API failed:', err);
          return { ok: false };
        }),
        fetch(`${API_BASE_URL}/admin/bundles`, { headers }).catch(err => {
          console.log('❌ Bundles API failed:', err.message || err);
          return { ok: false, status: 0 };
        })
      ]);

      console.log('📡 API Responses received:', {
        users: usersResponse.ok,
        business: businessResponse.ok,
        enquiries: enquiriesResponse.ok,
        analytics: analyticsResponse.ok,
        bundles: bundlesResponse.ok
      });

      // Process users data
      if (usersResponse.ok) {
        const usersResponse_data = await usersResponse.json();
        console.log('Users data received:', usersResponse_data);
        
        // Handle different response structures
        if (usersResponse_data.users) {
          // Direct 'users' field
          setUsers(Array.isArray(usersResponse_data.users) ? usersResponse_data.users : []);
        } else if (usersResponse_data.data && usersResponse_data.data.users) {
          // Nested in 'data.users'
          setUsers(Array.isArray(usersResponse_data.data.users) ? usersResponse_data.data.users : []);
        } else if (usersResponse_data.success && usersResponse_data.data && usersResponse_data.data.users) {
          // Nested in 'success.data.users'
          setUsers(Array.isArray(usersResponse_data.data.users) ? usersResponse_data.data.users : []);
        } else if (Array.isArray(usersResponse_data)) {
          // Direct array
          setUsers(usersResponse_data);
        } else {
          console.warn('Unexpected users response structure:', usersResponse_data);
          setUsers([]);
        }
      } else {
        const status = usersResponse.status;
        if (status === 404) {
          console.log('Users endpoint not found (404) - admin user management endpoint may not be implemented yet');
        } else {
          console.log(`Failed to fetch users (status: ${status}), using empty array`);
        }
        setUsers([]);
      }

      // Process business registrations data
      if (businessResponse.ok) {
        const businessResponse_data = await businessResponse.json();
        console.log('Business data received:', businessResponse_data);
        if (businessResponse_data.success && businessResponse_data.data) {
          setBusinessUsers(Array.isArray(businessResponse_data.data) ? businessResponse_data.data : []);
        } else {
          setBusinessUsers([]);
        }
      } else {
        console.log('Failed to fetch business registrations, using empty array');
        setBusinessUsers([]);
      }

      // Process enquiries data
      if (enquiriesResponse.ok) {
        const enquiriesResponse_data = await enquiriesResponse.json();
        console.log('Enquiries data received:', enquiriesResponse_data);
        if (enquiriesResponse_data.success && enquiriesResponse_data.data && enquiriesResponse_data.data.enquiries) {
          // Filter out mock/hardcoded data
          const realEnquiries = enquiriesResponse_data.data.enquiries.filter(enquiry => {
            // Filter out obvious mock data patterns
            const isMockData = 
              enquiry.id?.toString().startsWith('ENQ00') ||
              enquiry.customerEmail?.includes('example.com') ||
              enquiry.customerName === 'John Doe' ||
              enquiry.customerName === 'Tech Solutions AS' ||
              enquiry.subject?.includes('eSIM Activation Issue') ||
              enquiry.subject?.includes('Bulk Order Support');
            
            return !isMockData;
          });
          
          setEnquiries(realEnquiries);
          console.log(`Filtered enquiries: ${enquiriesResponse_data.data.enquiries.length} total, ${realEnquiries.length} real enquiries`);
        } else {
          setEnquiries([]);
        }
      } else {
        console.log('Failed to fetch enquiries, using empty array');
        setEnquiries([]);
      }

      // Process analytics data
      if (analyticsResponse.ok) {
        const analyticsResponse_data = await analyticsResponse.json();
        console.log('Analytics data received:', analyticsResponse_data);
        if (analyticsResponse_data.success && analyticsResponse_data.data) {
          setAnalytics(analyticsResponse_data.data);
        } else {
          setAnalytics({
            totalUsers: 0,
            activeUsers: 0,
            pendingApprovals: 0,
            totalRevenue: 0,
            monthlyGrowth: 0,
            topProducts: [],
            dailyRevenue: 0,
            totalOrders: 0,
            conversionRate: 0,
            activeProducts: 0,
            dailyRevenueGrowth: 0,
            orderGrowth: 0,
            conversionGrowth: 0,
            revenueByUserType: null,
            salesPerformance: null
          });
        }
      } else {
        console.log('Failed to fetch analytics, using empty object');
        setAnalytics({
          totalUsers: 0,
          activeUsers: 0,
          pendingApprovals: 0,
          totalRevenue: 0,
          monthlyGrowth: 0,
          topProducts: [],
          dailyRevenue: 0,
          totalOrders: 0,
          conversionRate: 0,
          activeProducts: 0,
          dailyRevenueGrowth: 0,
          orderGrowth: 0,
          conversionGrowth: 0,
          revenueByUserType: null,
          salesPerformance: null
        });
      }

      // Process bundles data
      console.log('🔍 Processing bundles response...');
      console.log('🔍 bundlesResponse:', bundlesResponse);
      console.log('🔍 bundlesResponse.ok:', bundlesResponse.ok);
      console.log('🔍 bundlesResponse.status:', bundlesResponse.status);
      
      if (bundlesResponse.ok) {
        console.log('✅ Bundles response is OK, parsing JSON...');
        const bundlesData = await bundlesResponse.json();
        console.log('📦 Bundles API Response - Status: OK');
        console.log('📦 Bundles data received:', bundlesData);
        console.log('📦 Bundles data type:', typeof bundlesData);
        console.log('📦 Bundles data keys:', bundlesData ? Object.keys(bundlesData) : 'null');
        
        if (bundlesData.bundles) {
          // Server returns bundles in 'bundles' field
          const bundlesArray = Array.isArray(bundlesData.bundles) ? bundlesData.bundles : [];
          console.log('✅ Setting bundles from bundles field:', bundlesArray.length, 'items');
          console.log('📦 Bundle items:', bundlesArray);
          setBundles(bundlesArray);
        } else if (bundlesData.data) {
          // Fallback to 'data' field
          const bundlesArray = Array.isArray(bundlesData.data) ? bundlesData.data : [];
          console.log('✅ Setting bundles from data field:', bundlesArray.length, 'items');
          console.log('📦 Bundle items:', bundlesArray);
          setBundles(bundlesArray);
        } else if (Array.isArray(bundlesData)) {
          // Direct array response
          console.log('✅ Setting bundles from direct array:', bundlesData.length, 'items');
          console.log('📦 Bundle items:', bundlesData);
          setBundles(bundlesData);
        } else {
          console.warn('⚠️ Unexpected bundles response structure, setting empty array');
          console.warn('⚠️ Response structure:', JSON.stringify(bundlesData, null, 2));
          console.warn('⚠️ Setting mock data instead...');
          setBundles([
            {
              id: '1',
              name: 'Lycamobile 5GB ePIN',
              description: 'Works for all Lycamobile Norway SIMs',
              productType: 'EPIN',
              category: 'NORWAY',
              basePrice: 99,
              retailerCommissionPercentage: 30,
              stockQuantity: 150,
              soldQuantity: 45,
              status: 'ACTIVE',
              createdDate: new Date('2024-10-01'),
              lastModifiedDate: new Date('2024-10-20')
            },
            {
              id: '2',
              name: 'Nordic Data Bundle 10GB',
              description: 'High-speed data for Nordic countries',
              productType: 'BUNDLE',
              category: 'NORDIC',
              basePrice: 199,
              retailerCommissionPercentage: 25,
              stockQuantity: 80,
              soldQuantity: 28,
              status: 'ACTIVE',
              createdDate: new Date('2024-09-15'),
              lastModifiedDate: new Date('2024-10-18')
            },
            {
              id: '3',
              name: 'Europe Travel eSIM 15GB',
              description: 'Perfect for European travel',
              productType: 'ESIM',
              category: 'EUROPE',
              basePrice: 349,
              retailerCommissionPercentage: 35,
              stockQuantity: 200,
              soldQuantity: 72,
              status: 'ACTIVE',
              createdDate: new Date('2024-08-20'),
              lastModifiedDate: new Date('2024-10-22')
            }
          ]);
        }
      } else {
        console.log('❌ Failed to fetch bundles, status:', bundlesResponse.status);
        console.log('❌ Using mock data for demonstration');
        // Set mock data when backend fails
        setBundles([
          {
            id: '1',
            name: 'Lycamobile 5GB ePIN',
            description: 'Works for all Lycamobile Norway SIMs',
            productType: 'EPIN',
            category: 'NORWAY',
            basePrice: 99,
            retailerCommissionPercentage: 30,
            stockQuantity: 150,
            soldQuantity: 45,
            status: 'ACTIVE',
            createdDate: new Date('2024-10-01'),
            lastModifiedDate: new Date('2024-10-20')
          },
          {
            id: '2',
            name: 'Nordic Data Bundle 10GB',
            description: 'High-speed data for Nordic countries',
            productType: 'BUNDLE',
            category: 'NORDIC',
            basePrice: 199,
            retailerCommissionPercentage: 25,
            stockQuantity: 80,
            soldQuantity: 28,
            status: 'ACTIVE',
            createdDate: new Date('2024-09-15'),
            lastModifiedDate: new Date('2024-10-18')
          },
          {
            id: '3',
            name: 'Europe Travel eSIM 15GB',
            description: 'Perfect for European travel',
            productType: 'ESIM',
            category: 'EUROPE',
            basePrice: 349,
            retailerCommissionPercentage: 35,
            stockQuantity: 200,
            soldQuantity: 72,
            status: 'ACTIVE',
            createdDate: new Date('2024-08-20'),
            lastModifiedDate: new Date('2024-10-22')
          }
        ]);
      }

      console.log('Real data loaded successfully');
      
      // Fetch real analytics data from backend
      fetchAnalytics();
      
      // Fetch stock bundles (CSV uploaded bundles)
      fetchStockBundles();

    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionStatus('offline');
      // Set empty data on error
      setUsers([]);
      setBusinessUsers([]);
      setEnquiries([]);
      setBundles([
        {
          id: '1',
          name: 'Lycamobile 5GB ePIN',
          description: 'Works for all Lycamobile Norway SIMs. PIN delivered instantly.',
          productType: 'EPIN',
          category: 'NORWAY',
          basePrice: 99,
          retailerCommissionPercentage: 30,
          stockQuantity: 150,
          soldQuantity: 45,
          status: 'ACTIVE',
          createdDate: new Date('2024-10-01'),
          lastModifiedDate: new Date('2024-10-20')
        },
        {
          id: '2',
          name: 'Nordic Data Bundle 10GB',
          description: 'High-speed data for Nordic countries. Instant activation.',
          productType: 'BUNDLE',
          category: 'NORDIC',
          basePrice: 199,
          retailerCommissionPercentage: 25,
          stockQuantity: 80,
          soldQuantity: 28,
          status: 'ACTIVE',
          createdDate: new Date('2024-09-15'),
          lastModifiedDate: new Date('2024-10-18')
        },
        {
          id: '3',
          name: 'Europe Travel eSIM 15GB',
          description: 'Perfect for European travel. Multiple carrier support.',
          productType: 'ESIM',
          category: 'EUROPE',
          basePrice: 349,
          retailerCommissionPercentage: 35,
          stockQuantity: 200,
          soldQuantity: 72,
          status: 'ACTIVE',
          createdDate: new Date('2024-08-20'),
          lastModifiedDate: new Date('2024-10-22')
        },
        {
          id: '4',
          name: 'Global Voice & Data Plan',
          description: 'Worldwide coverage with voice and data. Premium service.',
          productType: 'BUNDLE',
          category: 'GLOBAL',
          basePrice: 599,
          retailerCommissionPercentage: 40,
          stockQuantity: 50,
          soldQuantity: 12,
          status: 'ACTIVE',
          createdDate: new Date('2024-09-30'),
          lastModifiedDate: new Date('2024-10-25')
        },
        {
          id: '5',
          name: 'Norway Unlimited Voice',
          description: 'Unlimited calls within Norway. Draft version for testing.',
          productType: 'ADDON',
          category: 'NORWAY',
          basePrice: 149,
          retailerCommissionPercentage: 20,
          stockQuantity: 0,
          soldQuantity: 0,
          status: 'DRAFT',
          createdDate: new Date('2024-10-24'),
          lastModifiedDate: new Date('2024-10-24')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stock bundles (CSV uploaded PIN bundles)
  const fetchStockBundles = async () => {
    console.log('🚀 fetchStockBundles() CALLED - Starting to fetch bundles');
    try {
      const token = localStorage.getItem('token');
      console.log('📡 Making request to:', `${API_BASE_URL}/admin/stock/pools/bundles`);
      const response = await fetch(`${API_BASE_URL}/admin/stock/pools/bundles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Response status:', response.status);
      if (response.ok) {
        const pools = await response.json();
        console.log('✅ Stock pools fetched successfully:', pools);
        
        // Now fetch individual items for each pool
        const allItems = [];
        for (const pool of pools) {
          console.log(`📦 Fetching items for pool: ${pool.id} (${pool.bundleName})`);
          try {
            const itemsResponse = await fetch(`${API_BASE_URL}/admin/stock/pools/${pool.id}/items/decrypted`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (itemsResponse.ok) {
              const itemsData = await itemsResponse.json();
              console.log(`✅ Fetched ${itemsData.items?.length || 0} items for pool ${pool.bundleName}`);
              
              // Add pool info to each item and flatten
              if (itemsData.items && Array.isArray(itemsData.items)) {
                itemsData.items.forEach(item => {
                  allItems.push({
                    ...item,
                    poolId: pool.id,
                    poolName: pool.bundleName,
                    csvFileName: pool.csvFileName,
                    stockType: pool.stockType,
                    productId: item.productId || pool.productId,
                    notes: item.notes || pool.notes || itemsData.notes
                  });
                });
              }
            }
          } catch (err) {
            console.error(`❌ Error fetching items for pool ${pool.id}:`, err);
          }
        }
        
        console.log(`📦 Total items fetched: ${allItems.length}`);
        console.log('📦 Setting stockBundles state with:', allItems);
        
        // Separate EPIN and ESIM items
        const epinItems = allItems.filter(item => item.stockType === 'EPIN' || item.stockType === 'SERVICE_PIN');
        const esimItems = allItems.filter(item => item.stockType === 'ESIM');
        
        console.log(`📦 EPIN items: ${epinItems.length}`);
        console.log(`📦 ESIM items: ${esimItems.length}`);
        
        setStockBundles(epinItems);
        setEsimBundles(esimItems);
      } else {
        console.error('❌ Failed to fetch stock bundles:', response.status);
        setStockBundles([]);
        setEsimBundles([]);
      }
    } catch (error) {
      console.error('💥 Error fetching stock bundles:', error);
      setStockBundles([]);
      setEsimBundles([]);
    }
  };

  // Delete individual PIN item from Bundle Management
  const handleDeleteItem = async (poolId, itemId, itemData) => {
    if (!confirm(`Are you sure you want to delete PIN ${itemData}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/stock/pools/${poolId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('PIN deleted successfully!');
        // Refresh the bundle data
        fetchStockBundles();
      } else {
        const error = await response.json();
        alert(`Failed to delete PIN: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting PIN:', error);
      alert('Failed to delete PIN');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      console.log('Approving user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          verifyEmail: true, // Explicitly request email verification on approval
          approvalReason: 'Admin approved business registration'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('User approval result:', result);
        
        if (result.success) {
          console.log('✅ User approved successfully - email should be verified');
          // Show success message (you can add toast notification here)
          alert('Business registration approved successfully! Confirmation email sent to user.');
        }
        
        // Refresh data to show updated status
        fetchAllData();
      } else {
        const error = await response.json();
        console.error('Approval failed:', error);
        alert('Failed to approve user: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user: ' + error.message);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      console.log('Rejecting user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rejectionReason: 'Admin rejected business registration'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('User rejection result:', result);
        
        if (result.success) {
          console.log('❌ User rejected successfully');
          alert('Business registration rejected. Notification email sent to user.');
        }
        
        // Refresh data to show updated status
        fetchAllData();
      } else {
        const error = await response.json();
        console.error('Rejection failed:', error);
        alert('Failed to reject user: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user: ' + error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // User Management Handlers
  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setLoadingUserDetails(true);
    setShowUserDetailsModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserDetails(result.data);
        }
      } else {
        console.error('Failed to fetch user details');
        alert('Failed to load user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Error loading user details');
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserData({
      email: user.email || '',
      mobileNumber: user.mobileNumber || ''
    });
    setShowEditUserModal(true);
  };

  const handleDeleteUserClick = (user) => {
    setSelectedUser(user);
    setShowDeleteUserModal(true);
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Account suspended by admin'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('User suspended successfully');
          setShowEditUserModal(false);
          fetchAllData(); // Refresh users list
        }
      } else {
        alert('Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Error suspending user');
    }
  };

  const handleActivateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('User activated successfully');
          setShowEditUserModal(false);
          fetchAllData(); // Refresh users list
        }
      } else {
        alert('Failed to activate user');
      }
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Error activating user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUserData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('User updated successfully');
          setShowEditUserModal(false);
          fetchAllData(); // Refresh users list
        }
      } else {
        const error = await response.json();
        alert('Failed to update user: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('User deleted successfully');
          setShowDeleteUserModal(false);
          fetchAllData(); // Refresh users list
        }
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  // Helper functions to calculate bundle statistics
  const getTotalBundles = () => {
    if (!bundles || !Array.isArray(bundles)) {
      console.log('getTotalBundles: bundles is not an array', bundles);
      // Fallback to stockBundles count if regular bundles are empty
      if (stockBundles && Array.isArray(stockBundles)) {
        console.log('getTotalBundles: Using stockBundles count instead:', stockBundles.length);
        return stockBundles.length;
      }
      return 0;
    }
    if (bundles.length === 0 && stockBundles && Array.isArray(stockBundles) && stockBundles.length > 0) {
      console.log('getTotalBundles: Bundles empty, using stockBundles:', stockBundles.length);
      return stockBundles.length;
    }
    console.log('getTotalBundles: Counting bundles', bundles.length);
    return bundles.length;
  };

  const getActiveBundles = () => {
    if (!bundles || !Array.isArray(bundles)) {
      console.log('getActiveBundles: bundles is not an array', bundles);
      // Fallback to available stockBundles count if regular bundles are empty
      if (stockBundles && Array.isArray(stockBundles)) {
        const availableCount = stockBundles.filter(item => item.status === 'AVAILABLE').length;
        console.log('getActiveBundles: Using available stockBundles count instead:', availableCount);
        return availableCount;
      }
      return 0;
    }
    if (bundles.length === 0 && stockBundles && Array.isArray(stockBundles) && stockBundles.length > 0) {
      const availableCount = stockBundles.filter(item => item.status === 'AVAILABLE').length;
      console.log('getActiveBundles: Bundles empty, using available stockBundles:', availableCount);
      return availableCount;
    }
    const activeCount = bundles.filter(b => {
      const isActive = b.status === 'ACTIVE';
      console.log(`Bundle ${b.name || b.id}: status=${b.status}, isActive=${isActive}`);
      return isActive;
    }).length;
    console.log('getActiveBundles: Active bundles count', activeCount);
    return activeCount;
  };

  const getTotalRevenue = () => {
    if (!bundles || !Array.isArray(bundles) || bundles.length === 0) {
      // Calculate from stockBundles if regular bundles are empty
      if (stockBundles && Array.isArray(stockBundles)) {
        return stockBundles.reduce((sum, item) => {
          const price = parseFloat(item.price) || 0;
          // Count as revenue if status is ASSIGNED or USED
          if (item.status === 'ASSIGNED' || item.status === 'USED') {
            return sum + price;
          }
          return sum;
        }, 0);
      }
      return 0;
    }
    return bundles.reduce((sum, b) => {
      const revenue = (b.basePrice || 0) * (b.soldQuantity || 0);
      return sum + revenue;
    }, 0);
  };

  const getTotalUnitsSold = () => {
    if (!bundles || !Array.isArray(bundles) || bundles.length === 0) {
      // Count sold stockBundles if regular bundles are empty
      if (stockBundles && Array.isArray(stockBundles)) {
        return stockBundles.filter(item => item.status === 'ASSIGNED' || item.status === 'USED').length;
      }
      return 0;
    }
    return bundles.reduce((sum, b) => sum + (b.soldQuantity || 0), 0);
  };

  // QR Code Functions
  const generateEsimQrData = (esim) => {
    // Generate URL for eSIM activation
    const activationUrl = `${window.location.origin}/esim/activate?code=${esim.itemData}&serial=${esim.serialNumber}`;
    return activationUrl;
  };

  const handleViewQrCode = (esim) => {
    setSelectedEsim(esim);
    setShowQrModal(true);
  };

  const handleDownloadQrCode = async () => {
    if (!qrCodeRef.current) return;
    
    try {
      const svg = qrCodeRef.current.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 512;
      canvas.height = 512;
      
      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `esim-${selectedEsim.itemData}-qrcode.png`;
          link.click();
          URL.revokeObjectURL(url);
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code');
    }
  };

  const handleCopyQrUrl = () => {
    if (!selectedEsim) return;
    const url = generateEsimQrData(selectedEsim);
    navigator.clipboard.writeText(url);
    alert('eSIM activation URL copied to clipboard!');
  };

  const handleShareEsim = async () => {
    if (!selectedEsim) return;
    
    const url = generateEsimQrData(selectedEsim);
    const shareText = `eSIM Activation\n\neSIM Code: ${selectedEsim.itemData}\nSerial: ${selectedEsim.serialNumber}\n\nActivation URL: ${url}\n\nScan the QR code or visit the URL to activate your eSIM.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'eSIM Activation',
          text: shareText,
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('eSIM details copied to clipboard!');
    }
  };

  const handleSendEsimEmail = async () => {
    if (!selectedEsim) return;
    
    const url = generateEsimQrData(selectedEsim);
    const subject = encodeURIComponent('Your eSIM Activation Details');
    const body = encodeURIComponent(
      `Hello,\n\nHere are your eSIM activation details:\n\n` +
      `eSIM Code: ${selectedEsim.itemData}\n` +
      `Serial Number: ${selectedEsim.serialNumber}\n` +
      `Pool: ${selectedEsim.poolName || 'N/A'}\n\n` +
      `Activation URL: ${url}\n\n` +
      `You can scan the QR code or visit the activation URL to set up your eSIM.\n\n` +
      `Best regards,\nEasyTopup.no Team`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

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
      {change && (
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
            ? 'bg-indigo-600 text-white shadow-md' 
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers?.toLocaleString() || users.length.toLocaleString() || '0'}
          change={analytics.userGrowth || 0}
          icon={Users}
          color="bg-gradient-to-br from-blue-600 to-blue-700"
        />
        <StatCard
          title="Active Users"
          value={analytics.activeUsers?.toLocaleString() || users.filter(u => u.accountStatus === 'ACTIVE').length.toLocaleString() || '0'}
          change={analytics.activeUserGrowth || 0}
          icon={UserCheck}
          color="bg-gradient-to-br from-green-600 to-green-700"
        />
        <StatCard
          title="Pending Approvals"
          value={analytics.pendingApprovals || businessUsers.filter(b => b.businessDetails?.verificationStatus === 'PENDING' || b.user?.accountStatus === 'PENDING_BUSINESS_APPROVAL').length || 0}
          icon={Clock}
          color="bg-gradient-to-br from-yellow-600 to-yellow-700"
          description="Business registrations"
        />
        <StatCard
          title="Total Revenue"
          value={`NOK ${analytics.totalRevenue?.toLocaleString() || '0'}`}
          change={analytics.revenueGrowth || 0}
          icon={DollarSign}
          color="bg-gradient-to-br from-purple-600 to-purple-700"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="text-indigo-600" size={20} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button 
            onClick={() => setActiveTab('stock')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <Package className="text-indigo-600 mb-2" size={24} />
            <span className="text-sm font-medium">Stock Management</span>
          </button>
          <button 
            onClick={() => setActiveTab('promotions')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Target className="text-purple-600 mb-2" size={24} />
            <span className="text-sm font-medium">Promotions & Campaigns</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
            <Upload className="text-green-600 mb-2" size={24} />
            <span className="text-sm font-medium">Bulk Upload</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <FileText className="text-blue-600 mb-2" size={24} />
            <span className="text-sm font-medium">Generate Report</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors">
            <Bell className="text-yellow-600 mb-2" size={24} />
            <span className="text-sm font-medium">Send Alert</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <Settings className="text-gray-600 mb-2" size={24} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-green-600" size={20} />
            Recent User Activity
          </h3>
          <div className="space-y-3">
            {users && users.length > 0 ? (
              users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.accountStatus === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.accountStatus}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <User size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No users found</p>
                <p className="text-sm text-gray-400">User data will appear here once backend is connected</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="text-yellow-600" size={20} />
            Top Performing Products
          </h3>
          <div className="space-y-3">
            {analytics.topProducts && analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Package size={16} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">
                    NOK {product.revenue.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No product data available</p>
                <p className="text-sm text-gray-400">Sales data will appear here once backend is connected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to get unique prices from stock bundles
  const getUniquePrices = () => {
    const prices = new Set();
    stockBundles.forEach(bundle => {
      if (bundle.price) {
        prices.add(bundle.price);
      }
    });
    return Array.from(prices).sort((a, b) => a - b);
  };

  // Helper function to get bundles by price
  const getBundlesByPrice = (price) => {
    if (!price) return stockBundles;
    return stockBundles.filter(bundle => bundle.price === price);
  };

  // Helper function to get bundle count by price
  const getBundleCountByPrice = (price) => {
    return stockBundles.filter(bundle => bundle.price === price).length;
  };

  const renderBundles = () => {
    const uniquePrices = getUniquePrices();
    const filteredBundles = selectedPriceFilter 
      ? getBundlesByPrice(selectedPriceFilter) 
      : stockBundles;

    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bundle Management</h3>
          {connectionStatus === 'offline' && bundles.length > 0 && (
            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              Using demo data - Backend unavailable
            </p>
          )}
          {bundles.length === 0 && stockBundles.length > 0 && (
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              Showing CSV uploaded items - No product bundles in database yet
            </p>
          )}
          {bundles.length === 0 && stockBundles.length === 0 && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              No bundle data available - Check MongoDB connection
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchAllData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Bundle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bundles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{getTotalBundles()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bundles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{getActiveBundles()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">NOK {getTotalRevenue().toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Units Sold</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{getTotalUnitsSold().toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-700 text-white flex items-center justify-center">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Price Category Filter Cards */}
      {uniquePrices.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
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
                <span className="text-xs opacity-80">{stockBundles.length} items</span>
              </div>
            </button>

            {/* Price Category Cards */}
            {uniquePrices.map((price) => (
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
              <span>Showing {filteredBundles.length} bundles at {selectedPriceFilter} NOK</span>
            </div>
          )}
        </div>
      )}

      {/* CSV Stock Bundles Section */}
      {/* CSV Uploaded Data Table - Individual PIN Items (EPIN Only) */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Database className="text-purple-600" size={20} />
                CSV Uploaded PIN Bundles ({filteredBundles?.length || 0})
              </h3>
              <p className="text-sm text-gray-500 mt-1">Individual PIN items from your CSV uploads (eSIM items excluded, see eSIM Management tab)</p>
            </div>
            <button 
              onClick={() => setActiveTab('stock')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Database size={16} />
              Upload More
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PIN Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBundles && filteredBundles.length > 0 ? (
                filteredBundles.map((item, index) => (
                  <tr key={item.itemId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package size={20} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-mono font-medium text-gray-900">{item.itemData || 'N/A'}</div>
                          <div className="text-xs text-gray-400">PIN #{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{item.serialNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs" title={item.notes || 'No notes'}>
                        {item.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {item.price ? `${item.price} NOK` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.stockType === 'EPIN' 
                          ? 'bg-blue-100 text-blue-800'
                          : item.stockType === 'ESIM'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.stockType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.poolName || item.csvFileName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'ASSIGNED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : item.status === 'USED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status || 'AVAILABLE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteItem(item.poolId, item.itemId, item.itemData)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete this PIN"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Package size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No CSV uploaded bundles found</p>
                    <p className="text-sm text-gray-400">Upload CSV files in Stock Management to create bundles</p>
                    <button 
                      onClick={() => setActiveTab('stock')}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Go to Stock Management
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
  };

  const renderEsimManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">eSIM Management</h3>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchAllData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* eSIM Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total eSIMs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{esimBundles.length || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white flex items-center justify-center">
              <Globe2 size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available eSIMs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{esimBundles.filter(b => b.status === 'AVAILABLE').length || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned eSIMs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{esimBundles.filter(b => b.status === 'ASSIGNED').length || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-700 text-white flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Used eSIMs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{esimBundles.filter(b => b.status === 'USED').length || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 text-white flex items-center justify-center">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* eSIM Data Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Globe2 className="text-green-600" size={20} />
                CSV Uploaded eSIM Data ({esimBundles?.length || 0})
              </h3>
              <p className="text-sm text-gray-500 mt-1">Individual eSIM items from your CSV uploads</p>
            </div>
            <button 
              onClick={() => setActiveTab('stock')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Upload size={16} />
              Upload More eSIMs
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">eSIM Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {esimBundles && esimBundles.length > 0 ? (
                esimBundles.map((item, index) => (
                  <tr key={item.itemId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Globe2 size={20} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-mono font-medium text-gray-900">{item.itemData || 'N/A'}</div>
                          <div className="text-xs text-gray-400">eSIM #{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{item.serialNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        Available
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs" title={item.notes || 'No notes'}>
                        {item.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {item.price ? `${item.price} NOK` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.poolName || item.csvFileName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'ASSIGNED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : item.status === 'USED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status || 'AVAILABLE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteItem(item.poolId, item.itemId, item.itemData)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete this eSIM"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Globe2 size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No eSIM data found</p>
                    <p className="text-sm text-gray-400">Upload eSIM CSV files in Stock Management to create eSIM inventory</p>
                    <button 
                      onClick={() => setActiveTab('stock')}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Go to Stock Management
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => {
    // Categorize users
    const activePersonalUsers = users.filter(u => u.accountType === 'PERSONAL' && u.accountStatus === 'ACTIVE');
    const activeBusinessUsers = users.filter(u => u.accountType === 'BUSINESS' && u.accountStatus === 'ACTIVE');
    const pendingVerificationUsers = users.filter(u => u.accountStatus === 'PENDING_VERIFICATION');
    const pendingBusinessApprovalUsers = users.filter(u => u.accountStatus === 'PENDING_BUSINESS_APPROVAL');
    const suspendedUsers = users.filter(u => u.accountStatus === 'SUSPENDED' || u.accountStatus === 'DEACTIVATED');

    const renderUserTable = (userList, title, description, emptyMessage) => (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-md font-semibold text-gray-900">{title}</h4>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userList && userList.length > 0 ? (
                userList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.accountType === 'BUSINESS' ? 'bg-purple-100' : 'bg-indigo-100'
                        }`}>
                          {user.accountType === 'BUSINESS' ? 
                            <Building size={20} className="text-purple-600" /> : 
                            <User size={20} className="text-indigo-600" />
                          }
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.accountType === 'BUSINESS' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.accountType === 'BUSINESS' ? <Building size={12} className="mr-1" /> : <User size={12} className="mr-1" />}
                        {user.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.accountStatus === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : user.accountStatus === 'PENDING_BUSINESS_APPROVAL'
                          ? 'bg-yellow-100 text-yellow-800'
                          : user.accountStatus === 'PENDING_VERIFICATION'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.accountStatus === 'ACTIVE' && <CheckCircle size={12} className="mr-1" />}
                        {user.accountStatus === 'PENDING_BUSINESS_APPROVAL' && <Clock size={12} className="mr-1" />}
                        {user.accountStatus === 'PENDING_VERIFICATION' && <AlertCircle size={12} className="mr-1" />}
                        {(user.accountStatus === 'SUSPENDED' || user.accountStatus === 'DEACTIVATED') && <XCircle size={12} className="mr-1" />}
                        {user.accountStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="text-indigo-600 hover:text-indigo-900" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900" 
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUserClick(user)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <User size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">{emptyMessage}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <p className="text-sm text-gray-500 mt-1">Manage all user accounts categorized by type and status</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button 
              onClick={() => fetchAllData()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Personal Users</p>
                <p className="text-2xl font-bold mt-1">{activePersonalUsers.length}</p>
              </div>
              <User size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Business Users</p>
                <p className="text-2xl font-bold mt-1">{activeBusinessUsers.length}</p>
              </div>
              <Building size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending Verification</p>
                <p className="text-2xl font-bold mt-1">{pendingVerificationUsers.length}</p>
              </div>
              <AlertCircle size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending Approval</p>
                <p className="text-2xl font-bold mt-1">{pendingBusinessApprovalUsers.length}</p>
              </div>
              <Clock size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Suspended</p>
                <p className="text-2xl font-bold mt-1">{suspendedUsers.length}</p>
              </div>
              <XCircle size={32} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Categorized User Tables */}
        {pendingBusinessApprovalUsers.length > 0 && (
          renderUserTable(
            pendingBusinessApprovalUsers, 
            '⏳ Pending Business Approvals', 
            'Business users waiting for admin approval',
            'No pending business approvals'
          )
        )}

        {pendingVerificationUsers.length > 0 && (
          renderUserTable(
            pendingVerificationUsers, 
            '📧 Pending Email Verification', 
            'Users who haven\'t verified their email address yet',
            'No users pending verification'
          )
        )}

        {renderUserTable(
          activeBusinessUsers, 
          '🏢 Active Business Users', 
          'Approved business accounts with active status',
          'No active business users found'
        )}

        {renderUserTable(
          activePersonalUsers, 
          '👤 Active Personal Users', 
          'Individual accounts with active status',
          'No active personal users found'
        )}

        {suspendedUsers.length > 0 && (
          renderUserTable(
            suspendedUsers, 
            '🚫 Suspended/Deactivated Users', 
            'Users with restricted or deactivated accounts',
            'No suspended users'
          )
        )}

        {users.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No users found</p>
            <p className="text-sm text-gray-400 mt-2">User data will appear here once the backend is connected</p>
          </div>
        )}
      </div>
    );
  };

  const renderBusinessApprovals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Business Registration Approvals</h3>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <CheckCircle size={16} />
            Approve All Verified
          </button>
          <button 
            onClick={() => fetchAllData()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Org Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businessUsers && businessUsers.length > 0 ? (
                businessUsers.map((businessReg) => (
                <tr key={businessReg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Building size={20} className="text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {businessReg.businessDetails?.companyName || 'Company Name Not Available'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {businessReg.businessDetails?.companyEmail || businessReg.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {businessReg.user?.firstName} {businessReg.user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{businessReg.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {businessReg.businessDetails?.organizationNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      businessReg.businessDetails?.verificationMethod === 'BANK_ID' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Shield size={12} className="mr-1" />
                      {businessReg.businessDetails?.verificationMethod === 'BANK_ID' ? 'BankID' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      businessReg.user?.emailVerified 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {businessReg.user?.emailVerified ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                      {businessReg.user?.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      businessReg.businessDetails?.verificationStatus === 'VERIFIED' 
                        ? 'bg-green-100 text-green-800'
                        : businessReg.businessDetails?.verificationStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {businessReg.businessDetails?.verificationStatus === 'VERIFIED' && <CheckCircle size={12} className="mr-1" />}
                      {businessReg.businessDetails?.verificationStatus === 'PENDING' && <Clock size={12} className="mr-1" />}
                      {businessReg.businessDetails?.verificationStatus === 'REJECTED' && <XCircle size={12} className="mr-1" />}
                      {businessReg.businessDetails?.verificationStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {businessReg.businessDetails?.createdDate ? new Date(businessReg.businessDetails.createdDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleApproveUser(businessReg.user?.id || businessReg.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectUser(businessReg.user?.id || businessReg.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 flex items-center gap-1"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Building size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No business registrations found</p>
                    <p className="text-sm text-gray-400">Business registration data will appear here once backend is connected</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEnquiries = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Customer Enquiries & Support</h3>
        <div className="flex gap-3">
          <select className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <button 
            onClick={() => fetchAllData()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enquiry ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enquiries && enquiries.length > 0 ? (
                enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{enquiry.id}</div>
                    <div className="text-sm text-gray-500">{new Date(enquiry.createdDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-indigo-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{enquiry.customerName}</div>
                        <div className="text-sm text-gray-500">{enquiry.customerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{enquiry.subject}</div>
                    <div className="text-sm text-gray-500">{enquiry.accountType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      enquiry.channel === 'Email' 
                        ? 'bg-blue-100 text-blue-800'
                        : enquiry.channel === 'WhatsApp'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {enquiry.channel === 'Email' && <Mail size={12} className="mr-1" />}
                      {enquiry.channel === 'WhatsApp' && <MessageCircle size={12} className="mr-1" />}
                      {enquiry.channel === 'Phone' && <Phone size={12} className="mr-1" />}
                      {enquiry.channel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      enquiry.priority === 'High' 
                        ? 'bg-red-100 text-red-800'
                        : enquiry.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <AlertCircle size={12} className="mr-1" />
                      {enquiry.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      enquiry.status === 'Open' 
                        ? 'bg-red-100 text-red-800'
                        : enquiry.status === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {enquiry.status === 'Open' && <AlertCircle size={12} className="mr-1" />}
                      {enquiry.status === 'In Progress' && <Clock size={12} className="mr-1" />}
                      {enquiry.status === 'Resolved' && <CheckCircle size={12} className="mr-1" />}
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {enquiry.assignedAgent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit size={16} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <MessageCircle size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No enquiries found</p>
                    <p className="text-sm text-gray-400">Customer enquiries will appear here once backend is connected</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Daily Revenue"
          value={`NOK ${analytics.dailyRevenue?.toLocaleString() || '0'}`}
          change={analytics.dailyRevenueGrowth || 0}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-600 to-green-700"
        />
        <StatCard
          title="Total Orders"
          value={analytics.totalOrders?.toLocaleString() || '0'}
          change={analytics.orderGrowth || 0}
          icon={ShoppingCart}
          color="bg-gradient-to-br from-blue-600 to-blue-700"
        />
        <StatCard
          title="Conversion Rate"
          value={analytics.conversionRate ? `${analytics.conversionRate}%` : '0%'}
          change={analytics.conversionGrowth || 0}
          icon={Percent}
          color="bg-gradient-to-br from-purple-600 to-purple-700"
        />
        <StatCard
          title="Active Products"
          value={analytics.activeProducts?.toLocaleString() || '0'}
          icon={Package}
          color="bg-gradient-to-br from-orange-600 to-orange-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="text-blue-600" size={20} />
            Revenue by User Type
          </h3>
          {analytics.revenueByUserType && analytics.revenueByUserType.length > 0 ? (
            <div className="space-y-4">
              {analytics.revenueByUserType.map((userType, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${index === 0 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                    <span className="text-gray-700">{userType.type}</span>
                  </div>
                  <span className="font-semibold">NOK {userType.revenue.toLocaleString()} ({userType.percentage}%)</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No revenue data available</p>
              <p className="text-sm text-gray-400">Revenue breakdown will appear here once data is available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LineChart className="text-green-600" size={20} />
            Sales Performance
          </h3>
          {analytics.salesPerformance ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Daily</span>
                <span className={`font-semibold ${analytics.salesPerformance.daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.salesPerformance.daily >= 0 ? '+' : ''}{analytics.salesPerformance.daily}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Weekly</span>
                <span className={`font-semibold ${analytics.salesPerformance.weekly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.salesPerformance.weekly >= 0 ? '+' : ''}{analytics.salesPerformance.weekly}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly</span>
                <span className={`font-semibold ${analytics.salesPerformance.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.salesPerformance.monthly >= 0 ? '+' : ''}{analytics.salesPerformance.monthly}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <LineChart size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No sales performance data</p>
              <p className="text-sm text-gray-400">Performance metrics will appear here once data is available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLoadingScreen 
        onSkip={() => {
          setLoading(false);
          setTimeout(() => fetchAllData(), 100);
        }}
      />
    );
  }

  const SidebarNavItem = ({ id, label, icon: Icon, active, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        active 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 scale-105' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-102'
      }`}
    >
      {/* Animated background for active state */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient"></div>
      )}
      
      {/* Icon with bounce animation */}
      <Icon size={20} className={`flex-shrink-0 relative z-10 transition-transform duration-300 ${
        active ? 'text-white scale-110' : 'text-gray-500 group-hover:text-indigo-600 group-hover:scale-110 group-hover:rotate-3'
      }`} />
      
      {/* Label */}
      <span className={`font-medium text-sm flex-1 text-left relative z-10 transition-all duration-300 ${
        active ? 'translate-x-0' : 'group-hover:translate-x-1'
      }`}>
        {label}
      </span>
      
      {/* Badge with pulse animation */}
      {badge > 0 && (
        <span className={`relative z-10 px-2 py-0.5 text-xs rounded-full min-w-[20px] text-center transition-all duration-300 ${
          active 
            ? 'bg-white/20 text-white animate-pulse' 
            : 'bg-red-500 text-white group-hover:bg-red-600 group-hover:scale-110'
        }`}>
          {badge}
        </span>
      )}
      
      {/* Hover effect line */}
      {!active && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-600 to-purple-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-r-full"></div>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-xl`}>
        {/* Logo & Brand */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg animate-pulse-slow">
                  <Shield size={20} />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Admin Panel</h1>
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
                id="users"
                label="Users"
                icon={Users}
                active={activeTab === 'users'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="bundles"
                label="Bundles"
                icon={Package}
                active={activeTab === 'bundles'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="esim"
                label="eSIM"
                icon={Globe2}
                active={activeTab === 'esim'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="esim-approvals"
                label="eSIM Approvals"
                icon={CheckCircle}
                active={activeTab === 'esim-approvals'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="stock"
                label="Stock"
                icon={Box}
                active={activeTab === 'stock'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="retailer-credit"
                label="Retailer Credit"
                icon={CreditCard}
                active={activeTab === 'retailer-credit'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="business-approvals"
                label="Business Approvals"
                icon={Building}
                active={activeTab === 'business-approvals'}
                onClick={setActiveTab}
                badge={analytics.pendingApprovals || (businessUsers && businessUsers.filter(b => b.businessDetails?.verificationStatus === 'PENDING' || b.user?.accountStatus === 'PENDING_BUSINESS_APPROVAL').length) || 0}
              />
              <SidebarNavItem
                id="enquiries"
                label="Enquiries"
                icon={MessageCircle}
                active={activeTab === 'enquiries'}
                onClick={setActiveTab}
                badge={enquiries && enquiries.filter(e => e.status === 'Open').length || 0}
              />
              <SidebarNavItem
                id="promotions"
                label="Promotions"
                icon={Target}
                active={activeTab === 'promotions'}
                onClick={setActiveTab}
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
              {/* Collapsed sidebar icons */}
              <button onClick={() => { setActiveTab('overview'); }} className={`w-full p-3 rounded-xl ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                <BarChart3 size={20} className="mx-auto" />
              </button>
              <button onClick={() => { setActiveTab('users'); }} className={`w-full p-3 rounded-xl ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                <Users size={20} className="mx-auto" />
              </button>
              <button onClick={() => { setActiveTab('bundles'); }} className={`w-full p-3 rounded-xl ${activeTab === 'bundles' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                <Package size={20} className="mx-auto" />
              </button>
              <button onClick={() => { setActiveTab('esim'); }} className={`w-full p-3 rounded-xl ${activeTab === 'esim' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                <Globe2 size={20} className="mx-auto" />
              </button>
              <button onClick={() => { setActiveTab('esim-approvals'); }} className={`w-full p-3 rounded-xl ${activeTab === 'esim-approvals' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                <CheckCircle size={20} className="mx-auto" />
              </button>
              <button onClick={() => { setActiveTab('stock'); }} className={`w-full p-3 rounded-xl ${activeTab === 'stock' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                <Box size={20} className="mx-auto" />
              </button>
              <button onClick={() => { setActiveTab('retailer-credit'); }} className={`w-full p-3 rounded-xl ${activeTab === 'retailer-credit' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
                <CreditCard size={20} className="mx-auto" />
              </button>
            </>
          )}
        </div>

        {/* Logout Button */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'overview' ? 'Dashboard' :
                 activeTab === 'users' ? 'User Management' :
                 activeTab === 'bundles' ? 'Bundle Management' :
                 activeTab === 'esim' ? 'eSIM Management' :
                 activeTab === 'esim-approvals' ? 'eSIM Approvals' :
                 activeTab === 'stock' ? 'Stock Management' :
                 activeTab === 'retailer-credit' ? 'Retailer Credit Management' :
                 activeTab === 'business-approvals' ? 'Business Approvals' :
                 activeTab === 'enquiries' ? 'Customer Support' :
                 activeTab === 'promotions' ? 'Promotions & Campaigns' :
                 'Analytics & Reports'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Welcome back, Admin</p>
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
                onClick={() => fetchAllData()}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                title="Refresh"
              >
                <RefreshCw size={20} />
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Notifications">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Settings">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Content */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'bundles' && renderBundles()}
            {activeTab === 'esim' && renderEsimManagement()}
            {activeTab === 'esim-approvals' && <EsimApprovals />}
            {activeTab === 'stock' && <StockManagement />}
            {activeTab === 'retailer-credit' && <RetailerCreditManagement />}
            {activeTab === 'business-approvals' && renderBusinessApprovals()}
            {activeTab === 'enquiries' && renderEnquiries()}
            {activeTab === 'promotions' && <PromotionCampaignManager />}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </div>

      {/* QR Code Modal for eSIM */}
      {showQrModal && selectedEsim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <QrCode size={24} />
                    eSIM QR Code & Details
                  </h3>
                  <p className="text-green-100 mt-1">
                    Share this QR code with your customer
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowQrModal(false);
                    setSelectedEsim(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* eSIM Information */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">eSIM Code</p>
                    <p className="font-mono font-semibold text-gray-900">{selectedEsim.itemData}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Serial Number</p>
                    <p className="font-mono font-semibold text-gray-900">{selectedEsim.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Pool Name</p>
                    <p className="font-semibold text-gray-900">{selectedEsim.poolName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="font-semibold text-green-600">{selectedEsim.price ? `${selectedEsim.price} NOK` : '-'}</p>
                  </div>
                  {selectedEsim.notes && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{selectedEsim.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div ref={qrCodeRef} className="bg-white p-6 rounded-xl shadow-lg border-4 border-green-200">
                  <QRCodeSVG
                    value={generateEsimQrData(selectedEsim)}
                    size={256}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Scan this QR code to activate the eSIM
                </p>
              </div>

              {/* Activation URL */}
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-600 font-semibold mb-2">ACTIVATION URL</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generateEsimQrData(selectedEsim)}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={handleCopyQrUrl}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    title="Copy URL"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleDownloadQrCode}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download size={16} />
                Download QR
              </button>
              <button
                onClick={handleCopyQrUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Copy size={16} />
                Copy URL
              </button>
              <button
                onClick={handleShareEsim}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={handleSendEsimEmail}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Send size={16} />
                Send Email
              </button>
              <button
                onClick={() => {
                  setShowQrModal(false);
                  setSelectedEsim(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">User Details</h3>
              <button
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setSelectedUser(null);
                  setUserDetails(null);
                }}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingUserDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : userDetails ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User size={20} className="text-indigo-600" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-semibold">{userDetails.basicInfo.firstName} {userDetails.basicInfo.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold">{userDetails.basicInfo.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mobile</p>
                        <p className="font-semibold">{userDetails.basicInfo.mobileNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Type</p>
                        <p className="font-semibold">{userDetails.basicInfo.accountType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userDetails.basicInfo.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          userDetails.basicInfo.accountStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userDetails.basicInfo.accountStatus}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Verified</p>
                        <p className="font-semibold">{userDetails.basicInfo.emailVerified ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created Date</p>
                        <p className="font-semibold">{new Date(userDetails.basicInfo.createdDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Modified</p>
                        <p className="font-semibold">{new Date(userDetails.basicInfo.lastModifiedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  {userDetails.businessDetails && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Building size={20} className="text-indigo-600" />
                        Business Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Company Name</p>
                          <p className="font-semibold">{userDetails.businessDetails.companyName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Organization Number</p>
                          <p className="font-semibold">{userDetails.businessDetails.organizationNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">VAT Number</p>
                          <p className="font-semibold">{userDetails.businessDetails.vatNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Company Email</p>
                          <p className="font-semibold">{userDetails.businessDetails.companyEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Verification Method</p>
                          <p className="font-semibold">{userDetails.businessDetails.verificationMethod}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Verification Status</p>
                          <p className="font-semibold">{userDetails.businessDetails.verificationStatus}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Postal Address</p>
                          <p className="font-semibold">
                            {typeof userDetails.businessDetails.postalAddress === 'object' 
                              ? userDetails.businessDetails.postalAddress?.fullAddress || 
                                `${userDetails.businessDetails.postalAddress?.street || ''}, ${userDetails.businessDetails.postalAddress?.city || ''}, ${userDetails.businessDetails.postalAddress?.postalCode || ''}, ${userDetails.businessDetails.postalAddress?.country || ''}`
                              : userDetails.businessDetails.postalAddress || 'N/A'
                            }
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Billing Address</p>
                          <p className="font-semibold">
                            {typeof userDetails.businessDetails.billingAddress === 'object'
                              ? userDetails.businessDetails.billingAddress?.fullAddress ||
                                `${userDetails.businessDetails.billingAddress?.street || ''}, ${userDetails.businessDetails.billingAddress?.city || ''}, ${userDetails.businessDetails.billingAddress?.postalCode || ''}, ${userDetails.businessDetails.billingAddress?.country || ''}`
                              : userDetails.businessDetails.billingAddress || 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usage Statistics */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity size={20} className="text-indigo-600" />
                      Usage Statistics
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-indigo-600">{userDetails.usage.totalOrders}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">NOK {userDetails.usage.totalSpent.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Total Spent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">NOK {userDetails.usage.averageOrderValue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                      </div>
                    </div>
                  </div>

                  {/* Purchase History */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingCart size={20} className="text-indigo-600" />
                      Purchase History ({userDetails.purchases.length})
                    </h4>
                    {userDetails.purchases.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {userDetails.purchases.map((purchase, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900">{purchase.productName}</p>
                                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                                    purchase.type === 'eSIM' ? 'bg-purple-100 text-purple-700' :
                                    purchase.type === 'Retailer Order' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {purchase.type}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">Order #{purchase.orderNumber}</p>
                                {purchase.quantity && (
                                  <p className="text-xs text-gray-400">Quantity: {purchase.quantity}</p>
                                )}
                                {purchase.itemCount && (
                                  <p className="text-xs text-gray-400">Items: {purchase.itemCount}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(purchase.orderDate).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-bold text-gray-900">NOK {Number(purchase.amount).toFixed(2)}</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                                  purchase.status === 'APPROVED' || purchase.status === 'COMPLETED' || purchase.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                  purchase.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {purchase.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No purchases yet</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal (Enhanced with form fields) */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Edit size={24} />
                Edit User Details
              </h3>
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Info Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">User Information</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</div>
                  <div><strong>Account Type:</strong> {selectedUser.accountType}</div>
                  <div className="flex items-center gap-2">
                    <strong>Status:</strong>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      selectedUser.accountStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedUser.accountStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Form Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail size={16} />
                  Contact Details
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editUserData.mobileNumber}
                    onChange={(e) => setEditUserData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Status Actions Section */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Account Status Actions</h4>
                <div className="flex gap-2">
                  {selectedUser.accountStatus === 'ACTIVE' ? (
                    <button
                      onClick={handleSuspendUser}
                      disabled={updating}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-sm disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={handleActivateUser}
                      disabled={updating}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      Activate
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleUpdateUser}
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Update Details
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={updating}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Delete User</h3>
              <button
                onClick={() => {
                  setShowDeleteUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-100 rounded-full p-3">
                    <AlertCircle size={32} className="text-red-600" />
                  </div>
                </div>
                <p className="text-gray-700 text-center mb-4">
                  Are you sure you want to delete this user?
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                </div>
                <p className="text-sm text-red-600 mt-4 text-center">
                  ⚠️ This action cannot be undone!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  Yes, Delete User
                </button>
                <button
                  onClick={() => {
                    setShowDeleteUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}