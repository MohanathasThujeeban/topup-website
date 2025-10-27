import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Smartphone, Package, Download, RefreshCw, Clock, 
  CheckCircle, XCircle, Eye, Star, Gift, Phone, MessageCircle,
  User, Settings, LogOut, QrCode, CreditCard, History, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock data for customer dashboard
const MOCK_CUSTOMER_DATA = {
  currentPlan: {
    name: 'Lyca Smart XL',
    data: '30GB',
    validity: '30 days',
    price: 'kr99.00',
    originalPrice: 'kr225.00',
    discount: '3 Months Price Discount !',
    features: [
      'Unlimited national minutes',
      'Unlimited minutes to UK, EU, USA, Canada, India and China',
      '30GB EU Roaming Data',
      'eSIM available'
    ],
    renewalDate: '2025-11-25',
    status: 'Active'
  },
  phoneNumber: '+47 123 456 789',
  dataUsage: {
    used: '15.2GB',
    remaining: '14.8GB',
    percentage: 51
  },
  recentPurchases: [
    {
      id: 'ORD-12345',
      date: '2025-10-15T12:31:00Z',
      plan: 'Lyca Smart XL',
      amount: 'kr99.00',
      status: 'Completed',
      type: 'PIN'
    },
    {
      id: 'ORD-12346',
      date: '2025-10-10T09:05:00Z',
      plan: 'Lyca Smart S',
      amount: 'kr99.00',
      status: 'Completed',
      type: 'eSIM'
    }
  ],
  availablePlans: [
    {
      id: 1,
      name: 'Lyca Smart S',
      data: '1GB',
      price: 'kr99.00',
      validity: '30 days',
      features: [
        'Unlimited national minutes',
        '100* Minutes to United Kingdom and more',
        '1GB EU Roaming Data'
      ],
      popular: false
    },
    {
      id: 2,
      name: 'Lyca Smart XL',
      data: '30GB',
      price: 'kr99.00',
      originalPrice: 'kr225.00',
      validity: '30 days',
      discount: '3 Months Price Discount !',
      features: [
        'Unlimited national minutes',
        'Unlimited minutes to UK, EU, USA, Canada, India and China',
        '30GB EU Roaming Data'
      ],
      popular: true
    }
  ]
};

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [customerData, setCustomerData] = useState(MOCK_CUSTOMER_DATA);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );

  const PlanCard = ({ plan, isCurrent = false }) => (
    <div className={`relative bg-white rounded-3xl border-2 ${isCurrent ? 'border-green-300 bg-green-50' : 'border-gray-200'} hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      {/* Discount Badge */}
      {plan.discount && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
          {plan.discount}
        </div>
      )}
      
      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
          Current Plan
        </div>
      )}

      <div className="p-6 pt-16">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        
        {/* Data Display */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-12 bg-green-500 rounded-full"></div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{plan.data}</div>
            <div className="text-sm text-gray-600">Data</div>
          </div>
          <div className="ml-auto text-right">
            {plan.originalPrice && (
              <div className="text-sm line-through text-gray-400">{plan.originalPrice}</div>
            )}
            <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
            <div className="text-sm text-gray-600">/{plan.validity}</div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="text-green-500" size={16} />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isCurrent ? (
            <>
              <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-2xl font-medium text-sm">
                View Details
              </button>
              <button className="flex-1 py-2 bg-green-500 text-white rounded-2xl font-medium text-sm">
                Renew Plan
              </button>
            </>
          ) : (
            <>
              <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-2xl font-medium text-sm">
                Add to basket
              </button>
              <button className="flex-1 py-2 bg-green-500 text-white rounded-2xl font-medium text-sm">
                Buy now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Account</h1>
                <p className="text-sm text-gray-600">{customerData.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
                <Settings size={16} className="inline mr-2" />
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium"
              >
                <LogOut size={16} className="inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Smartphone },
            { id: 'plans', label: 'Available Plans', icon: Package },
            { id: 'history', label: 'Purchase History', icon: History },
            { id: 'rewards', label: 'Rewards', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Current Plan Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Current Plan</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {customerData.currentPlan.status}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Plan Details */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {customerData.currentPlan.name}
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {customerData.currentPlan.data}
                      </div>
                      <div className="text-sm text-gray-600">Data</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {customerData.currentPlan.price}
                      </div>
                      <div className="text-sm text-gray-600">/{customerData.currentPlan.validity}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Renews on: {new Date(customerData.currentPlan.renewalDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Data Usage */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Data Usage</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Used: {customerData.dataUsage.used}</span>
                      <span>Remaining: {customerData.dataUsage.remaining}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${customerData.dataUsage.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">{customerData.dataUsage.percentage}% used</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Renew Plan
                </button>
                <button className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Upgrade Plan
                </button>
                <button className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Add Add-on
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard
                icon={Package}
                title="Active Plans"
                value="1"
                subtitle="Current subscription"
                color="blue"
              />
              <StatCard
                icon={Download}
                title="Total Purchases"
                value={customerData.recentPurchases.length}
                subtitle="This month"
                color="green"
              />
              <StatCard
                icon={Star}
                title="Loyalty Points"
                value="450"
                subtitle="Available to redeem"
                color="purple"
              />
            </div>

            {/* Recent Purchases */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Purchases</h2>
              <div className="space-y-4">
                {customerData.recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        {purchase.type === 'eSIM' ? <QrCode className="text-blue-600" size={20} /> : <Phone className="text-blue-600" size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{purchase.plan}</p>
                        <p className="text-sm text-gray-600">Order #{purchase.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{purchase.amount}</p>
                      <p className="text-sm text-gray-600">{new Date(purchase.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Available Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Plans</h2>
              <p className="text-gray-600">Choose the perfect plan for your needs</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {customerData.availablePlans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  isCurrent={plan.name === customerData.currentPlan.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Purchase History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Purchase History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.recentPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">#{purchase.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{purchase.plan}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{purchase.amount}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{new Date(purchase.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {purchase.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Loyalty Rewards</h2>
            <div className="text-center py-12">
              <Gift size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon!</h3>
              <p className="text-gray-600">We're working on an exciting rewards program for you.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;