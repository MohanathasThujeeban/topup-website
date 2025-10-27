import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, Signal, Battery, Wifi, Phone, MessageCircle,
  Globe, Settings, CreditCard, Download, Upload, Calendar,
  CheckCircle, AlertCircle, Info, RefreshCw, Plus, ArrowRight,
  User, Shield, Bell, HelpCircle, LogOut, Home, ChevronRight
} from 'lucide-react';

const SIMDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [simData] = useState({
    number: '+47 123 456 789',
    status: 'Active',
    plan: 'Lyca Smart XL',
    dataUsed: 12.5,
    dataTotal: 30,
    validUntil: '2024-11-25',
    balance: 127.50,
    lastRecharged: '2024-10-01'
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Smartphone },
    { id: 'usage', label: 'Usage & Data', icon: Signal },
    { id: 'plans', label: 'Plans & Add-ons', icon: CreditCard },
    { id: 'settings', label: 'SIM Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ];

  const usageHistory = [
    { date: '2024-10-24', data: 1.2, calls: 15, sms: 5 },
    { date: '2024-10-23', data: 2.1, calls: 8, sms: 12 },
    { date: '2024-10-22', data: 0.8, calls: 22, sms: 3 },
    { date: '2024-10-21', data: 3.2, calls: 12, sms: 8 },
    { date: '2024-10-20', data: 1.5, calls: 18, sms: 15 }
  ];

  const availablePlans = [
    {
      id: 1,
      name: 'Lyca Smart S',
      data: '1GB',
      price: 99,
      calls: 'Unlimited',
      sms: 'Unlimited',
      validity: '30 days',
      popular: false
    },
    {
      id: 2,
      name: 'Lyca Smart M',
      data: '5GB',
      price: 149,
      calls: 'Unlimited',
      sms: 'Unlimited',
      validity: '30 days',
      popular: false
    },
    {
      id: 3,
      name: 'Lyca Smart XL',
      data: '30GB',
      price: 199,
      originalPrice: 299,
      calls: 'Unlimited',
      sms: 'Unlimited',
      validity: '30 days',
      popular: true,
      current: true
    }
  ];

  const addOns = [
    { name: 'Extra 5GB Data', price: 59, validity: '30 days' },
    { name: 'International Calling', price: 99, validity: '30 days' },
    { name: 'EU Roaming Pack', price: 149, validity: '30 days' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                <Home size={16} />
              </Link>
              <ChevronRight size={16} className="text-gray-400" />
              <span className="text-gray-500">SIM Dashboard</span>
            </div>
            <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
              <LogOut size={16} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SIM Dashboard</h1>
          <p className="text-gray-600">Manage your Lycamobile SIM and services</p>
        </div>

        {/* SIM Status Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 mb-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your SIM</h3>
                  <p className="text-blue-100">{simData.number}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">{simData.status}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-blue-100 mb-2">Current Plan</h4>
              <h3 className="text-xl font-bold mb-2">{simData.plan}</h3>
              <p className="text-blue-100">Valid until {new Date(simData.validUntil).toLocaleDateString()}</p>
            </div>

            <div>
              <h4 className="text-sm text-blue-100 mb-2">Account Balance</h4>
              <h3 className="text-2xl font-bold">kr {simData.balance}</h3>
              <button className="mt-2 bg-white text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-50 transition-colors">
                Top Up Now
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-3xl shadow-lg mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Data Usage */}
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Data Usage</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Used this month</span>
                    <span className="font-bold text-gray-900">{simData.dataUsed}GB / {simData.dataTotal}GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(simData.dataUsed / simData.dataTotal) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{((simData.dataTotal - simData.dataUsed)).toFixed(1)}GB remaining</span>
                    <span>{Math.round((simData.dataUsed / simData.dataTotal) * 100)}% used</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Download className="text-blue-600 mx-auto mb-2" size={20} />
                      <p className="text-sm text-gray-600">Download</p>
                      <p className="font-bold">45.2 Mbps</p>
                    </div>
                    <div>
                      <Upload className="text-green-600 mx-auto mb-2" size={20} />
                      <p className="text-sm text-gray-600">Upload</p>
                      <p className="font-bold">12.8 Mbps</p>
                    </div>
                    <div>
                      <Signal className="text-purple-600 mx-auto mb-2" size={20} />
                      <p className="text-sm text-gray-600">Signal</p>
                      <p className="font-bold">Excellent</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-blue-600" size={20} />
                      <span className="font-medium text-gray-900">Top Up Balance</span>
                    </div>
                    <ArrowRight className="text-gray-400" size={16} />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <Plus className="text-green-600" size={20} />
                      <span className="font-medium text-gray-900">Buy Add-ons</span>
                    </div>
                    <ArrowRight className="text-gray-400" size={16} />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="text-purple-600" size={20} />
                      <span className="font-medium text-gray-900">Change Plan</span>
                    </div>
                    <ArrowRight className="text-gray-400" size={16} />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="text-orange-600" size={20} />
                      <span className="font-medium text-gray-900">Get Support</span>
                    </div>
                    <ArrowRight className="text-gray-400" size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Usage History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Data Used</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Calls Made</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">SMS Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageHistory.map((day, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{new Date(day.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-gray-600">{day.data}GB</td>
                          <td className="py-3 px-4 text-gray-600">{day.calls} calls</td>
                          <td className="py-3 px-4 text-gray-600">{day.sms} messages</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availablePlans.map((plan) => (
                    <div key={plan.id} className={`relative border-2 rounded-2xl p-6 transition-all ${
                      plan.current 
                        ? 'border-green-500 bg-green-50' 
                        : plan.popular 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      {plan.popular && !plan.current && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            POPULAR
                          </span>
                        </div>
                      )}
                      {plan.current && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            CURRENT PLAN
                          </span>
                        </div>
                      )}
                      
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h4>
                      
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900">kr{plan.price}</span>
                          {plan.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">kr{plan.originalPrice}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{plan.validity}</p>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Data</span>
                          <span className="font-medium text-green-600">{plan.data}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Calls</span>
                          <span className="font-medium text-green-600">{plan.calls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">SMS</span>
                          <span className="font-medium text-green-600">{plan.sms}</span>
                        </div>
                      </div>

                      <button 
                        disabled={plan.current}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                          plan.current
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {plan.current ? 'Current Plan' : 'Switch to Plan'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Add-ons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {addOns.map((addon, index) => (
                    <div key={index} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all">
                      <h4 className="font-bold text-gray-900 mb-2">{addon.name}</h4>
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-gray-900">kr{addon.price}</span>
                        <p className="text-sm text-gray-600">{addon.validity}</p>
                      </div>
                      <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors">
                        Add to Plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">SIM Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Data Roaming</h4>
                      <p className="text-sm text-gray-600">Allow data usage when traveling abroad</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto Top-up</h4>
                      <p className="text-sm text-gray-600">Automatically top up when balance is low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Usage Notifications</h4>
                      <p className="text-sm text-gray-600">Get notified about data usage</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Account Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input 
                        type="text" 
                        defaultValue="John" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        defaultValue="Doe" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="john.doe@email.com" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Support</h3>
                  <div className="space-y-4">
                    <button className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                      <MessageCircle className="text-green-600" size={20} />
                      <span className="font-medium text-gray-900">WhatsApp Support</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                      <Phone className="text-blue-600" size={20} />
                      <span className="font-medium text-gray-900">Call Support</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                      <Mail className="text-purple-600" size={20} />
                      <span className="font-medium text-gray-900">Email Support</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Help Center</h3>
                  <div className="space-y-3">
                    <Link to="/faq" className="block p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <span className="font-medium text-gray-900">Frequently Asked Questions</span>
                    </Link>
                    <Link to="/setup" className="block p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <span className="font-medium text-gray-900">SIM Setup Guide</span>
                    </Link>
                    <Link to="/troubleshooting" className="block p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <span className="font-medium text-gray-900">Troubleshooting</span>
                    </Link>
                    <Link to="/coverage" className="block p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <span className="font-medium text-gray-900">Network Coverage</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SIMDashboardPage;