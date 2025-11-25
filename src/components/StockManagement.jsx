import React, { useState, useEffect } from 'react';
import {
  Package, Upload, Download, Filter, Search, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle, Eye, Edit,
  Trash2, FileText, Database, TrendingUp, Box, Zap
} from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function StockManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stockPools, setStockPools] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // File upload states
  const [uploadingPins, setUploadingPins] = useState(false);
  const [uploadingEsims, setUploadingEsims] = useState(false);
  
  // Pool metadata form states
  const [showPoolForm, setShowPoolForm] = useState(false);
  const [uploadType, setUploadType] = useState(''); // 'pin' or 'esim'
  const [selectedFile, setSelectedFile] = useState(null);
  const [poolMetadata, setPoolMetadata] = useState({
    poolName: '',
    type: 'EPIN',
    totalStock: '',
    available: '',
    status: 'ACTIVE',
    productId: '',
    notes: '',
    price: ''
  });

  useEffect(() => {
    // Test if stock endpoint is available
    testStockEndpoint();
    fetchStockData();
    fetchStatistics();
  }, [filterType]);

  const testStockEndpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/stock/test`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Stock Controller is available:', data);
      } else {
        console.error('❌ Stock Controller test failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Stock Controller not reachable:', error);
    }
  };

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/admin/stock/pools`;
      
      if (filterType !== 'all') {
        url += `?type=${filterType}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Stock pools fetched:', data);
        // Backend returns array directly, not wrapped in object
        setStockPools(Array.isArray(data) ? data : (data.stockPools || []));
      } else {
        console.error('Failed to fetch stock data');
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/stock/usage-report`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handlePinUpload = () => {
    // Open form without file selection first
    setUploadType('pin');
    setShowPoolForm(true);
  };

  const handleEsimUpload = () => {
    // Open form without file selection first
    setUploadType('esim');
    setShowPoolForm(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Auto-detect PIN count from CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          // Subtract 1 for header row
          const pinCount = Math.max(0, lines.length - 1);
          
          // Auto-fill totalStock with detected count
          setPoolMetadata(prev => ({
            ...prev,
            totalStock: pinCount.toString(),
            available: pinCount.toString()
          }));
          
          console.log(`Auto-detected ${pinCount} PINs from CSV`);
        } catch (error) {
          console.error('Error parsing CSV:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const submitUpload = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file to upload');
      return;
    }
    
    if (!poolMetadata.poolName || !poolMetadata.totalStock || !poolMetadata.price) {
      alert('Please fill in Pool Name, Total Stock, and Price');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('poolName', poolMetadata.poolName);
    formData.append('type', poolMetadata.type);
    formData.append('totalStock', poolMetadata.totalStock);
    formData.append('available', poolMetadata.available || poolMetadata.totalStock);
    formData.append('status', poolMetadata.status);
    formData.append('productId', poolMetadata.productId);
    formData.append('notes', poolMetadata.notes);
    formData.append('price', poolMetadata.price);

    try {
      const token = localStorage.getItem('token');
      const endpoint = uploadType === 'pin' 
        ? `${API_BASE_URL}/admin/stock/pins/bulk-upload`
        : `${API_BASE_URL}/admin/stock/esims/bulk-upload`;

      if (uploadType === 'pin') {
        setUploadingPins(true);
      } else {
        setUploadingEsims(true);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message with stock card details
        if (result.stockCards && result.stockCards.length > 0) {
          const card = result.stockCards[0];
          const successMsg = `✅ Stock Pool Created Successfully!\n\n` +
            `📦 Pool Name: ${card.poolName}\n` +
            `💰 Price: ${card.price} NOK\n` +
            `📊 Total Units: ${card.unitCount}\n` +
            `✓ Available: ${card.availableCount}\n` +
            `🔐 All ${card.unitCount} PINs encrypted and stored securely`;
          alert(successMsg);
        } else {
          alert(`Successfully uploaded ${result.totalImported} ${uploadType === 'pin' ? 'PINs' : 'eSIMs'}!`);
        }
        
        // Reset form
        setShowPoolForm(false);
        setSelectedFile(null);
        setPoolMetadata({
          poolName: '',
          type: 'EPIN',
          totalStock: '',
          available: '',
          status: 'ACTIVE',
          productId: '',
          notes: '',
          price: ''
        });
        
        fetchStockData();
        fetchStatistics();
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingPins(false);
      setUploadingEsims(false);
    }
  };

  const downloadTemplate = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const url = type === 'pin' 
        ? `${API_BASE_URL}/admin/stock/pins/template`
        : `${API_BASE_URL}/admin/stock/esims/template`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const template = await response.json();
        
        // Create CSV content
        const headers = template.headers.join(',');
        const example = template.example.map(row => row.join(',')).join('\n');
        const csvContent = `${headers}\n${example}`;
        
        // Download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${type}_template.csv`;
        link.click();
      }
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className={trend >= 0 ? 'text-green-600' : 'text-red-600'} />
              <span className={`text-sm ml-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}% usage
              </span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl ${color} text-white flex items-center justify-center`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total PINs"
          value={statistics?.pins?.total?.toLocaleString() || '0'}
          subtitle={`${statistics?.pins?.available || 0} available`}
          icon={FileText}
          color="bg-gradient-to-br from-blue-600 to-blue-700"
          trend={statistics?.pins?.usagePercentage}
        />
        <StatCard
          title="Total eSIMs"
          value={statistics?.esims?.total?.toLocaleString() || '0'}
          subtitle={`${statistics?.esims?.available || 0} available`}
          icon={Package}
          color="bg-gradient-to-br from-purple-600 to-purple-700"
          trend={statistics?.esims?.usagePercentage}
        />
        <StatCard
          title="Stock Pools"
          value={statistics?.totalStockPools || '0'}
          subtitle="Active pools"
          icon={Database}
          color="bg-gradient-to-br from-green-600 to-green-700"
        />
        <StatCard
          title="Low Stock Alerts"
          value={statistics?.lowStockAlerts || '0'}
          subtitle="Needs attention"
          icon={AlertCircle}
          color="bg-gradient-to-br from-red-600 to-red-700"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="text-indigo-600" size={20} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handlePinUpload}
            disabled={uploadingPins}
            className="flex flex-col items-center p-4 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="text-indigo-600 mb-2" size={24} />
            <span className="text-sm font-medium text-center">
              {uploadingPins ? 'Uploading...' : 'Upload PINs CSV'}
            </span>
          </button>

          <button
            onClick={handleEsimUpload}
            disabled={uploadingEsims}
            className="flex flex-col items-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="text-purple-600 mb-2" size={24} />
            <span className="text-sm font-medium text-center">
              {uploadingEsims ? 'Uploading...' : 'Upload eSIMs CSV'}
            </span>
          </button>

          <button
            onClick={() => downloadTemplate('pin')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Download className="text-blue-600 mb-2" size={24} />
            <span className="text-sm font-medium">PIN Template</span>
          </button>

          <button
            onClick={() => downloadTemplate('esim')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <Download className="text-green-600 mb-2" size={24} />
            <span className="text-sm font-medium">eSIM Template</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {statistics?.lowStockPools && statistics.lowStockPools.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {statistics.lowStockPools.map((pool, index) => {
              // Determine if it's eSIM based on:
              // 1. stockType field (if available)
              // 2. Pool name containing 'esim', 'e-sim', 'lyca' (common eSIM provider)
              const poolName = pool.name?.toLowerCase() || '';
              const isEsim = pool.stockType === 'ESIM' || 
                           pool.stockType === 'esim' ||
                           poolName.includes('esim') ||
                           poolName.includes('e-sim') ||
                           poolName.includes('lyca');
              
              console.log('Pool:', pool.name, '| Type field:', pool.stockType, '| Detected as:', isEsim ? 'eSIM' : 'ePIN');
              
              return (
                <div key={index} className="bg-white p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{pool.name}</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        isEsim
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isEsim ? 'eSIM' : 'ePIN'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Product ID: {pool.productId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{pool.availableQuantity || pool.itemsLeft}</p>
                    <p className="text-sm text-gray-500">items left</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderStockPools = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Stock</option>
            <option value="EPIN">PINs Only</option>
            <option value="ESIM">eSIMs Only</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={() => { fetchStockData(); fetchStatistics(); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stock Pools Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-2" size={32} />
                    <p className="text-gray-500">Loading stock data...</p>
                  </td>
                </tr>
              ) : stockPools && stockPools.length > 0 ? (
                stockPools
                  .filter(pool => 
                    searchQuery === '' || 
                    pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    pool.productId?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((pool) => (
                    <tr key={pool.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            pool.stockType === 'EPIN' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {pool.stockType === 'EPIN' ? (
                              <FileText size={20} className="text-blue-600" />
                            ) : (
                              <Package size={20} className="text-purple-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{pool.name}</div>
                            <div className="text-sm text-gray-500">ID: {pool.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pool.stockType === 'EPIN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {pool.stockType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pool.totalQuantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {pool.availableQuantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {pool.usedQuantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {pool.reservedQuantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pool.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : pool.status === 'DEPLETED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pool.status === 'ACTIVE' && <CheckCircle size={12} className="mr-1" />}
                          {pool.status === 'DEPLETED' && <XCircle size={12} className="mr-1" />}
                          {pool.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert(`Pool Details:\nName: ${pool.name}\nType: ${pool.stockType}\nTotal: ${pool.totalQuantity}\nAvailable: ${pool.availableQuantity}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Edit Pool"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete Pool"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Box size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No stock pools found</p>
                    <p className="text-sm text-gray-400">Upload CSV files to add stock</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('pools')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pools'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Stock Pools
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' ? renderOverview() : renderStockPools()}

      {/* Pool Metadata Form Modal */}
      {showPoolForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Package size={24} />
                    Pool Information
                  </h3>
                  <p className="text-indigo-100 mt-1">
                    Please provide details for this stock pool
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPoolForm(false);
                    setSelectedFile(null);
                    setPoolMetadata({
                      poolName: '',
                      type: 'EPIN',
                      productId: '',
                      notes: '',
                      price: ''
                    });
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* CSV File Upload Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Upload size={20} className="text-indigo-600" />
                  Upload CSV File
                </h4>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-white transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="text-center">
                      <FileText className="text-green-600 mx-auto mb-2" size={32} />
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="text-indigo-400 mx-auto mb-2" size={32} />
                      <p className="text-sm font-medium text-gray-700">Click to select CSV file</p>
                      <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pool Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={poolMetadata.poolName}
                    onChange={(e) => setPoolMetadata({...poolMetadata, poolName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., lyca10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={poolMetadata.type}
                    onChange={(e) => setPoolMetadata({...poolMetadata, type: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="EPIN">🔢 ePIN</option>
                    <option value="ESIM">📶 eSIM</option>
                    <option value="Data bundle">📦 Data Bundle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={poolMetadata.totalStock}
                    onChange={(e) => setPoolMetadata({...poolMetadata, totalStock: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Auto-detected from CSV"
                    readOnly
                    title="Auto-filled from CSV file"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-detected from CSV</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available
                  </label>
                  <input
                    type="number"
                    value={poolMetadata.available}
                    onChange={(e) => setPoolMetadata({...poolMetadata, available: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="Same as Total Stock"
                    readOnly
                    title="Auto-filled from CSV file"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-detected from CSV</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (NOK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={poolMetadata.price}
                    onChange={(e) => setPoolMetadata({...poolMetadata, price: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 99.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={poolMetadata.status}
                    onChange={(e) => setPoolMetadata({...poolMetadata, status: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="ACTIVE">✅ Active</option>
                    <option value="INACTIVE">⏸️ Inactive</option>
                    <option value="DEPLETED">❌ Depleted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={poolMetadata.productId}
                    onChange={(e) => setPoolMetadata({...poolMetadata, productId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 674245cf95fc9e3e08b29fac"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={poolMetadata.notes}
                  onChange={(e) => setPoolMetadata({...poolMetadata, notes: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Norway 10GB Bundle"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">CSV Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Headers:</strong> <code className="bg-white px-2 py-1 rounded text-xs">PIN ID, PINS</code></li>
                  <li>• <strong>PIN ID:</strong> Serial number or identifier for the PIN</li>
                  <li>• <strong>PINS:</strong> The actual PIN number (16 digits)</li>
                  <li>• Both columns are required</li>
                  <li>• CSV will be automatically counted for Total Stock</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => {
                  setShowPoolForm(false);
                  setSelectedFile(null);
                  setPoolMetadata({
                    poolName: '',
                    type: 'EPIN',
                    totalStock: '',
                    available: '',
                    status: 'ACTIVE',
                    productId: '',
                    notes: '',
                    price: ''
                  });
                }}
                className="px-6 py-2 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitUpload}
                disabled={!selectedFile || !poolMetadata.poolName || !poolMetadata.totalStock || !poolMetadata.price || uploadingPins || uploadingEsims}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingPins || uploadingEsims ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload & Create Pool
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
