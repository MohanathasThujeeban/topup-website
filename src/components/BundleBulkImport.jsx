import React, { useState } from 'react';
import { 
  Package, DollarSign, Plus, Trash2, Eye, Edit, Save, X, CheckCircle,
  Globe, Smartphone, Wifi, Clock, Star, Shield
} from 'lucide-react';

const BundleBulkImport = ({ onClose, onImport }) => {
  const [bundles, setBundles] = useState([]);
  const [currentBundle, setCurrentBundle] = useState({
    name: '',
    description: '',
    productType: 'BUNDLE',
    category: 'NORWAY', 
    basePrice: '',
    retailerCommissionPercentage: 30,
    stockQuantity: '',
    validity: '30',
    dataAmount: '',
    serviceId: '',
    features: '',
    status: 'ACTIVE'
  });
  const [editingIndex, setEditingIndex] = useState(-1);

  // Preset bundle templates based on Norwegian telecom market research
  const presetBundles = [
    {
      name: 'Telenor Prepaid Smart S',
      description: '2GB data, unlimited calls/SMS within Norway',
      productType: 'BUNDLE',
      category: 'NORWAY',
      basePrice: 149,
      validity: '30',
      dataAmount: '2GB',
      serviceId: 'TLN-SMART-S-002',
      features: 'Unlimited calls/SMS in Norway, 2GB 4G/5G data, EU roaming included'
    },
    {
      name: 'Ice Mobile Stor L',
      description: '20GB data with unlimited calls to Nordic countries',
      productType: 'BUNDLE', 
      category: 'NORDIC',
      basePrice: 349,
      validity: '30',
      dataAmount: '20GB',
      serviceId: 'ICE-STOR-L-020',
      features: 'Unlimited calls Nordic, 20GB high-speed data, Music streaming included'
    },
    {
      name: 'Lycamobile Global eSIM',
      description: 'Global eSIM with 10GB data for 150+ countries',
      productType: 'ESIM',
      category: 'GLOBAL',
      basePrice: 499,
      validity: '30',
      dataAmount: '10GB',
      serviceId: 'LYC-GLOBAL-E10',
      features: '150+ countries, Instant activation, No physical SIM needed'
    },
    {
      name: 'Telia Prepaid Medium',
      description: '8GB data with premium network quality',
      productType: 'BUNDLE',
      category: 'NORWAY',
      basePrice: 249,
      validity: '30', 
      dataAmount: '8GB',
      serviceId: 'TEL-PREP-M-008',
      features: 'Premium Telia network, 8GB data, Free Telia TV streaming'
    },
    {
      name: 'OneCall Europe Travel',
      description: 'European travel bundle with 15GB roaming data',
      productType: 'BUNDLE',
      category: 'EUROPE',
      basePrice: 399,
      validity: '30',
      dataAmount: '15GB',
      serviceId: 'ONC-EUR-T-015',
      features: 'EU roaming, 15GB data, Calls to 50+ countries included'
    },
    {
      name: 'Lebara International Plus', 
      description: 'International calling with 5GB data',
      productType: 'BUNDLE',
      category: 'GLOBAL',
      basePrice: 199,
      validity: '30',
      dataAmount: '5GB',
      serviceId: 'LEB-INTL-P-005',
      features: 'Cheap international calls, 5GB data, Multi-language support'
    }
  ];

  const addBundle = () => {
    if (!currentBundle.name || !currentBundle.basePrice || !currentBundle.stockQuantity) {
      alert('Please fill in required fields: Bundle Name, Base Price, and Stock Quantity');
      return;
    }
    
    const newBundle = {
      ...currentBundle,
      id: Date.now().toString(),
      basePrice: parseFloat(currentBundle.basePrice),
      stockQuantity: parseInt(currentBundle.stockQuantity),
      retailerCommissionPercentage: parseFloat(currentBundle.retailerCommissionPercentage)
    };
    
    if (editingIndex >= 0) {
      const updatedBundles = [...bundles];
      updatedBundles[editingIndex] = newBundle;
      setBundles(updatedBundles);
      setEditingIndex(-1);
    } else {
      setBundles([...bundles, newBundle]);
    }
    
    setCurrentBundle({
      name: '',
      description: '',
      productType: 'BUNDLE',
      category: 'NORWAY', 
      basePrice: '',
      retailerCommissionPercentage: 30,
      stockQuantity: '',
      validity: '30',
      dataAmount: '',
      serviceId: '',
      features: '',
      status: 'ACTIVE'
    });
  };

  const editBundle = (index) => {
    setCurrentBundle(bundles[index]);
    setEditingIndex(index);
  };

  const deleteBundle = (index) => {
    setBundles(bundles.filter((_, i) => i !== index));
  };

  const loadPreset = (preset) => {
    setCurrentBundle({
      ...preset,
      retailerCommissionPercentage: 30,
      stockQuantity: '100',
      status: 'ACTIVE'
    });
  };

  const submitBundles = () => {
    if (bundles.length === 0) {
      alert('Please add at least one bundle');
      return;
    }
    
    onImport(bundles);
    onClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleEditBundle = (bundle) => {
    setEditingBundle({ ...bundle });
  };

  const handleSaveEdit = () => {
    setImportedBundles(prev => 
      prev.map(bundle => 
        bundle.id === editingBundle.id ? editingBundle : bundle
      )
    );
    setEditingBundle(null);
  };

  const handleDeleteBundle = (bundleId) => {
    setImportedBundles(prev => prev.filter(bundle => bundle.id !== bundleId));
  };

  const calculateWholesalePrice = (basePrice, margin = 30) => {
    return (basePrice * (100 - margin) / 100).toFixed(2);
  };

  const handlePriceChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    if (field === 'basePrice') {
      setEditingBundle(prev => ({
        ...prev,
        basePrice: numValue,
        wholesalePrice: calculateWholesalePrice(numValue, prev.retailerCommissionPercentage)
      }));
    } else if (field === 'retailerCommissionPercentage') {
      setEditingBundle(prev => ({
        ...prev,
        retailerCommissionPercentage: numValue,
        wholesalePrice: calculateWholesalePrice(prev.basePrice, numValue)
      }));
    }
  };

  const handleImportConfirm = () => {
    onImport(importedBundles);
    setImportStep('success');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const BundleCard = ({ bundle, isEditing = false }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {isEditing ? (
        // Edit Mode
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={editingBundle.name}
                onChange={(e) => setEditingBundle(prev => ({ ...prev, name: e.target.value }))}
                className="text-lg font-semibold w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <textarea
                value={editingBundle.description}
                onChange={(e) => setEditingBundle(prev => ({ ...prev, description: e.target.value }))}
                className="text-sm text-gray-600 w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
              />
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleSaveEdit}
                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
              >
                <Save size={16} />
              </button>
              <button
                onClick={() => setEditingBundle(null)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Amount</label>
              <input
                type="text"
                value={editingBundle.dataAmount}
                onChange={(e) => setEditingBundle(prev => ({ ...prev, dataAmount: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validity</label>
              <input
                type="text"
                value={editingBundle.validity}
                onChange={(e) => setEditingBundle(prev => ({ ...prev, validity: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price (NOK)</label>
              <input
                type="number"
                value={editingBundle.basePrice}
                onChange={(e) => handlePriceChange('basePrice', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Margin (%)</label>
              <input
                type="number"
                value={editingBundle.retailerCommissionPercentage}
                onChange={(e) => handlePriceChange('retailerCommissionPercentage', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale Price (NOK)</label>
              <input
                type="number"
                value={editingBundle.wholesalePrice}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number"
              value={editingBundle.stockQuantity}
              onChange={(e) => setEditingBundle(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      ) : (
        // Display Mode
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm text-gray-500 font-medium">{bundle.name}</div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditBundle(bundle)}
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => handleDeleteBundle(bundle.id)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">{bundle.dataAmount}</span>
              <span className="text-lg font-semibold text-blue-600">kr{bundle.basePrice}.00</span>
            </div>
            <div className="text-sm text-gray-600">Data</div>
            <div className="text-sm text-gray-500">/{bundle.validity}</div>
          </div>

          <div className="space-y-2 mb-6">
            {bundle.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Retail Price:</span>
              <span className="font-semibold text-gray-900">NOK {bundle.basePrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Wholesale Price:</span>
              <span className="font-semibold text-green-600">NOK {bundle.wholesalePrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Retailer Margin:</span>
              <span className="font-semibold text-purple-600">{bundle.retailerCommissionPercentage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stock:</span>
              <span className="font-semibold text-blue-600">{bundle.stockQuantity} units</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              Preview
            </button>
            <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
              Include
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Bundle Management</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Bundle Form */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="text-indigo-600" size={20} />
                Add New Bundle
              </h3>
              
              {/* Quick Presets */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Templates:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {presetBundles.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => loadPreset(preset)}
                      className="p-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      <div className="text-gray-500">NOK {preset.basePrice}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bundle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentBundle.name}
                    onChange={(e) => setCurrentBundle({...currentBundle, name: e.target.value})}
                    placeholder="e.g., Telenor Smart S"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service ID</label>
                  <input
                    type="text" 
                    value={currentBundle.serviceId}
                    onChange={(e) => setCurrentBundle({...currentBundle, serviceId: e.target.value})}
                    placeholder="e.g., TLN-SMART-S-002"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                  <select
                    value={currentBundle.productType}
                    onChange={(e) => setCurrentBundle({...currentBundle, productType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BUNDLE">Data Bundle</option>
                    <option value="ESIM">eSIM</option>
                    <option value="EPIN">ePIN</option>
                    <option value="TOPUP">Top-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={currentBundle.category}
                    onChange={(e) => setCurrentBundle({...currentBundle, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="NORWAY">Norway</option>
                    <option value="NORDIC">Nordic</option>
                    <option value="EUROPE">Europe</option>
                    <option value="GLOBAL">Global</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (NOK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentBundle.basePrice}
                    onChange={(e) => setCurrentBundle({...currentBundle, basePrice: e.target.value})}
                    placeholder="149.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={currentBundle.stockQuantity}
                    onChange={(e) => setCurrentBundle({...currentBundle, stockQuantity: e.target.value})}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Amount</label>
                  <input
                    type="text"
                    value={currentBundle.dataAmount}
                    onChange={(e) => setCurrentBundle({...currentBundle, dataAmount: e.target.value})}
                    placeholder="e.g., 5GB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Validity (days)</label>
                  <select
                    value={currentBundle.validity}
                    onChange={(e) => setCurrentBundle({...currentBundle, validity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={2}
                  value={currentBundle.description}
                  onChange={(e) => setCurrentBundle({...currentBundle, description: e.target.value})}
                  placeholder="Describe the bundle features and benefits..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <textarea
                  rows={2}
                  value={currentBundle.features}
                  onChange={(e) => setCurrentBundle({...currentBundle, features: e.target.value})}
                  placeholder="e.g., Unlimited calls in Norway, EU roaming included"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Pricing Preview */}
              {currentBundle.basePrice && (
                <div className="bg-white border border-indigo-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    Pricing Preview
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Retail Price:</span>
                      <div className="font-medium text-lg">NOK {parseFloat(currentBundle.basePrice || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Wholesale:</span>
                      <div className="font-medium text-green-600 text-lg">
                        NOK {(parseFloat(currentBundle.basePrice || 0) * 0.7).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Margin:</span>
                      <div className="font-medium text-purple-600 text-lg">30%</div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={addBundle}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={20} />
                {editingIndex >= 0 ? 'Update Bundle' : 'Add Bundle'}
              </button>
            </div>
          </div>

          {/* Bundle List */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="text-indigo-600" size={20} />
                Added Bundles ({bundles.length})
              </h3>
              {bundles.length > 0 && (
                <button
                  onClick={submitBundles}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Submit {bundles.length} Bundle{bundles.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bundles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Package size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No bundles added yet</p>
                  <p className="text-sm text-gray-400">Add your first bundle using the form</p>
                </div>
              ) : (
                bundles.map((bundle, index) => (
                  <div key={bundle.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            {bundle.productType === 'ESIM' ? <Smartphone size={16} className="text-indigo-600" /> :
                             bundle.productType === 'BUNDLE' ? <Wifi size={16} className="text-indigo-600" /> :
                             <Package size={16} className="text-indigo-600" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{bundle.name}</h4>
                            <p className="text-xs text-gray-500">{bundle.serviceId}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{bundle.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-green-600">
                            <DollarSign size={14} />
                            NOK {bundle.basePrice}
                          </span>
                          <span className="flex items-center gap-1 text-blue-600">
                            <Package size={14} />
                            {bundle.stockQuantity} units
                          </span>
                          {bundle.dataAmount && (
                            <span className="flex items-center gap-1 text-purple-600">
                              <Wifi size={14} />
                              {bundle.dataAmount}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-orange-600">
                            <Clock size={14} />
                            {bundle.validity} days
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => editBundle(index)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteBundle(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleBulkImport;