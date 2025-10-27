import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Smartphone, QrCode, Download, Mail, Shield, RefreshCw,
  CheckCircle, Clock, Zap, Globe, Settings, CreditCard,
  ArrowRight, Plus, Home, ChevronRight, LogOut, MessageCircle,
  Phone, HelpCircle, Wifi, Signal, Battery, Calendar
} from 'lucide-react';

const ESIMDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [esimData] = useState({
    number: '+47 987 654 321',
    status: 'Active',
    plan: 'eSIM Smart M',
    dataUsed: 2.8,
    dataTotal: 5,
    validUntil: '2024-11-20',
    balance: 89.50,
    activatedDate: '2024-10-15',
    qrCodeUrl: '#', // Would be actual QR code URL
    iccid: '8947040000000000001'
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Smartphone },
    { id: 'qr-code', label: 'QR Code', icon: QrCode },
    { id: 'usage', label: 'Usage', icon: Signal },
    { id: 'plans', label: 'Upgrade Plan', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const recentActivity = [
    { date: '2024-10-24', action: 'Data used', amount: '0.5GB', type: 'usage' },
    { date: '2024-10-20', action: 'Plan renewed', amount: 'eSIM Smart M', type: 'renewal' },
    { date: '2024-10-15', action: 'eSIM activated', amount: 'Initial setup', type: 'activation' },
  ];

  const availableUpgrades = [
    {
      id: 1,
      name: 'eSIM Smart XL',
      data: '30GB',
      price: 199,
      originalPrice: 299,
      current: false,
      upgrade: true
    },
    {
      id: 2,
      name: 'eSIM Smart Plus',
      data: '10GB',
      price: 179,
      originalPrice: null,
      current: false,
      upgrade: true
    }
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
              <span className="text-gray-500">eSIM Dashboard</span>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">eSIM Dashboard</h1>
          <p className="text-gray-600">Manage your digital SIM and mobile services</p>
        </div>

        {/* eSIM Status Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 mb-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <QrCode className="text-white" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Your eSIM</h3>
                  <p className="text-purple-100">{esimData.number}</p>
                  <p className="text-sm text-purple-200">ICCID: {esimData.iccid}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">{esimData.status} since {new Date(esimData.activatedDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-purple-100 mb-2">Current Plan</h4>
              <h3 className="text-xl font-bold mb-2">{esimData.plan}</h3>
              <p className="text-purple-100">Valid until {new Date(esimData.validUntil).toLocaleDateString()}</p>
              
              {/* Data Usage Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Data Used</span>
                  <span>{esimData.dataUsed}GB / {esimData.dataTotal}GB</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all"
                    style={{ width: `${(esimData.dataUsed / esimData.dataTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h4 className="text-sm text-purple-100 mb-2">Account Balance</h4>
              <h3 className="text-2xl font-bold mb-4">kr {esimData.balance}</h3>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors w-full lg:w-auto">
                Top Up eSIM
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
                    ? 'text-purple-600 border-b-2 border-purple-600'
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
              {/* Plan Details */}
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Smartphone size={24} className="text-purple-600" />
                  eSIM Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Plan Type</span>
                    <span className="font-bold text-gray-900">{esimData.plan}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Phone Number</span>
                    <span className="font-bold text-gray-900">{esimData.number}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-bold text-green-600">{esimData.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">ICCID</span>
                    <span className="font-mono text-sm text-gray-900">{esimData.iccid}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'usage' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'renewal' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'usage' ? <Signal size={16} /> :
                         activity.type === 'renewal' ? <RefreshCw size={16} /> :
                         <CheckCircle size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.amount}</p>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === 'qr-code' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your eSIM QR Code</h3>
                
                {/* QR Code Display */}
                <div className="w-64 h-64 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode size={48} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">QR Code</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <Zap className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                    <div className="text-left">
                      <h4 className="font-bold text-blue-900 mb-2">How to use this QR Code</h4>
                      <ol className="text-blue-800 text-sm space-y-1">
                        <li>1. Go to Settings → Mobile Data → Add Data Plan</li>
                        <li>2. Scan this QR code with your device camera</li>
                        <li>3. Follow the on-screen instructions</li>
                        <li>4. Your eSIM will be activated automatically</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                    <Download size={16} />
                    Download QR Code
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors">
                    <Mail size={16} />
                    Email QR Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Data Usage Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-2xl">
                  <Signal className="text-blue-600 mx-auto mb-2" size={32} />
                  <h4 className="font-bold text-gray-900 mb-1">Data Used</h4>
                  <p className="text-2xl font-bold text-blue-600">{esimData.dataUsed}GB</p>
                  <p className="text-sm text-gray-600">of {esimData.dataTotal}GB</p>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-2xl">
                  <Calendar className="text-green-600 mx-auto mb-2" size={32} />
                  <h4 className="font-bold text-gray-900 mb-1">Days Left</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.ceil((new Date(esimData.validUntil) - new Date()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-sm text-gray-600">until renewal</p>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-2xl">
                  <Wifi className="text-purple-600 mx-auto mb-2" size={32} />
                  <h4 className="font-bold text-gray-900 mb-1">Network</h4>
                  <p className="text-lg font-bold text-purple-600">Excellent</p>
                  <p className="text-sm text-gray-600">4G/5G Ready</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">Usage Tips</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Shield className="text-blue-600 flex-shrink-0 mt-1" size={16} />
                    <div>
                      <p className="font-medium text-gray-900">Enable Data Saver</p>
                      <p className="text-sm text-gray-600">Reduce background app usage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wifi className="text-green-600 flex-shrink-0 mt-1" size={16} />
                    <div>
                      <p className="font-medium text-gray-900">Use Wi-Fi When Available</p>
                      <p className="text-sm text-gray-600">Connect to trusted networks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Upgrade Your eSIM Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableUpgrades.map((plan) => (
                    <div key={plan.id} className="border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-400 transition-colors">
                      <div className="text-center mb-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                          <span className="text-3xl font-bold text-gray-900">kr{plan.price}</span>
                          {plan.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">kr{plan.originalPrice}</span>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-4">{plan.data}</div>
                      </div>
                      
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold transition-colors">
                        Upgrade to {plan.name}
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
                <h3 className="text-xl font-bold text-gray-900 mb-6">eSIM Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Data Roaming</h4>
                      <p className="text-sm text-gray-600">Use data when traveling abroad</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Usage Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified at 80% data usage</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-bold text-gray-900 mb-4">Support & Help</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                        <MessageCircle className="text-green-600" size={20} />
                        <span className="font-medium text-gray-900">WhatsApp Support</span>
                      </button>
                      <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                        <HelpCircle className="text-blue-600" size={20} />
                        <span className="font-medium text-gray-900">eSIM Help Guide</span>
                      </button>
                    </div>
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

export default ESIMDashboardPage;