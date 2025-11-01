import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, X, Upload, Calendar, Tag, DollarSign, 
  Percent, Users, Package, TrendingUp, AlertCircle, CheckCircle, 
  Clock, Image as ImageIcon, Gift, Target, Award, Save, RefreshCw
} from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function PromotionCampaignManager() {
  const [activeTab, setActiveTab] = useState('promotions');
  const [promotions, setPromotions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState([]);
  
  // Form states for Promotion
  const [promotionForm, setPromotionForm] = useState({
    promoCode: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderValue: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    usageLimitPerUser: '1',
    applicableProductTypes: [],
    applicableUserTypes: [],
    isPublic: true,
    isFeatured: false,
    bannerImageUrl: '',
    termsAndConditions: ''
  });

  // Form states for Campaign
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    rewardType: 'POINTS',
    rewardValue: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    minOrderValue: '',
    applicableProductTypes: [],
    isReferralCampaign: false,
    isFeatured: false,
    bannerImageUrl: '',
    termsAndConditions: '',
    tiers: []
  });

  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'promotions') {
        const response = await fetch(`${API_BASE_URL}/admin/promotions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setPromotions(data.data || []);
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/admin/rewards`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setUploadingImage(true);

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      
      // Update form with image URL (in real app, upload to cloud storage)
      if (activeTab === 'promotions') {
        setPromotionForm({ ...promotionForm, bannerImageUrl: reader.result });
      } else {
        setCampaignForm({ ...campaignForm, bannerImageUrl: reader.result });
      }
      
      setUploadingImage(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleCreatePromotion = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!promotionForm.promoCode || !promotionForm.name || !promotionForm.discountValue) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/promotions`, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...promotionForm,
          discountValue: parseFloat(promotionForm.discountValue),
          maxDiscountAmount: promotionForm.maxDiscountAmount ? parseFloat(promotionForm.maxDiscountAmount) : null,
          minOrderValue: promotionForm.minOrderValue ? parseFloat(promotionForm.minOrderValue) : null,
          usageLimit: promotionForm.usageLimit ? parseInt(promotionForm.usageLimit) : null,
          usageLimitPerUser: parseInt(promotionForm.usageLimitPerUser)
        })
      });

      if (response.ok) {
        alert(`Promotion ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save promotion');
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert('An error occurred while saving the promotion');
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!campaignForm.name || !campaignForm.rewardValue) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/rewards`, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...campaignForm,
          rewardValue: parseFloat(campaignForm.rewardValue),
          totalBudget: campaignForm.totalBudget ? parseFloat(campaignForm.totalBudget) : null,
          minOrderValue: campaignForm.minOrderValue ? parseFloat(campaignForm.minOrderValue) : null
        })
      });

      if (response.ok) {
        alert(`Campaign ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save campaign');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('An error occurred while saving the campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'promotions' 
        ? `${API_BASE_URL}/admin/promotions/${id}`
        : `${API_BASE_URL}/admin/rewards/${id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        alert('Deleted successfully!');
        fetchData();
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('An error occurred while deleting');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'promotions'
        ? `${API_BASE_URL}/admin/promotions/${id}/toggle`
        : `${API_BASE_URL}/admin/rewards/${id}/toggle`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        alert('Status updated successfully!');
        fetchData();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setPromotionForm({
      promoCode: '',
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      maxDiscountAmount: '',
      minOrderValue: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      usageLimitPerUser: '1',
      applicableProductTypes: [],
      applicableUserTypes: [],
      isPublic: true,
      isFeatured: false,
      bannerImageUrl: '',
      termsAndConditions: ''
    });
    
    setCampaignForm({
      name: '',
      description: '',
      rewardType: 'POINTS',
      rewardValue: '',
      startDate: '',
      endDate: '',
      totalBudget: '',
      minOrderValue: '',
      applicableProductTypes: [],
      isReferralCampaign: false,
      isFeatured: false,
      bannerImageUrl: '',
      termsAndConditions: '',
      tiers: []
    });
    
    setImagePreview('');
    setSelectedItem(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setModalMode('edit');
    
    if (activeTab === 'promotions') {
      setPromotionForm({
        ...item,
        startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 16) : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 16) : ''
      });
    } else {
      setCampaignForm({
        ...item,
        startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 16) : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 16) : ''
      });
    }
    
    setImagePreview(item.bannerImageUrl || '');
    setShowModal(true);
  };

  const StatCard = ({ title, value, icon: Icon, color, badge }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {badge && (
            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promotions & Campaigns</h2>
          <p className="text-gray-600 mt-1">Manage promotional offers and reward campaigns</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Create {activeTab === 'promotions' ? 'Promotion' : 'Campaign'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'promotions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Tag size={18} />
            Promotions ({promotions.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'campaigns'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Award size={18} />
            Reward Campaigns ({campaigns.length})
          </div>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {activeTab === 'promotions' ? (
          <>
            <StatCard
              title="Total Promotions"
              value={promotions.length}
              icon={Tag}
              color="bg-gradient-to-br from-blue-600 to-blue-700"
            />
            <StatCard
              title="Active Promotions"
              value={promotions.filter(p => p.isActive).length}
              icon={CheckCircle}
              color="bg-gradient-to-br from-green-600 to-green-700"
            />
            <StatCard
              title="Featured"
              value={promotions.filter(p => p.isFeatured).length}
              icon={Target}
              color="bg-gradient-to-br from-purple-600 to-purple-700"
            />
            <StatCard
              title="Total Usage"
              value={promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0)}
              icon={TrendingUp}
              color="bg-gradient-to-br from-yellow-600 to-yellow-700"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Campaigns"
              value={campaigns.length}
              icon={Award}
              color="bg-gradient-to-br from-blue-600 to-blue-700"
            />
            <StatCard
              title="Active Campaigns"
              value={campaigns.filter(c => c.status === 'ACTIVE').length}
              icon={CheckCircle}
              color="bg-gradient-to-br from-green-600 to-green-700"
            />
            <StatCard
              title="Featured"
              value={campaigns.filter(c => c.isFeatured).length}
              icon={Target}
              color="bg-gradient-to-br from-purple-600 to-purple-700"
            />
            <StatCard
              title="Rewards Distributed"
              value={campaigns.reduce((sum, c) => sum + (c.rewardsDistributed || 0), 0)}
              icon={Gift}
              color="bg-gradient-to-br from-yellow-600 to-yellow-700"
            />
          </>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : activeTab === 'promotions' ? (
        <PromotionList 
          promotions={promotions} 
          onEdit={openEditModal}
          onDelete={handleDelete}
          onToggle={handleToggleStatus}
        />
      ) : (
        <CampaignList 
          campaigns={campaigns}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onToggle={handleToggleStatus}
        />
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          activeTab={activeTab}
          mode={modalMode}
          promotionForm={promotionForm}
          campaignForm={campaignForm}
          setPromotionForm={setPromotionForm}
          setCampaignForm={setCampaignForm}
          imagePreview={imagePreview}
          uploadingImage={uploadingImage}
          onImageUpload={handleImageUpload}
          onSave={activeTab === 'promotions' ? handleCreatePromotion : handleCreateCampaign}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          products={products}
        />
      )}
    </div>
  );
}

// Promotion List Component
function PromotionList({ promotions, onEdit, onDelete, onToggle }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promo Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promotions.length > 0 ? promotions.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {promo.bannerImageUrl && (
                      <img 
                        src={promo.bannerImageUrl} 
                        alt="" 
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-mono font-bold text-indigo-600">{promo.promoCode}</div>
                      {promo.isFeatured && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{promo.name}</div>
                  <div className="text-sm text-gray-500">{promo.description?.substring(0, 50)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600">
                    {promo.discountType === 'PERCENTAGE' 
                      ? `${promo.discountValue}%` 
                      : `NOK ${promo.discountValue}`}
                  </div>
                  <div className="text-xs text-gray-500">{promo.discountType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(promo.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    to {new Date(promo.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {promo.usageCount || 0} / {promo.usageLimit || '∞'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    promo.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : promo.status === 'SCHEDULED'
                      ? 'bg-blue-100 text-blue-800'
                      : promo.status === 'EXPIRED'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {promo.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggle(promo.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Toggle Status"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(promo)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(promo.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Tag size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No promotions found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Campaign List Component
function CampaignList({ campaigns, onEdit, onDelete, onToggle }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distributed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.length > 0 ? campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {campaign.bannerImageUrl && (
                      <img 
                        src={campaign.bannerImageUrl} 
                        alt="" 
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.description?.substring(0, 50)}...</div>
                      {campaign.isFeatured && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded mt-1">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-purple-600">
                    {campaign.rewardType === 'POINTS' 
                      ? `${campaign.rewardValue} Points`
                      : campaign.rewardType === 'CASHBACK_PERCENTAGE'
                      ? `${campaign.rewardValue}% Cashback`
                      : `NOK ${campaign.rewardValue}`}
                  </div>
                  <div className="text-xs text-gray-500">{campaign.rewardType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    NOK {campaign.totalBudget?.toLocaleString() || 'Unlimited'}
                  </div>
                  {campaign.budgetUsed && (
                    <div className="text-xs text-gray-500">
                      Used: NOK {campaign.budgetUsed.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(campaign.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    to {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {campaign.rewardsDistributed || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : campaign.status === 'SCHEDULED'
                      ? 'bg-blue-100 text-blue-800'
                      : campaign.status === 'ENDED'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggle(campaign.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Toggle Status"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(campaign)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(campaign.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Award size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No campaigns found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ 
  activeTab, mode, promotionForm, campaignForm, setPromotionForm, setCampaignForm,
  imagePreview, uploadingImage, onImageUpload, onSave, onClose, products 
}) {
  const form = activeTab === 'promotions' ? promotionForm : campaignForm;
  const setForm = activeTab === 'promotions' ? setPromotionForm : setCampaignForm;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create' : 'Edit'} {activeTab === 'promotions' ? 'Promotion' : 'Campaign'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'promotions' ? (
            <PromotionForm 
              form={form}
              setForm={setForm}
              imagePreview={imagePreview}
              uploadingImage={uploadingImage}
              onImageUpload={onImageUpload}
              products={products}
            />
          ) : (
            <CampaignForm
              form={form}
              setForm={setForm}
              imagePreview={imagePreview}
              uploadingImage={uploadingImage}
              onImageUpload={onImageUpload}
              products={products}
            />
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save size={16} />
            {mode === 'create' ? 'Create' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Promotion Form Component
function PromotionForm({ form, setForm, imagePreview, uploadingImage, onImageUpload, products }) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promo Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.promoCode}
            onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="SUMMER2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promotion Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Summer Sale 2024"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe this promotion..."
        />
      </div>

      {/* Discount Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
            <option value="FREE_SHIPPING">Free Shipping</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Value <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount (NOK)</label>
          <input
            type="number"
            value={form.maxDiscountAmount}
            onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="100"
          />
        </div>
      </div>

      {/* Order Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Value (NOK)</label>
          <input
            type="number"
            value={form.minOrderValue}
            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit Per User</label>
          <input
            type="number"
            value={form.usageLimitPerUser}
            onChange={(e) => setForm({ ...form, usageLimitPerUser: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="1"
          />
        </div>
      </div>

      {/* Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
              {uploadingImage ? (
                <div className="text-gray-500">Uploading...</div>
              ) : imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                  <p className="text-sm text-gray-500 mt-2">Click to change image</p>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">Click to upload banner image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Public (visible to all users)</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Featured</span>
        </label>
      </div>

      {/* Terms and Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
        <textarea
          value={form.termsAndConditions}
          onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter terms and conditions..."
        />
      </div>
    </div>
  );
}

// Campaign Form Component
function CampaignForm({ form, setForm, imagePreview, uploadingImage, onImageUpload, products }) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Holiday Rewards Campaign"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type</label>
          <select
            value={form.rewardType}
            onChange={(e) => setForm({ ...form, rewardType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="POINTS">Points</option>
            <option value="CASHBACK_PERCENTAGE">Cashback (Percentage)</option>
            <option value="CASHBACK_FIXED">Cashback (Fixed)</option>
            <option value="DISCOUNT_COUPON">Discount Coupon</option>
            <option value="FREE_PRODUCT">Free Product</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe this campaign..."
        />
      </div>

      {/* Reward Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reward Value <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.rewardValue}
            onChange={(e) => setForm({ ...form, rewardValue: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget (NOK)</label>
          <input
            type="number"
            value={form.totalBudget}
            onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="10000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Value (NOK)</label>
          <input
            type="number"
            value={form.minOrderValue}
            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="50"
          />
        </div>
      </div>

      {/* Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
              {uploadingImage ? (
                <div className="text-gray-500">Uploading...</div>
              ) : imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                  <p className="text-sm text-gray-500 mt-2">Click to change image</p>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">Click to upload banner image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isReferralCampaign}
            onChange={(e) => setForm({ ...form, isReferralCampaign: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Referral Campaign</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Featured</span>
        </label>
      </div>

      {/* Terms and Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
        <textarea
          value={form.termsAndConditions}
          onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter terms and conditions..."
        />
      </div>
    </div>
  );
}
