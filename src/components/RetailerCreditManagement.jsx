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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRetailers();
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
        setRetailers(data.data);
      } else {
        setError(data.error || 'Failed to fetch retailers');
      }
    } catch (err) {
      console.error('Error fetching retailers:', err);
      setError('Failed to load retailer data');
    } finally {
      setLoading(false);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

      {/* Retailers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retailer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {retailers.map((retailer) => {
                const usagePercentage = retailer.creditUsagePercentage || 0;
                
                return (
                  <tr key={retailer.retailerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {retailer.retailerName?.charAt(0) || 'R'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {retailer.retailerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {retailer.retailerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${getLevelColor(retailer.level)}`}>
                        {retailer.level || 'NOT_SET'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      NOK {(retailer.creditLimit || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                      NOK {(retailer.usedCredit || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      NOK {(retailer.availableCredit || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        retailer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        retailer.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {retailer.status || 'NOT_SET'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(retailer)}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                      >
                        ✏️ Edit Limit
                      </button>
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
    </div>
  );
};

export default RetailerCreditManagement;
