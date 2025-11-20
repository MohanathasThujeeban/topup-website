import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, AlertCircle, CheckCircle, RefreshCw, Globe2
} from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function RetailerEsimPurchase() {
  const [loading, setLoading] = useState(true);
  const [esimBundles, setEsimBundles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchasingBundleId, setPurchasingBundleId] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    fetchEsimBundles();
  }, []);

  const fetchEsimBundles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${API_BASE_URL}/retailer/bundles`, { headers });

      if (response.ok) {
        const data = await response.json();
        // Filter only ESIM bundles
        const esimOnly = (data.bundles || []).filter(bundle => bundle.productType === 'ESIM');
        setEsimBundles(esimOnly);
      }
    } catch (error) {
      console.error('Error fetching eSIM bundles:', error);
      setError('Failed to load eSIM bundles');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPurchase = async (bundle, quantity) => {
    if (!bundle || !quantity) return;

    try {
      setPurchasingBundleId(bundle.id);
      setPurchasing(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      
      const requestBody = {
        productId: bundle.id,
        quantity: quantity
      };
      
      console.log('🛒 [eSIM] Direct purchase:', requestBody);
      console.log('📦 [eSIM] Bundle:', bundle);
      
      const response = await fetch(`${API_BASE_URL}/retailer/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 [eSIM] Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('📥 [eSIM] Response data:', data);
      } catch (parseError) {
        console.error('❌ [eSIM] Failed to parse response:', parseError);
        const textResponse = await response.text();
        console.error('📄 [eSIM] Raw response:', textResponse);
        throw new Error('Server returned invalid response');
      }

      if (response.ok && data.success) {
        setSuccess(`✅ eSIM purchase successful! ${data.itemsAllocated || quantity} eSIM items added to your inventory.`);
        
        // Close modal and refresh data
        setShowPurchaseModal(false);
        await fetchEsimBundles();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorMessage = data.message || data.error || `Purchase failed with status ${response.status}`;
        console.error('❌ [eSIM] Purchase failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('💥 [eSIM] Purchase error:', error);
      setError('Purchase failed: ' + error.message);
    } finally {
      setPurchasing(false);
      setPurchasingBundleId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading eSIM bundles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-3" size={20} />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Globe2 className="text-green-600" size={32} />
                Buy eSIM Bundles
              </h1>
              <p className="text-gray-600">Purchase eSIM bundles directly - Simple and fast</p>
            </div>
            <button
              onClick={fetchEsimBundles}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* eSIM Bundles Grid */}
        {esimBundles.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Globe2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No eSIM bundles available</p>
            <p className="text-gray-500 text-sm">eSIM bundles will appear here once admin adds them to the catalog</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {esimBundles.map((bundle) => (
              <div key={bundle.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium flex items-center gap-1">
                      <Globe2 size={14} />
                      ESIM
                    </span>
                    <span className="text-2xl font-bold">NOK {bundle.basePrice}</span>
                  </div>
                  <h3 className="text-lg font-bold">{bundle.name}</h3>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>
                  
                  <div className="mb-4">
                    {bundle.dataAmount && (
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Data</span>
                        <span className="font-semibold text-gray-900">{bundle.dataAmount}</span>
                      </div>
                    )}
                    {bundle.validity && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Validity</span>
                        <span className="font-semibold text-gray-900">{bundle.validity}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBundle(bundle);
                      setPurchaseQuantity(1);
                      setShowPurchaseModal(true);
                    }}
                    disabled={bundle.stockQuantity === 0}
                    className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      bundle.stockQuantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {bundle.stockQuantity === 0 ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Out of Stock
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Buy Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Purchase Modal with Quantity Selector */}
        {showPurchaseModal && selectedBundle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
                  <Globe2 size={24} />
                  Select eSIM Quantity
                </h3>
                <p className="text-green-100">{selectedBundle.name}</p>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many eSIMs would you like to purchase?
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                      disabled={purchaseQuantity <= 1}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedBundle.stockQuantity}
                      value={purchaseQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setPurchaseQuantity(Math.min(Math.max(1, val), selectedBundle.stockQuantity));
                      }}
                      className="flex-1 px-4 py-3 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      onClick={() => setPurchaseQuantity(Math.min(selectedBundle.stockQuantity, purchaseQuantity + 1))}
                      disabled={purchaseQuantity >= selectedBundle.stockQuantity}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700"
                    >
                      +
                    </button>
                  </div>

                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Unit Price</span>
                    <span className="font-semibold">NOK {selectedBundle.basePrice}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold">{purchaseQuantity}</span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Amount</span>
                      <span className="font-bold text-green-600 text-2xl">
                        NOK {(selectedBundle.basePrice * purchaseQuantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPurchaseModal(false);
                      setError('');
                    }}
                    disabled={purchasing}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDirectPurchase(selectedBundle, purchaseQuantity)}
                    disabled={purchasing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Purchase
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Modal - Removed, using direct one-click purchase instead */}
      </div>
    </div>
  );
}
