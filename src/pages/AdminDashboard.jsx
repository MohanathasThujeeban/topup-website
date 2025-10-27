import React, { useState, useEffect } from 'react';
import { 
  Globe2, MapPin, BarChart3, Languages, CreditCard, Users, Download, Filter,
  Shield, UserCheck, UserX, Building, Package, DollarSign, TrendingUp,
  Clock, AlertCircle, CheckCircle, XCircle, Eye, Edit, Trash2, Plus,
  Search, RefreshCw, Bell, Settings, Upload, FileText, Target,
  MessageCircle, Mail, Phone, Calendar, User, Activity, Award,
  PieChart, LineChart, ShoppingCart, Percent, Database, Zap, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BundleBulkImport from '../components/BundleBulkImport';

// API Base URL - should match AuthContext
const API_BASE_URL = 'http://localhost:8080/api';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [businessUsers, setBusinessUsers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'offline'
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    fetchAllData();
    
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, stopping loading state');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(loadingTimeout);
  }, []);

  // Bundle Management Functions
  const [showCreateBundle, setShowCreateBundle] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [bundleForm, setBundleForm] = useState({
    name: '',
    description: '',
    productType: 'BUNDLE',
    category: 'NORWAY',
    basePrice: '',
    retailerCommissionPercentage: 30,
    stockQuantity: '',
    status: 'ACTIVE'
  });

  const createBundle = async (bundleData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bundleData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bundle created successfully:', result);
        
        if (result.success) {
          alert('Bundle created successfully!');
          await fetchAllData(); // Refresh data
          setShowCreateBundle(false);
          setBundleForm({
            name: '',
            description: '',
            productType: 'BUNDLE',
            category: 'NORWAY',
            basePrice: '',
            retailerCommissionPercentage: 30,
            stockQuantity: '',
            status: 'ACTIVE'
          });
        } else {
          throw new Error(result.error || 'Unknown error occurred');
        }
        return result;
      } else {
        const errorResult = await response.json();
        console.error('Failed to create bundle:', errorResult);
        throw new Error(errorResult.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating bundle:', error);
      throw error;
    }
  };

  const updateBundle = async (bundleId, bundleData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/bundles/${bundleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bundleData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bundle updated successfully:', result);
        await fetchAllData(); // Refresh data
        setEditingBundle(null);
        return result;
      } else {
        console.error('Failed to update bundle:', response.statusText);
        throw new Error(`Failed to update bundle: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating bundle:', error);
      throw error;
    }
  };

  const deleteBundle = async (bundleId) => {
    if (!confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/bundles/${bundleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log('Bundle deleted successfully');
        await fetchAllData(); // Refresh data
      } else {
        console.error('Failed to delete bundle:', response.statusText);
        throw new Error(`Failed to delete bundle: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting bundle:', error);
      alert('Failed to delete bundle. Please try again.');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/analytics', {
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
      try {
        const testResponse = await fetch(`${API_BASE_URL}/admin/analytics`, { headers });
        console.log('Backend connection test response status:', testResponse.status);
        backendConnected = testResponse.ok || testResponse.status === 401; // 401 means server is running but auth issue
        
        if (testResponse.status === 401) {
          console.warn('Authentication failed - token may be invalid or expired');
        }
      } catch (err) {
        console.log('Backend connection test failed:', err);
        backendConnected = false;
      }
      
      if (!backendConnected) {
        setConnectionStatus('offline');
        console.log('Backend is offline, using empty data');
        setUsers([]);
        setBusinessUsers([]);
        setEnquiries([]);
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
        return;
      }
      
      setConnectionStatus('connected');
      
      // Fetch real data from backend APIs
      const [usersResponse, businessResponse, enquiriesResponse, analyticsResponse, bundlesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, { headers }).catch(err => {
          console.log('Users API failed:', err);
          return { ok: false };
        }),
        fetch(`${API_BASE_URL}/admin/business-registrations`, { headers }).catch(err => {
          console.log('Business API failed:', err);
          return { ok: false };
        }),
        fetch(`${API_BASE_URL}/admin/enquiries`, { headers }).catch(err => {
          console.log('Enquiries API failed:', err);
          return { ok: false };
        }),
        fetch(`${API_BASE_URL}/admin/analytics`, { headers }).catch(err => {
          console.log('Analytics API failed:', err);
          return { ok: false };
        }),
        fetch(`${API_BASE_URL}/admin/bundles`, { headers }).catch(err => {
          console.log('Bundles API failed:', err);
          return { ok: false };
        })
      ]);

      // Process users data
      if (usersResponse.ok) {
        const usersResponse_data = await usersResponse.json();
        console.log('Users data received:', usersResponse_data);
        if (usersResponse_data.success && usersResponse_data.data && usersResponse_data.data.users) {
          setUsers(usersResponse_data.data.users);
        } else {
          setUsers([]);
        }
      } else {
        console.log('Failed to fetch users, using empty array');
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
      if (bundlesResponse.ok) {
        const bundlesData = await bundlesResponse.json();
        console.log('Bundles data received:', bundlesData);
        if (bundlesData.bundles) {
          // Server returns bundles in 'bundles' field
          setBundles(Array.isArray(bundlesData.bundles) ? bundlesData.bundles : []);
        } else if (bundlesData.data) {
          // Fallback to 'data' field
          setBundles(Array.isArray(bundlesData.data) ? bundlesData.data : []);
        } else {
          setBundles([]);
        }
      } else {
        console.log('Failed to fetch bundles, using empty array');
        setBundles([]);
      }

      console.log('Real data loaded successfully');

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
      
      // Fetch real analytics data from backend
      fetchAnalytics();
    } finally {
      setLoading(false);
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

  const handleBulkImport = async (importedBundles) => {
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Convert imported bundles to CSV format
      const csvHeaders = ['name', 'description', 'productType', 'category', 'basePrice', 'retailerCommissionPercentage', 'stockQuantity', 'status'];
      const csvData = [
        csvHeaders.join(','),
        ...importedBundles.map(bundle => csvHeaders.map(header => bundle[header] || '').join(','))
      ].join('\n');
      
      // Create a Blob and add to FormData
      const csvBlob = new Blob([csvData], { type: 'text/csv' });
      formData.append('file', csvBlob, 'bulk_import.csv');
      
      const response = await fetch(`${API_BASE_URL}/admin/bundles/bulk-import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bulk import successful:', result);
        await fetchAllData(); // Refresh data to show imported bundles
        alert(`Successfully imported ${importedBundles.length} bundles!`);
      } else {
        console.error('Bulk import failed:', response.statusText);
        throw new Error(`Failed to import bundles: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error during bulk import:', error);
      alert('Failed to import bundles. Please try again.');
    }
    
    setShowBulkImport(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const StatCard = ({ title, value, change, icon: Icon, color, description }) => (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center`}>
          <Icon size={24} />
        </div>
      </div>
      {change && (
        <div className="mt-4">
          <span className={`inline-flex items-center text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={16} className="mr-1" />
            {change > 0 ? '+' : ''}{change}% from last month
          </span>
        </div>
      )}
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, active, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon size={18} />
      {label}
      {badge && (
        <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button 
            onClick={() => setActiveTab('bundles')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <Plus className="text-indigo-600 mb-2" size={24} />
            <span className="text-sm font-medium">Create Bundle</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
            <Upload className="text-green-600 mb-2" size={24} />
            <span className="text-sm font-medium">Bulk Upload</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <FileText className="text-blue-600 mb-2" size={24} />
            <span className="text-sm font-medium">Generate Report</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
            <Target className="text-purple-600 mb-2" size={24} />
            <span className="text-sm font-medium">Create Offer</span>
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

  const renderBundles = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Bundle Management</h3>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateBundle(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Create Bundle
          </button>
          <button 
            onClick={() => setShowBulkImport(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Package size={16} />
            Bundle Manager
          </button>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{bundles.length || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{bundles.filter(b => b.status === 'ACTIVE').length || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">NOK {bundles.reduce((sum, b) => sum + (b.basePrice * (b.soldQuantity || 0)), 0).toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{bundles.reduce((sum, b) => sum + (b.soldQuantity || 0), 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-700 text-white flex items-center justify-center">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Bundle Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing (NOK)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bundles && bundles.length > 0 ? (
                bundles.map((bundle) => (
                  <tr key={bundle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Package size={20} className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{bundle.name}</div>
                          <div className="text-sm text-gray-500">{bundle.description}</div>
                          <div className="text-xs text-gray-400">{bundle.productType} • {bundle.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">Retail: NOK {bundle.basePrice?.toLocaleString()}</div>
                        <div className="text-green-600">Wholesale: NOK {(bundle.basePrice * 0.7)?.toFixed(2)}</div>
                        <div className="text-purple-600">Margin: {bundle.retailerCommissionPercentage || 30}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{bundle.stockQuantity || 0} available</div>
                        <div className={`text-xs ${(bundle.stockQuantity || 0) < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {(bundle.stockQuantity || 0) < 10 ? 'Low Stock' : 'In Stock'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{bundle.soldQuantity || 0} sold</div>
                        <div className="text-green-600">NOK {((bundle.basePrice || 0) * (bundle.soldQuantity || 0)).toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bundle.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : bundle.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bundle.status === 'ACTIVE' && <CheckCircle size={12} className="mr-1" />}
                        {bundle.status === 'DRAFT' && <Clock size={12} className="mr-1" />}
                        {bundle.status === 'INACTIVE' && <XCircle size={12} className="mr-1" />}
                        {bundle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bundle.createdDate ? new Date(bundle.createdDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => alert(`Bundle Details:\nName: ${bundle.name}\nType: ${bundle.productType}\nCategory: ${bundle.category}\nPrice: NOK ${bundle.basePrice}\nStock: ${bundle.stockQuantity}\nSold: ${bundle.soldQuantity || 0}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingBundle(bundle);
                            setBundleForm({
                              name: bundle.name || '',
                              description: bundle.description || '',
                              productType: bundle.productType || 'BUNDLE',
                              category: bundle.category || 'NORWAY',
                              basePrice: bundle.basePrice?.toString() || '',
                              retailerCommissionPercentage: bundle.retailerCommissionPercentage || 30,
                              stockQuantity: bundle.stockQuantity?.toString() || '',
                              status: bundle.status || 'ACTIVE'
                            });
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Bundle"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteBundle(bundle.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Bundle"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No bundles found</p>
                    <p className="text-sm text-gray-400">Create your first bundle to start offering services to retailers</p>
                    <button 
                      onClick={() => setShowCreateBundle(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto"
                    >
                      <Plus size={16} />
                      Create Bundle
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

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-indigo-600" />
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
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.accountStatus === 'ACTIVE' && <CheckCircle size={12} className="mr-1" />}
                      {user.accountStatus === 'PENDING_BUSINESS_APPROVAL' && <Clock size={12} className="mr-1" />}
                      {user.accountStatus === 'SUSPENDED' && <XCircle size={12} className="mr-1" />}
                      {user.accountStatus.replace('_', ' ')}
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
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <User size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No users found</p>
                    <p className="text-sm text-gray-400">User data will appear here once backend is connected</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600 mb-2">Loading admin dashboard...</p>
          <p className="text-sm text-gray-500 mb-4">Connecting to backend services</p>
          <button 
            onClick={() => {
              setLoading(false);
              setTimeout(() => fetchAllData(), 100);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Skip Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center">
              <Shield />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">Admin Dashboard</div>
              <div className="text-sm text-gray-600">Complete control and management system</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
              connectionStatus === 'offline' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'offline' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}></div>
              {connectionStatus === 'connected' ? 'Backend Connected' :
               connectionStatus === 'offline' ? 'Backend Offline' :
               'Connecting...'}
            </div>
            
            <button 
              onClick={() => fetchAllData()}
              className="px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-sm flex items-center gap-2"
            >
              <RefreshCw size={16}/>
              Refresh
            </button>
            
            <button className="px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-sm flex items-center gap-2">
              <Download size={16}/>
              Export Data
            </button>
            <button className="relative p-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700">
              <Bell size={16}/>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 hover:border-red-400 text-red-700 hover:text-red-800 text-sm flex items-center gap-2 transition-all font-medium"
              title="Sign out"
            >
              <LogOut size={16}/>
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="overview"
              label="Overview"
              icon={BarChart3}
              active={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="users"
              label="User Management"
              icon={Users}
              active={activeTab === 'users'}
              onClick={setActiveTab}
            />
            <TabButton
              id="bundles"
              label="Bundle Management"
              icon={Package}
              active={activeTab === 'bundles'}
              onClick={setActiveTab}
            />
            <TabButton
              id="business-approvals"
              label="Business Approvals"
              icon={Building}
              active={activeTab === 'business-approvals'}
              onClick={setActiveTab}
              badge={analytics.pendingApprovals || (businessUsers && businessUsers.filter(b => b.businessDetails?.verificationStatus === 'PENDING' || b.user?.accountStatus === 'PENDING_BUSINESS_APPROVAL').length) || 0}
            />
            <TabButton
              id="enquiries"
              label="Customer Support"
              icon={MessageCircle}
              active={activeTab === 'enquiries'}
              onClick={setActiveTab}
              badge={enquiries && enquiries.filter(e => e.status === 'Open').length || 0}
            />
            <TabButton
              id="analytics"
              label="Analytics & Reports"
              icon={PieChart}
              active={activeTab === 'analytics'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'bundles' && renderBundles()}
        {activeTab === 'business-approvals' && renderBusinessApprovals()}
        {activeTab === 'enquiries' && renderEnquiries()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {/* Bundle Manager Modal */}
      {showBulkImport && (
        <BundleBulkImport
          onClose={() => setShowBulkImport(false)}
          onImport={handleBulkImport}
        />
      )}

      {/* Create/Edit Bundle Modal */}
      {(showCreateBundle || editingBundle) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingBundle ? 'Edit Bundle' : 'Create New Bundle'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateBundle(false);
                    setEditingBundle(null);
                    setBundleForm({
                      name: '',
                      description: '',
                      productType: 'BUNDLE',
                      category: 'NORWAY',
                      basePrice: '',
                      retailerCommissionPercentage: 30,
                      stockQuantity: '',
                      status: 'ACTIVE'
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (!bundleForm.name || !bundleForm.basePrice || !bundleForm.stockQuantity) {
                  alert('Please fill in all required fields: Bundle Name, Base Price, and Stock Quantity');
                  return;
                }
                
                const bundleData = {
                  ...bundleForm,
                  basePrice: parseFloat(bundleForm.basePrice),
                  stockQuantity: parseInt(bundleForm.stockQuantity),
                  retailerCommissionPercentage: parseFloat(bundleForm.retailerCommissionPercentage)
                };
                
                if (editingBundle) {
                  await updateBundle(editingBundle.id, bundleData);
                } else {
                  await createBundle(bundleData);
                }
              } catch (error) {
                console.error('Bundle save error:', error);
                alert('Failed to save bundle: ' + (error.message || 'Please try again'));
              }
            }} className="p-8 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-blue-800 font-medium mb-2">💡 Quick Start Tips</h4>
                <p className="text-blue-700 text-sm">
                  Fill in the bundle name, price, and stock quantity to get started. Use the pricing preview below to see retailer margins.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bundle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bundleForm.name}
                    onChange={(e) => setBundleForm({...bundleForm, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    placeholder="e.g., Nordic Travel eSIM 5GB"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                  <select
                    value={bundleForm.productType}
                    onChange={(e) => setBundleForm({...bundleForm, productType: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-white"
                  >
                    <option value="BUNDLE">📱 Data Bundle</option>
                    <option value="EPIN">🔢 ePIN</option>
                    <option value="ESIM">📶 eSIM</option>
                    <option value="TOPUP">💳 Top-up</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={bundleForm.category}
                    onChange={(e) => setBundleForm({...bundleForm, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-white"
                  >
                    <option value="NORWAY">🇳🇴 Norway</option>
                    <option value="NORDIC">🏔️ Nordic</option>
                    <option value="EUROPE">🇪🇺 Europe</option>
                    <option value="GLOBAL">🌍 Global</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (NOK) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={bundleForm.basePrice}
                      onChange={(e) => setBundleForm({...bundleForm, basePrice: e.target.value})}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                      placeholder="149.00"
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">NOK</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={bundleForm.stockQuantity}
                    onChange={(e) => setBundleForm({...bundleForm, stockQuantity: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retailer Commission (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={bundleForm.retailerCommissionPercentage}
                    onChange={(e) => setBundleForm({...bundleForm, retailerCommissionPercentage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={bundleForm.description}
                  onChange={(e) => setBundleForm({...bundleForm, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  placeholder="Describe what's included in this bundle (e.g., data allowance, calling features, validity period)..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={bundleForm.status}
                  onChange={(e) => setBundleForm({...bundleForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              
              {bundleForm.basePrice && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    💰 Pricing Breakdown
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Customer Pays</div>
                      <div className="text-2xl font-bold text-blue-600">
                        NOK {parseFloat(bundleForm.basePrice || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">Retail Price</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Retailer Pays</div>
                      <div className="text-2xl font-bold text-green-600">
                        NOK {(parseFloat(bundleForm.basePrice || 0) * (1 - parseFloat(bundleForm.retailerCommissionPercentage || 30) / 100)).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">Wholesale Price</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">Retailer Profit</div>
                      <div className="text-2xl font-bold text-purple-600">
                        NOK {(parseFloat(bundleForm.basePrice || 0) * parseFloat(bundleForm.retailerCommissionPercentage || 30) / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{bundleForm.retailerCommissionPercentage || 30}% Margin</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateBundle(false);
                    setEditingBundle(null);
                    setBundleForm({
                      name: '',
                      description: '',
                      productType: 'BUNDLE',
                      category: 'NORWAY',
                      basePrice: '',
                      retailerCommissionPercentage: 30,
                      stockQuantity: '',
                      status: 'ACTIVE'
                    });
                  }}
                  className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Package size={20} />
                  {editingBundle ? '✏️ Update Bundle' : '🚀 Create Bundle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
