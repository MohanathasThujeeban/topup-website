import React, { useState, useEffect } from 'react';
import { 
  Package, RefreshCw, ShoppingCart, Globe2, Filter, CheckCircle,
  AlertCircle, DollarSign, Box
} from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function RetailerInventoryDisplay() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState(null); // 'EPIN', 'ESIM', or null for all
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const loadInventory = async () => {
      try {
        await fetchInventory(controller.signal, isMounted);
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Error loading inventory:', error);
        }
      }
    };
    
    loadInventory();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const fetchInventory = async (signal = null, isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true);
      }
      
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Use provided signal or create a new one with timeout
      const controller = signal ? { signal } : new AbortController();
      const timeoutId = !signal ? setTimeout(() => controller.abort(), 15000) : null; // 15 second timeout

      const response = await fetch(`${API_BASE_URL}/retailer/inventory`, { 
        headers,
        signal: controller.signal
      });
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Inventory data received:', data);
        
        // Handle new PIN-based inventory structure
        let inventoryList = [];
        if (data.success && data.data && data.data.inventory) {
          inventoryList = data.data.inventory;
        } else if (data.data?.inventory) {
          inventoryList = data.data.inventory;
        } else if (Array.isArray(data)) {
          inventoryList = data;
        }
        
        console.log('📋 Processed inventory:', inventoryList);
        if (isMounted) {
          setInventory(inventoryList);
          setError(''); // Clear any previous errors
        }
      } else {
        console.error('❌ Failed to fetch inventory:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error details:', errorData);
        
        if (isMounted) {
          // Set empty inventory with helpful message
          setInventory([]);
          setError(`Failed to load inventory (${response.status}). ${errorData.message || 'Please try purchasing some bundles first.'}`);
        }
      }
    } catch (error) {
      // Only log and set error if it's not an AbortError and component is still mounted
      if (error.name !== 'AbortError') {
        console.error('💥 Error fetching inventory:', error);
        if (isMounted) {
          setInventory([]);
          setError('Network error. Please check your connection and try again.');
        }
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  // Helper function to get unique prices from inventory
  const getUniquePrices = () => {
    const prices = new Set();
    inventory.forEach(item => {
      if (item.bundlePrice) {
        prices.add(Math.round(item.bundlePrice));
      }
    });
    return Array.from(prices).sort((a, b) => a - b);
  };

  // Helper function to get filtered inventory
  const getFilteredInventory = () => {
    let filtered = inventory;

    // Filter by type
    if (selectedTypeFilter) {
      filtered = filtered.filter(item => item.productType === selectedTypeFilter);
    }

    // Filter by price
    if (selectedPriceFilter) {
      filtered = filtered.filter(item => {
        if (item.bundlePrice) {
          return Math.round(item.bundlePrice) === selectedPriceFilter;
        }
        return false;
      });
    }

    return filtered;
  };

  // Helper function to count items by price
  const getCountByPrice = (price) => {
    return inventory.filter(item => {
      if (item.bundlePrice) {
        return Math.round(item.bundlePrice) === price;
      }
      return false;
    }).length;
  };

  // Helper function to count items by type
  const getCountByType = (type) => {
    return inventory.filter(item => item.productType === type).length;
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const filteredInventory = getFilteredInventory();
  const uniquePrices = getUniquePrices();
  const epinCount = getCountByType('EPIN');
  const esimCount = getCountByType('ESIM');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">My Bundle Inventory</h3>
          <p className="text-sm text-gray-600 mt-1">View and manage your purchased bundles</p>
        </div>
        <button 
          onClick={fetchInventory}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Filter Section */}
      {inventory.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Filter size={16} className="text-blue-600" />
            Filter Your Inventory
          </h4>

          {/* Type Filter */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">By Product Type</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedTypeFilter(null)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  selectedTypeFilter === null
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Box size={16} />
                  <span className="font-semibold">All Types</span>
                  <span className="text-xs opacity-80">({inventory.length})</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedTypeFilter('EPIN')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  selectedTypeFilter === 'EPIN'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  <span className="font-semibold">EPIN</span>
                  <span className="text-xs opacity-80">({epinCount})</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedTypeFilter('ESIM')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  selectedTypeFilter === 'ESIM'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe2 size={16} />
                  <span className="font-semibold">ESIM</span>
                  <span className="text-xs opacity-80">({esimCount})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Price Filter */}
          {uniquePrices.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">By Price Category</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedPriceFilter(null)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedPriceFilter === null
                      ? 'bg-white text-blue-700 border-2 border-blue-600 font-semibold'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  All Prices
                </button>

                {uniquePrices.map((price) => (
                  <button
                    key={price}
                    onClick={() => setSelectedPriceFilter(price)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      selectedPriceFilter === price
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className="font-semibold">{price} NOK</span>
                    <span className="text-xs ml-1 opacity-80">({getCountByPrice(price)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedTypeFilter || selectedPriceFilter) && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-700">
              <CheckCircle size={14} />
              <span>
                Showing {filteredInventory.length} items
                {selectedTypeFilter && ` • Type: ${selectedTypeFilter}`}
                {selectedPriceFilter && ` • Price: ${selectedPriceFilter} NOK`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Inventory Display */}
      {filteredInventory.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No items in inventory</p>
          <p className="text-gray-500 text-sm mb-6">
            {inventory.length === 0 
              ? 'Purchase bundles from the "Buy Bundles" or "Buy eSIMs" tab to add them to your inventory'
              : 'No items match your current filters'}
          </p>
          {inventory.length === 0 && (
            <button 
              onClick={() => window.location.hash = '#bundles'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <ShoppingCart size={16} />
              Browse Bundles
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item, index) => {
            const bundlePrice = item.bundlePrice || 0;

            return (
              <div 
                key={item.bundleId || index} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition border border-gray-100"
              >
                {/* Header with Type Badge */}
                <div className={`p-4 ${
                  item.productType === 'ESIM' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                } text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium flex items-center gap-1">
                      {item.productType === 'ESIM' ? <Globe2 size={14} /> : <Package size={14} />}
                      {item.productType || 'EPIN'}
                    </span>
                    <span className="text-2xl font-bold">NOK {bundlePrice}</span>
                  </div>
                  <h4 className="text-lg font-bold truncate">{item.bundleName}</h4>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bundle ID:</span>
                      <span className="font-mono text-gray-900 text-xs">{item.bundleId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available PINs:</span>
                      <span className="font-semibold text-gray-900">{item.availablePins || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-semibold text-blue-600">NOK {bundlePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-semibold text-green-600">NOK {((item.availablePins || 0) * bundlePrice).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold ${item.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>
                        {item.status || 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  {/* PINs Section */}
                  {item.pins && item.pins.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        PINs Available: {item.pins.length}
                      </p>
                      <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                        <div className="space-y-1">
                          {item.pins.slice(0, 3).map((pinItem, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-mono text-gray-600">
                              <Package size={12} className="text-gray-400" />
                              <span className="truncate">
                                {pinItem.pin ? pinItem.pin.substring(0, 20) + '...' : 'PIN-' + idx}
                              </span>
                            </div>
                          ))}
                          {item.pins.length > 3 && (
                            <p className="text-xs text-gray-500 mt-2">
                              +{item.pins.length - 3} more PINs
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium transition">
                    <ShoppingCart size={16} />
                    Sell to Customer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
