import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Package, DollarSign, TrendingUp, Clock, 
  AlertCircle, CheckCircle, Eye, Edit, Plus, Search, RefreshCw,
  ShoppingCart, Award, Activity, Bell, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// API Base URL - should match AuthContext
const API_BASE_URL = 'http://localhost:8080/api';

const RetailerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'offline'

  useEffect(() => {
    fetchRetailerData();
  }, []);

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
          const basicTest = await fetch(`${API_BASE_URL}/admin/analytics`, { headers });
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
          ? 'bg-blue-600 text-white' 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center">
              <ShoppingCart />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">Retailer Dashboard</div>
              <div className="text-sm text-gray-600">Manage your business operations</div>
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
              onClick={() => fetchRetailerData()}
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
              id="orders"
              label="Orders"
              icon={ShoppingCart}
              active={activeTab === 'orders'}
              onClick={setActiveTab}
              badge={analytics.pendingOrders}
            />
            <TabButton
              id="products"
              label="Products"
              icon={Package}
              active={activeTab === 'products'}
              onClick={setActiveTab}
            />
            <TabButton
              id="analytics"
              label="Analytics"
              icon={BarChart3}
              active={activeTab === 'analytics'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Orders"
                value={analytics.totalOrders?.toLocaleString() || '0'}
                change={analytics.orderGrowth || 0}
                icon={ShoppingCart}
                color="bg-gradient-to-br from-blue-600 to-blue-700"
              />
              <StatCard
                title="Total Revenue"
                value={`NOK ${analytics.totalRevenue?.toLocaleString() || '0'}`}
                change={analytics.monthlyGrowth || 0}
                icon={DollarSign}
                color="bg-gradient-to-br from-green-600 to-green-700"
              />
              <StatCard
                title="Pending Orders"
                value={analytics.pendingOrders || 0}
                icon={Clock}
                color="bg-gradient-to-br from-yellow-600 to-yellow-700"
                description="Awaiting processing"
              />
              <StatCard
                title="Success Rate"
                value={analytics.successRate ? `${analytics.successRate}%` : '0%'}
                change={analytics.successRateGrowth || 0}
                icon={Award}
                color="bg-gradient-to-br from-purple-600 to-purple-700"
                description="Order completion rate"
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
                  <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <Plus className="text-blue-600 mb-2" size={24} />
                    <span className="text-sm font-medium">New Order</span>
                  </button>
                  <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
                    <Package className="text-green-600 mb-2" size={24} />
                    <span className="text-sm font-medium">View Products</span>
                  </button>
                  <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
                    <BarChart3 className="text-purple-600 mb-2" size={24} />
                    <span className="text-sm font-medium">View Reports</span>
                  </button>
                  <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors">
                    <Users className="text-orange-600 mb-2" size={24} />
                    <span className="text-sm font-medium">Customers</span>
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
                            <p className="text-sm text-gray-600">{order.productName || 'Product Order'}</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
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

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Product Catalog</h3>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Plus size={16} />
                  Add Product
                </button>
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
              {products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">NOK {product.price?.toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No products found</p>
                  <p className="text-sm text-gray-400">
                    {connectionStatus === 'connected' 
                      ? 'Products will appear here once retailer endpoints are implemented'
                      : 'Products will appear here once backend is connected'
                    }
                  </p>
                </div>
              )}
            </div>
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
                  Top Products
                </h4>
                {analytics.topProducts && analytics.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topProducts.slice(0, 3).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.sales} sales</p>
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
                    <p className="text-gray-500 text-sm">No product data</p>
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
      </div>
    </div>
  );
};

export default RetailerDashboard;
