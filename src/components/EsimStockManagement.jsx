import React, { useState, useEffect } from 'react';
import {
  Package, Upload, Download, Filter, Search, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle, Eye, Edit,
  Trash2, FileText, Database, TrendingUp, Box, Zap, Image
} from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function EsimStockManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stockPools, setStockPools] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // File upload states
  const [uploadingEsims, setUploadingEsims] = useState(false);
  
  // Pool metadata form states
  const [showPoolForm, setShowPoolForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedQRFiles, setSelectedQRFiles] = useState([]);
  const [poolMetadata, setPoolMetadata] = useState({
    poolName: '',
    type: 'ESIM',
    productType: 'Bundle plans',
    networkProvider: 'Lycamobile',
    totalStock: '',
    available: '',
    status: 'ACTIVE',
    productId: '',
    notes: '',
    price: ''
  });

  useEffect(() => {
    fetchStockData();
    fetchStatistics();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/stock/pools`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only eSIM type pools
        const esimPools = data.filter(pool => pool.stockType === 'ESIM');
        setStockPools(esimPools);
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

  const handleEsimUpload = () => {
    setShowPoolForm(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Auto-detect eSIM count from CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          // Subtract 1 for header row
          const esimCount = Math.max(0, lines.length - 1);
          
          // Auto-fill totalStock with detected count
          setPoolMetadata(prev => ({
            ...prev,
            totalStock: esimCount.toString(),
            available: esimCount.toString()
          }));
          
          console.log(`Auto-detected ${esimCount} eSIMs from CSV`);
        } catch (error) {
          console.error('Error parsing CSV:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleQRFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedQRFiles(files);
    console.log(`Selected ${files.length} QR code images`);
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

    // Auto-generate productId if not provided
    const productId = poolMetadata.productId || `ESIM-PROD-${Date.now()}`;
    
    // Encode all metadata as a single JSON string
    const metadata = JSON.stringify({
      poolName: poolMetadata.poolName,
      productType: poolMetadata.productType,
      networkProvider: poolMetadata.networkProvider,
      productId: productId,
      price: poolMetadata.price,
      notes: poolMetadata.notes || ''
    });
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('metadata', metadata);
    
    // Append QR code images if selected
    if (selectedQRFiles.length > 0) {
      selectedQRFiles.forEach((qrFile, index) => {
        formData.append('qrCodes', qrFile);
      });
      console.log(`📤 Uploading ${selectedQRFiles.length} QR code images`);
    }
    
    console.log('📤 Uploading eSIM stock with parameters:', {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      qrCodeCount: selectedQRFiles.length,
      metadata: JSON.parse(metadata)
    });

    try {
      const token = localStorage.getItem('token');
      const endpoint = `${API_BASE_URL}/admin/stock/esims/bulk-upload`;

      setUploadingEsims(true);

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
        const successMsg = `✅ eSIM Stock Pool Created Successfully!\n\n` +
          `📦 Pool Name: ${poolMetadata.poolName}\n` +
          `💰 Price: ${poolMetadata.price} NOK\n` +
          `📊 Total eSIMs: ${poolMetadata.totalStock}\n` +
          `📸 QR Codes: ${selectedQRFiles.length}\n` +
          `🔐 All data encrypted and stored securely`;
        alert(successMsg);
        
        // Reset form
        setShowPoolForm(false);
        setSelectedFile(null);
        setSelectedQRFiles([]);
        setPoolMetadata({
          poolName: '',
          type: 'ESIM',
          productType: 'Bundle plans',
          networkProvider: 'Lycamobile',
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
        const error = await response.json().catch(() => ({ error: 'Unknown error', message: response.statusText }));
        console.error('❌ Upload failed:', error);
        
        const errorMsg = error.message || error.error || error.hint || 'Upload failed';
        const details = [];
        if (error.error) details.push(`Error: ${error.error}`);
        if (error.message) details.push(`Message: ${error.message}`);
        if (error.hint) details.push(`Hint: ${error.hint}`);
        
        alert(`Upload failed!\n\n${details.join('\n')}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload file: ${error.message}\n\nPlease check:\n- File is not empty\n- File format is correct CSV\n- All required fields are filled`);
    } finally {
      setUploadingEsims(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template with eSIM structure
    const csvContent = `iccid,activation_code,pin_1,puk_1,pin_2,puk_2
8.94723E+18,LPA:1$dp-plus-par07-0,0,23512557,0,51484788
8.94723E+18,LPA:1$dp-plus-par07-0,0,91169804,0,11838166
8.94723E+18,LPA:1$dp-plus-par07-0,0,17324628,0,30855481
8.94723E+18,LPA:1$dp-plus-par07-0,0,56725383,0,59210443
8.94723E+18,LPA:1$dp-plus-par07-0,0,22472872,0,7049321`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'esim-upload-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredPools = stockPools.filter(pool => {
    const matchesType = filterType === 'all' || pool.stockType === filterType;
    const matchesSearch = pool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pool.productId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="text-indigo-600" size={28} />
            eSIM Stock Management
          </h2>
          <p className="text-gray-500 mt-1">Manage eSIM inventory with QR codes</p>
        </div>
        <button
          onClick={fetchStockData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics?.esims && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total eSIMs</h3>
              <Package size={20} className="opacity-75" />
            </div>
            <p className="text-3xl font-bold">{statistics.esims.total?.toLocaleString() || 0}</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Available</h3>
              <CheckCircle size={20} className="opacity-75" />
            </div>
            <p className="text-3xl font-bold">{statistics.esims.available?.toLocaleString() || 0}</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Used</h3>
              <Zap size={20} className="opacity-75" />
            </div>
            <p className="text-3xl font-bold">{statistics.esims.used?.toLocaleString() || 0}</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Usage Rate</h3>
              <TrendingUp size={20} className="opacity-75" />
            </div>
            <p className="text-3xl font-bold">{statistics.esims.usagePercentage?.toFixed(1) || 0}%</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="text-indigo-600" size={20} />
          Upload eSIM Stock
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleEsimUpload}
            disabled={uploadingEsims}
            className="flex flex-col items-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="text-purple-600 mb-2" size={32} />
            <span className="text-sm font-medium text-center">
              {uploadingEsims ? 'Uploading...' : 'Upload eSIM CSV + QR Codes'}
            </span>
            <span className="text-xs text-gray-500 mt-1">CSV with ICCID, Activation Code, PINs & PUKs</span>
          </button>

          <button
            onClick={downloadTemplate}
            className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Download className="text-blue-600 mb-2" size={32} />
            <span className="text-sm font-medium text-center">Download Template</span>
            <span className="text-xs text-gray-500 mt-1">eSIM CSV Template</span>
          </button>
        </div>
      </div>

      {/* Stock Pools Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">eSIM Stock Pools ({filteredPools.length})</h3>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by pool name or product ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pool Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (NOK)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPools.length > 0 ? (
                filteredPools.map((pool) => (
                  <tr key={pool.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="text-purple-500 mr-2" size={16} />
                        <span className="text-sm font-medium text-gray-900">{pool.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {pool.networkProvider || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {pool.productType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pool.price || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {pool.totalQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        {pool.availableQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pool.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pool.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Package size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No eSIM pools found</p>
                    <p className="text-sm text-gray-400 mt-1">Upload your first eSIM stock to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Form Modal */}
      {showPoolForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-lg p-2">
                  <Package size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Upload eSIM Stock Pool</h3>
                  <p className="text-purple-100 text-sm">
                    Upload CSV file with eSIM data and QR code images
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPoolForm(false);
                  setSelectedFile(null);
                  setSelectedQRFiles([]);
                  setPoolMetadata({
                    poolName: '',
                    type: 'ESIM',
                    productType: 'Bundle plans',
                    networkProvider: 'Lycamobile',
                    totalStock: '',
                    available: '',
                    status: 'ACTIVE',
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

            <div className="p-6 space-y-6">
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

              {/* QR Code Upload Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Image size={20} className="text-purple-600" />
                  Upload QR Code Images (Optional)
                </h4>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-white transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleQRFilesSelect}
                    className="hidden"
                  />
                  {selectedQRFiles.length > 0 ? (
                    <div className="text-center">
                      <Image className="text-green-600 mx-auto mb-2" size={32} />
                      <p className="text-sm font-medium text-gray-900">{selectedQRFiles.length} QR code(s) selected</p>
                      <p className="text-xs text-gray-500 mt-1">Click to change files</p>
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        {selectedQRFiles.map((file, idx) => (
                          <p key={idx} className="text-xs text-gray-600">{file.name}</p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Image className="text-purple-400 mx-auto mb-2" size={32} />
                      <p className="text-sm font-medium text-gray-700">Click to select QR code images</p>
                      <p className="text-xs text-gray-500 mt-1">Select multiple images (one per eSIM)</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Form Fields */}
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
                    placeholder="e.g., lycamobile-esim-10gb"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Network Provider <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={poolMetadata.networkProvider}
                    onChange={(e) => setPoolMetadata({...poolMetadata, networkProvider: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="Lycamobile">📱 Lycamobile</option>
                    <option value="Mycall">📞 Mycall</option>
                    <option value="Telia">📶 Telia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <input
                    type="text"
                    value="eSIM"
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50"
                  />
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
                  />
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
                  />
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
                    <option value="INACTIVE">❌ Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID (Optional)
                </label>
                <input
                  type="text"
                  value={poolMetadata.productId}
                  onChange={(e) => setPoolMetadata({...poolMetadata, productId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Auto-generated if left empty"
                />
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
                  placeholder="e.g., Norway 10GB eSIM Bundle"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">CSV Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Required Columns:</strong> <code className="bg-white px-2 py-1 rounded text-xs">iccid, activation_code</code></li>
                  <li>• <strong>Optional Columns:</strong> <code className="bg-white px-2 py-1 rounded text-xs">pin_1, puk_1, pin_2, puk_2</code></li>
                  <li>• ICCID: International Circuit Card Identifier</li>
                  <li>• Activation Code: LPA string for eSIM activation</li>
                  <li>• PIN/PUK: SIM card security codes</li>
                  <li>• All sensitive data will be encrypted automatically</li>
                  <li>• QR codes will be matched to eSIMs in order</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t rounded-b-2xl">
              <button
                onClick={() => {
                  setShowPoolForm(false);
                  setSelectedFile(null);
                  setSelectedQRFiles([]);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitUpload}
                disabled={!selectedFile || uploadingEsims}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingEsims ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload eSIM Stock
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
