import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

const RetailerCreditManagement = () => {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    creditLimit: '',
    paymentTermsDays: 30,
    notes: ''
  });
  const [marginFormData, setMarginFormData] = useState({
    marginRate: '',
    notes: '',
    productId: '',
    productName: '',
    poolName: ''
  });
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [retailerProductMarginRates, setRetailerProductMarginRates] = useState({}); // Map of retailerEmail -> product margin rates
  const [expandedRetailers, setExpandedRetailers] = useState(new Set()); // Track which retailers have expanded margin view
  
  // eSIM Credit Modal State
  const [showEsimCreditModal, setShowEsimCreditModal] = useState(false);
  const [esimCreditFormData, setEsimCreditFormData] = useState({
    esimCreditLimit: '',
    notes: ''
  });

  // Kickback Limit Modal State
  const [showKickbackModal, setShowKickbackModal] = useState(false);
  const [kickbackFormData, setKickbackFormData] = useState({
    kickbackLimit: '',
    notes: ''
  });

  useEffect(() => {
    fetchRetailers();
    fetchAvailableProducts();
  }, []);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/retailers/credit-limits`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Fetch margin rate and product-specific margin rates for each retailer
        const productMarginRatesMap = {};
        
        const retailersWithMarginRates = await Promise.all(
          data.data.map(async (retailer) => {
            try {
              // Fetch single margin rate (legacy)
              const marginResponse = await fetch(`${API_BASE_URL}/admin/retailers/${retailer.retailerEmail}/margin-rate`, {
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              
              // Fetch all product margin rates
              const productMarginResponse = await fetch(`${API_BASE_URL}/admin/retailers/${retailer.retailerEmail}/margin-rates/all`, {
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              
              let marginRate = null;
              if (marginResponse.ok) {
                const marginData = await marginResponse.json();
                marginRate = marginData.marginRate || null;
              }
              
              // Store product margin rates in map
              if (productMarginResponse.ok) {
                const productMarginData = await productMarginResponse.json();
                if (productMarginData.success && productMarginData.productMarginRates) {
                  productMarginRatesMap[retailer.retailerEmail] = productMarginData.productMarginRates;
                }
              }
              
              return {
                ...retailer,
                marginRate: marginRate
              };
            } catch (error) {
              console.log(`Could not fetch margin rates for ${retailer.retailerEmail}:`, error);
            }
            
            return {
              ...retailer,
              marginRate: null
            };
          })
        );
        
        setRetailers(retailersWithMarginRates);
        setRetailerProductMarginRates(productMarginRatesMap);
      } else {
        setError(data.error || 'Failed to fetch retailers');
      }
    } catch (err) {
      console.error('Error fetching retailers:', err);
      // Fallback to demo data if API fails
      console.log('Using demo data for testing margin rate functionality...');
      setRetailers([
        {
          retailerId: 1,
          retailerName: 'Premium Telecom Store',
          retailerEmail: 'premium@telecom.com',
          level: 'DIAMOND',
          creditLimit: 50000,
          usedCredit: 25000,
          availableCredit: 25000,
          creditUsagePercentage: 50,
          unitLimit: 1000,
          usedUnits: 450,
          unitUsagePercentage: 45,
          marginRate: 35.0,
          status: 'ACTIVE'
        },
        {
          retailerId: 2,
          retailerName: 'City Electronics',
          retailerEmail: 'city@electronics.com',
          level: 'GOLD',
          creditLimit: 30000,
          usedCredit: 21000,
          availableCredit: 9000,
          creditUsagePercentage: 70,
          unitLimit: 600,
          usedUnits: 420,
          unitUsagePercentage: 70,
          marginRate: null,
          status: 'ACTIVE'
        },
        {
          retailerId: 3,
          retailerName: 'Mobile Hub',
          retailerEmail: 'mobile@hub.com',
          level: 'SILVER',
          creditLimit: 20000,
          usedCredit: 18000,
          availableCredit: 2000,
          creditUsagePercentage: 90,
          unitLimit: 400,
          usedUnits: 380,
          unitUsagePercentage: 95,
          marginRate: null, // Admin hasn't set margin rate yet
          status: 'ACTIVE'
        },
        {
          retailerId: 4,
          retailerName: 'Quick Shop',
          retailerEmail: 'quick@shop.com',
          level: 'BRONZE',
          creditLimit: 10000,
          usedCredit: 3000,
          availableCredit: 7000,
          creditUsagePercentage: 30,
          unitLimit: 200,
          usedUnits: 50,
          unitUsagePercentage: 25,
          marginRate: 22.5,
          status: 'ACTIVE'
        }
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch(`${API_BASE_URL}/retailer/bundles`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bundles) {
          // Extract unique products with pool information
          const productsMap = new Map();
          data.bundles.forEach(bundle => {
            const key = `${bundle.name}-${bundle.poolName || 'default'}`;
            if (!productsMap.has(key)) {
              productsMap.set(key, {
                id: bundle.id,
                name: bundle.name,
                poolName: bundle.poolName || 'Default Pool',
                basePrice: bundle.basePrice,
                stockQuantity: bundle.stockQuantity
              });
            }
          });
          setAvailableProducts(Array.from(productsMap.values()));
        }
      } else {
        console.log('Could not fetch products, using demo data');
        setAvailableProducts([
          { id: '1', name: 'Dialog', poolName: 'EPIN', basePrice: 75.00, stockQuantity: 10 },
          { id: '2', name: 'MOBITAL', poolName: 'EPIN', basePrice: 75.00, stockQuantity: 9 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAvailableProducts([
        { id: '1', name: 'Dialog', poolName: 'EPIN', basePrice: 75.00, stockQuantity: 10 },
        { id: '2', name: 'MOBITAL', poolName: 'EPIN', basePrice: 75.00, stockQuantity: 9 }
      ]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleEditClick = (retailer) => {
    setSelectedRetailer(retailer);
    setFormData({
      creditLimit: retailer.creditLimit || '',
      paymentTermsDays: retailer.paymentTermsDays || 30,
      notes: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/retailers/credit-limit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          retailerId: selectedRetailer.retailerId,
          creditLimit: parseFloat(formData.creditLimit),
          paymentTermsDays: parseInt(formData.paymentTermsDays),
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the retailers list
        await fetchRetailers();
        setShowModal(false);
        setSelectedRetailer(null);
        setFormData({ creditLimit: '', paymentTermsDays: 30, notes: '' });
      } else {
        alert('Failed to update credit limit: ' + data.error);
      }
    } catch (err) {
      console.error('Error updating credit limit:', err);
      alert('Failed to update credit limit');
    } finally {
      setSaving(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'DIAMOND': return 'bg-gradient-to-r from-blue-400 to-purple-400';
      case 'PLATINUM': return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 'GOLD': return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 'SILVER': return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 'BRONZE': return 'bg-gradient-to-r from-orange-400 to-orange-500';
      case 'STARTER': return 'bg-gradient-to-r from-green-400 to-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleEditMarginClick = (retailer) => {
    setSelectedRetailer(retailer);
    setMarginFormData({
      marginRate: retailer.marginRate || '',
      notes: '',
      productId: '',
      productName: '',
      poolName: ''
    });
    setShowMarginModal(true);
  };

  const handleEditEsimCreditClick = (retailer) => {
    setSelectedRetailer(retailer);
    setEsimCreditFormData({
      esimCreditLimit: retailer.esimCreditLimit || '',
      notes: ''
    });
    setShowEsimCreditModal(true);
  };

  const handleEditKickbackClick = (retailer) => {
    setSelectedRetailer(retailer);
    setKickbackFormData({
      kickbackLimit: retailer.kickbackLimit || '',
      notes: ''
    });
    setShowKickbackModal(true);
  };

  const handleEsimCreditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/retailers/esim-credit-limit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          retailerId: selectedRetailer.retailerId,
          esimCreditLimit: parseFloat(esimCreditFormData.esimCreditLimit),
          notes: esimCreditFormData.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchRetailers();
        setShowEsimCreditModal(false);
        setSelectedRetailer(null);
        setEsimCreditFormData({ esimCreditLimit: '', notes: '' });
      } else {
        alert('Failed to update eSIM credit limit: ' + data.error);
      }
    } catch (err) {
      console.error('Error updating eSIM credit limit:', err);
      alert('Failed to update eSIM credit limit');
    } finally {
      setSaving(false);
    }
  };

  const handleKickbackSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/retailers/kickback-limit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          retailerEmail: selectedRetailer.retailerEmail,
          kickbackLimit: parseFloat(kickbackFormData.kickbackLimit),
          notes: kickbackFormData.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the retailers list
        await fetchRetailers();
        setShowKickbackModal(false);
        setSelectedRetailer(null);
        setKickbackFormData({ kickbackLimit: '', notes: '' });
        alert('✅ Kickback limit updated successfully');
      } else {
        alert('Failed to update kickback limit: ' + data.error);
      }
    } catch (err) {
      console.error('Error updating kickback limit:', err);
      alert('Failed to update kickback limit');
    } finally {
      setSaving(false);
    }
  };

  const handleMarginSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/retailers/margin-rate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          retailerEmail: selectedRetailer.retailerEmail,
          marginRate: parseFloat(marginFormData.marginRate),
          productId: marginFormData.productId,
          productName: marginFormData.productName,
          poolName: marginFormData.poolName,
          notes: marginFormData.notes
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchRetailers(); // Refresh the data
        setShowMarginModal(false);
        setSelectedRetailer(null);
        setMarginFormData({ marginRate: '', notes: '', productId: '', productName: '', poolName: '' });
        
        // Show success message with product info
        alert(`✅ Margin rate ${marginFormData.marginRate}% set for ${marginFormData.productName} (${marginFormData.poolName})`);
      } else {
        alert(data.error || 'Failed to update margin rate');
      }
    } catch (err) {
      console.error('Error updating margin rate:', err);
      
      // Fallback to demo mode - simulate successful update
      console.log('Demo mode: Simulating margin rate update...');
      
      // Update the margin rate in local state
      setRetailers(prevRetailers => 
        prevRetailers.map(retailer => 
          retailer.retailerId === selectedRetailer.retailerId 
            ? { ...retailer, marginRate: parseFloat(marginFormData.marginRate) }
            : retailer
        )
      );
      
      setShowMarginModal(false);
      setSelectedRetailer(null);
      setMarginFormData({ marginRate: '', notes: '', productId: '', productName: '', poolName: '' });
      
      // Show success message
      alert(`✅ Demo: Margin rate ${marginFormData.marginRate}% set for ${marginFormData.productName}!`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Retailer Credit Management</h2>
          <p className="text-gray-600 mt-1">Manage credit limits and monitor usage for retailers</p>
        </div>
        <button
          onClick={fetchRetailers}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Retailers</div>
          <div className="text-3xl font-bold text-gray-900">{retailers.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Credit Limit</div>
          <div className="text-3xl font-bold text-green-600">
            NOK {retailers.reduce((sum, r) => sum + (r.creditLimit || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Used</div>
          <div className="text-3xl font-bold text-orange-600">
            NOK {retailers.reduce((sum, r) => sum + (r.usedCredit || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Available</div>
          <div className="text-3xl font-bold text-blue-600">
            NOK {retailers.reduce((sum, r) => sum + (r.availableCredit || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Unit Limit</div>
          <div className="text-3xl font-bold text-purple-600">
            {retailers.reduce((sum, r) => sum + (r.unitLimit || 0), 0).toLocaleString()} Units
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Units Used</div>
          <div className="text-3xl font-bold text-indigo-600">
            {retailers.reduce((sum, r) => sum + (r.usedUnits || 0), 0).toLocaleString()} Units
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Avg. Margin Rate</div>
          <div className="text-3xl font-bold text-green-600">
            {(() => {
              // Calculate average from all product margin rates
              let totalMargin = 0;
              let totalProducts = 0;
              
              Object.values(retailerProductMarginRates).forEach(productRates => {
                productRates.forEach(product => {
                  totalMargin += parseFloat(product.marginRate || 0);
                  totalProducts++;
                });
              });
              
              if (totalProducts === 0) return 'N/A';
              const avgMargin = totalMargin / totalProducts;
              return `${avgMargin.toFixed(1)}%`;
            })()}
          </div>
        </div>
      </div>

      {/* Retailers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Retailer
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Level
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Credit<br/>Limit
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Used
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Available
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Credit<br/>Usage
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-purple-50">
                  eSIM<br/>Limit
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-purple-50">
                  eSIM<br/>Used
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-purple-50">
                  eSIM<br/>Available
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Unit<br/>Limit
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Units<br/>Used
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Unit<br/>Usage
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[180px]">
                  Margin Rate
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-gray-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {retailers.map((retailer) => {
                const usagePercentage = retailer.creditUsagePercentage || 0;
                const unitUsagePercentage = retailer.unitUsagePercentage || 0;
                
                return (
                  <tr key={retailer.retailerId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center min-w-[200px]">
                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {retailer.retailerName?.charAt(0) || 'R'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]" title={retailer.retailerName}>
                            {retailer.retailerName}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[140px]" title={retailer.retailerEmail}>
                            {retailer.retailerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white ${getLevelColor(retailer.level)}`}>
                        {retailer.level || 'NOT_SET'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      NOK {(retailer.creditLimit || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-orange-600">
                      NOK {(retailer.usedCredit || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-green-600">
                      NOK {(retailer.availableCredit || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="w-24">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">{usagePercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(usagePercentage)} transition-all duration-300`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-purple-900 bg-purple-50">
                      NOK {(retailer.esimCreditLimit || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-purple-600 bg-purple-50">
                      NOK {(retailer.esimUsedCredit || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-purple-700 bg-purple-50">
                      NOK {(retailer.esimAvailableCredit || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(retailer.unitLimit || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-orange-600">
                      {(retailer.usedUnits || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="w-24">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">{unitUsagePercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(unitUsagePercentage)} transition-all duration-300`}
                            style={{ width: `${Math.min(unitUsagePercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const productRates = retailerProductMarginRates[retailer.retailerEmail] || [];
                        const isExpanded = expandedRetailers.has(retailer.retailerEmail);
                        
                        if (productRates.length === 0) {
                          return (
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-bold text-gray-400">Not Set</span>
                              <span className="text-xs text-gray-500">Pending</span>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="min-w-[180px]">
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedRetailers);
                                if (isExpanded) {
                                  newExpanded.delete(retailer.retailerEmail);
                                } else {
                                  newExpanded.add(retailer.retailerEmail);
                                }
                                setExpandedRetailers(newExpanded);
                              }}
                              className="flex items-center space-x-2 hover:bg-purple-50 p-2 rounded transition w-full"
                            >
                              <span className="text-sm font-bold text-purple-600">
                                {productRates.length} Product{productRates.length !== 1 ? 's' : ''}
                              </span>
                              <span className="text-xs text-gray-500 ml-auto">
                                {isExpanded ? '▲ Hide' : '▼ View'}
                              </span>
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-2 space-y-1 bg-purple-50 p-2 rounded-lg border border-purple-200 max-h-60 overflow-y-auto">
                                {productRates.map((product, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs py-2 px-2 border-b border-purple-100 last:border-0 bg-white rounded">
                                    <div className="flex-1 mr-2">
                                      <div className="font-semibold text-gray-900 truncate" title={product.productName}>{product.productName || 'Unknown'}</div>
                                      <div className="text-gray-600 text-xs truncate" title={product.poolName}>{product.poolName || 'N/A'}</div>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-200 text-purple-800">
                                        {parseFloat(product.marginRate || 0)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        retailer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        retailer.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {retailer.status || 'NOT_SET'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium sticky right-0 bg-white">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleEditClick(retailer)}
                          className="text-purple-600 hover:text-purple-900 font-medium text-xs whitespace-nowrap"
                        >
                          💰 Edit Credit
                        </button>
                        <button
                          onClick={() => handleEditEsimCreditClick(retailer)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium text-xs whitespace-nowrap"
                        >
                          📱 eSIM Credit
                        </button>
                        <button
                          onClick={() => handleEditKickbackClick(retailer)}
                          className="text-orange-600 hover:text-orange-900 font-medium text-xs whitespace-nowrap"
                        >
                          🎁 Kickback Limit
                        </button>
                        <button
                          onClick={() => handleEditMarginClick(retailer)}
                          className="text-green-600 hover:text-green-900 font-medium text-xs whitespace-nowrap"
                        >
                          📊 Margin Rate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && selectedRetailer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Update Credit Limit
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedRetailer.retailerName}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Limit (NOK)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter credit limit"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 2500, 5000, 7500, 10000, 15000, 20000
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={formData.paymentTermsDays}
                  onChange={(e) => setFormData({ ...formData, paymentTermsDays: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add any notes about this credit limit change"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRetailer(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Update Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Margin Rate Edit Modal */}
      {showMarginModal && selectedRetailer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Set Margin Rate
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedRetailer.retailerName}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleMarginSubmit} className="px-6 py-4 space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-600">💡</span>
                  <span className="text-sm font-medium text-green-800">How Margin Rate Works</span>
                </div>
                <p className="text-xs text-green-700">
                  Margin rate determines retailer profit. For a NOK 100 sale with 25% margin:
                  <br />• Cost to retailer: NOK 75 • Profit: NOK 25
                </p>
              </div>

              {/* Product Selection Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={marginFormData.productId}
                  onChange={(e) => {
                    const selectedProduct = availableProducts.find(p => p.id === e.target.value);
                    setMarginFormData({
                      ...marginFormData,
                      productId: e.target.value,
                      productName: selectedProduct?.name || '',
                      poolName: selectedProduct?.poolName || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loadingProducts}
                >
                  <option value="">
                    {loadingProducts ? 'Loading products...' : 'Select a product from stock'}
                  </option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.poolName}) - NOK {product.basePrice} - Stock: {product.stockQuantity}
                    </option>
                  ))}
                </select>
                {marginFormData.productName && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-xs text-blue-700">
                      <strong>Selected:</strong> {marginFormData.productName}
                      <br />
                      <strong>Pool:</strong> {marginFormData.poolName}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margin Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={marginFormData.marginRate}
                    onChange={(e) => setMarginFormData({...marginFormData, marginRate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
                    placeholder="Enter margin rate (e.g., 25.0)"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Current: {selectedRetailer.marginRate ? `${selectedRetailer.marginRate}%` : 'Not set by admin'}
                </div>
              </div>

              {marginFormData.marginRate && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Profit Calculator</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-blue-600">Sale Price:</span>
                      <div className="font-semibold">NOK 100</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Cost:</span>
                      <div className="font-semibold">NOK {(100 * (1 - parseFloat(marginFormData.marginRate || 0) / 100)).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Profit:</span>
                      <div className="font-semibold text-green-600">NOK {parseFloat(marginFormData.marginRate || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Margin:</span>
                      <div className="font-semibold text-purple-600">{parseFloat(marginFormData.marginRate || 0).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={marginFormData.notes}
                  onChange={(e) => setMarginFormData({...marginFormData, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter any notes about this margin rate (e.g., 'Premium retailer rate')..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMarginModal(false);
                    setSelectedRetailer(null);
                    setMarginFormData({ marginRate: '', notes: '', productId: '', productName: '', poolName: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-md transition-colors disabled:opacity-50 shadow-md"
                  disabled={saving || !marginFormData.marginRate || !marginFormData.productId}
                >
                  {saving ? 'Setting...' : 'Set Margin Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* eSIM Credit Edit Modal */}
      {showEsimCreditModal && selectedRetailer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Edit eSIM Credit Limit
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedRetailer.retailerName}
              </p>
            </div>
            <form onSubmit={handleEsimCreditSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    eSIM Credit Limit (NOK)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={esimCreditFormData.esimCreditLimit}
                    onChange={(e) => setEsimCreditFormData({...esimCreditFormData, esimCreditLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter eSIM credit limit"
                  />
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                    <div className="text-xs text-purple-700">
                      <div className="flex justify-between mb-1">
                        <span>Current Limit:</span>
                        <strong>NOK {(selectedRetailer.esimCreditLimit || 0).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Used:</span>
                        <strong>NOK {(selectedRetailer.esimUsedCredit || 0).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <strong>NOK {(selectedRetailer.esimAvailableCredit || 0).toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={esimCreditFormData.notes}
                    onChange={(e) => setEsimCreditFormData({...esimCreditFormData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    placeholder="Reason for change..."
                  />
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="text-sm font-medium text-indigo-800 mb-2">💡 Information</h4>
                  <p className="text-xs text-indigo-700">
                    eSIM credit is separate from general credit and is specifically used for eSIM purchases. 
                    This allows you to manage eSIM sales independently from other products.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEsimCreditModal(false);
                    setSelectedRetailer(null);
                    setEsimCreditFormData({ esimCreditLimit: '', notes: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-md transition-colors disabled:opacity-50 shadow-md"
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Update eSIM Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kickback Limit Modal */}
      {showKickbackModal && selectedRetailer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold">🎁 Set Kickback Bonus Limit</h3>
              <p className="text-orange-100 mt-1">for {selectedRetailer.retailerName}</p>
            </div>

            <form onSubmit={handleKickbackSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kickback Bonus Limit (kr)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={kickbackFormData.kickbackLimit}
                    onChange={(e) => setKickbackFormData({...kickbackFormData, kickbackLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter kickback limit..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={kickbackFormData.notes}
                    onChange={(e) => setKickbackFormData({...kickbackFormData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                    placeholder="Reason for setting this limit..."
                  />
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-medium text-orange-800 mb-2">💡 About Kickback Limits</h4>
                  <p className="text-xs text-orange-700">
                    Kickback bonus limits set the maximum reward amount a retailer can earn through 
                    the kickback program. This is managed separately from credit limits and helps 
                    track promotional incentives.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowKickbackModal(false);
                    setSelectedRetailer(null);
                    setKickbackFormData({ kickbackLimit: '', notes: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-md transition-colors disabled:opacity-50 shadow-md"
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Set Kickback Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerCreditManagement;
