import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Smartphone, Package, Download, RefreshCw, Clock, 
  CheckCircle, XCircle, Eye, Star, Gift, Phone, MessageCircle,
  User, Settings, LogOut, QrCode, CreditCard, History, Award, Tag,
  Menu, X, BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FeaturedPromotions from '../components/FeaturedPromotions';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [customerData, setCustomerData] = useState(MOCK_CUSTOMER_DATA);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Sidebar Navigation Item Component
  const SidebarNavItem = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 scale-105' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-102'
      }`}
    >
      {/* Animated background for active state */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient"></div>
      )}
      
      {/* Icon with bounce animation */}
      <Icon size={20} className={`flex-shrink-0 relative z-10 transition-transform duration-300 ${
        active ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'
      }`} />
      
      {/* Label */}
      {sidebarOpen && (
        <span className={`font-medium flex-1 text-left relative z-10 transition-all duration-300 ${
          active ? 'translate-x-0' : 'group-hover:translate-x-1'
        }`}>
          {label}
        </span>
      )}
      
      {/* Hover effect line */}
      {!active && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-600 to-purple-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-r-full"></div>
      )}
    </button>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`text-${color}-600 w-5 h-5 sm:w-6 sm:h-6`} />
        </div>
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>}
    </div>
  );

  const PlanCard = ({ plan, isCurrent = false }) => (
    <div className={`relative bg-white rounded-3xl border-2 ${isCurrent ? 'border-green-300 bg-green-50' : 'border-gray-200'} hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      {/* Discount Badge */}
      {plan.discount && (
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold z-10">
          {plan.discount}
        </div>
      )}
      
      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-green-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold z-10">
          Current Plan
        </div>
      )}

      <div className="p-4 sm:p-6 pt-12 sm:pt-16">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        
        {/* Data Display */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-10 sm:h-12 bg-green-500 rounded-full"></div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{plan.data}</div>
            <div className="text-xs sm:text-sm text-gray-600">Data</div>
          </div>
          <div className="ml-auto text-right">
            {plan.originalPrice && (
              <div className="text-xs sm:text-sm line-through text-gray-400">{plan.originalPrice}</div>
            )}
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{plan.price}</div>
            <div className="text-xs sm:text-sm text-gray-600">/{plan.validity}</div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
              <CheckCircle className="text-green-500 flex-shrink-0" size={14} />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {isCurrent ? (
            <>
              <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-2xl font-medium text-xs sm:text-sm">
                View Details
              </button>
              <button className="flex-1 py-2 bg-green-500 text-white rounded-2xl font-medium text-xs sm:text-sm">
                Renew Plan
              </button>
            </>
          ) : (
            <>
              <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-2xl font-medium text-xs sm:text-sm">
                Add to basket
              </button>
              <button className="flex-1 py-2 bg-green-500 text-white rounded-2xl font-medium text-xs sm:text-sm">
                Buy now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-xl`}>
        {/* Logo & Brand */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg animate-pulse-slow">
                  <User size={20} />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">My Account</h1>
                  <p className="text-[10px] text-gray-500">EasyTopup.no</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg mx-auto">
              <Menu size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarOpen ? (
            <>
              <SidebarNavItem
                id="overview"
                label="Dashboard"
                icon={BarChart3}
                active={activeTab === 'overview'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="plans"
                label="Plans"
                icon={Package}
                active={activeTab === 'plans'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="offers"
                label="Offers"
                icon={Tag}
                active={activeTab === 'offers'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="history"
                label="History"
                icon={History}
                active={activeTab === 'history'}
                onClick={setActiveTab}
              />
              <SidebarNavItem
                id="rewards"
                label="Rewards"
                icon={Award}
                active={activeTab === 'rewards'}
                onClick={setActiveTab}
              />
            </>
          ) : (
            <>
              <button onClick={() => setActiveTab('overview')} className={`w-full p-3 rounded-xl ${activeTab === 'overview' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <BarChart3 size={20} />
              </button>
              <button onClick={() => setActiveTab('plans')} className={`w-full p-3 rounded-xl ${activeTab === 'plans' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Package size={20} />
              </button>
              <button onClick={() => setActiveTab('offers')} className={`w-full p-3 rounded-xl ${activeTab === 'offers' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Tag size={20} />
              </button>
              <button onClick={() => setActiveTab('history')} className={`w-full p-3 rounded-xl ${activeTab === 'history' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <History size={20} />
              </button>
              <button onClick={() => setActiveTab('rewards')} className={`w-full p-3 rounded-xl ${activeTab === 'rewards' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Award size={20} />
              </button>
            </>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'plans' && 'Plans'}
                {activeTab === 'offers' && 'Offers'}
                {activeTab === 'history' && 'History'}
                {activeTab === 'rewards' && 'Rewards'}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {customerData.phoneNumber}
              </div>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Settings">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Content */}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Current Plan Status */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Current Plan</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                  {customerData.currentPlan.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Plan Details */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {customerData.currentPlan.name}
                  </h3>
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                        {customerData.currentPlan.data}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Data</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {customerData.currentPlan.price}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">/{customerData.currentPlan.validity}</div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Renews on: {new Date(customerData.currentPlan.renewalDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Data Usage */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Data Usage</h4>
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

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
                <button className="flex-1 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
                  Renew Plan
                </button>
                <button className="flex-1 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                  Upgrade Plan
                </button>
                <button className="flex-1 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                  Add Add-on
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Available Plans</h2>
              <p className="text-sm sm:text-base text-gray-600">Choose the perfect plan for your needs</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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

        {/* Special Offers Tab */}
        {activeTab === 'offers' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Tag className="text-indigo-600" size={24} />
              Special Offers & Promotions
            </h2>
            <FeaturedPromotions />
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;