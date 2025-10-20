import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  User, Mail, Calendar, Settings, Shield, LogOut,
  ShoppingBag, Gift, Share2, CreditCard, QrCode,
  RefreshCw, ExternalLink, Copy, CheckCircle, AlertCircle,
  ChevronRight, ChevronDown, Download, History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';

// Mock data for initial UI; wire to APIs later
const MOCK_PURCHASES = [
  {
    id: 'ORD-12345',
    date: '2025-10-15T12:31:00Z',
    products: [
      { name: 'Lycamobile 10GB Data Bundle', quantity: 1, price: 149 }
    ],
    total: 149,
    status: 'Completed',
    deliveryType: 'PIN',
    deliveryId: 'PIN-789012'
  },
  {
    id: 'ORD-12346',
    date: '2025-10-10T09:05:00Z',
    products: [
      { name: 'Lycamobile 5GB Data Bundle', quantity: 2, price: 99 }
    ],
    total: 198,
    status: 'Completed',
    deliveryType: 'eSIM',
    deliveryId: 'SIM-789013'
  },
  {
    id: 'ORD-12347',
    date: '2025-09-28T18:42:00Z',
    products: [
      { name: 'Unlimited Calls & SMS', quantity: 1, price: 199 }
    ],
    total: 199,
    status: 'Completed',
    deliveryType: 'PIN',
    deliveryId: 'PIN-789014'
  }
];

const NOK = new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' });

const MOCK_REWARDS = {
  points: 450,
  level: 'Silver',
  nextLevel: 'Gold',
  pointsToNextLevel: 550,
  history: [
    { date: '2025-10-15', points: 15, action: 'Purchase ORD-12345', balance: 450 },
    { date: '2025-10-10', points: 20, action: 'Purchase ORD-12346', balance: 435 },
    { date: '2025-09-28', points: 20, action: 'Purchase ORD-12347', balance: 415 },
    { date: '2025-09-15', points: 200, action: 'New member bonus', balance: 395 },
    { date: '2025-09-10', points: 195, action: 'Referral bonus: john@example.com', balance: 195 }
  ]
};

const MOCK_REFERRAL = {
  code: 'EASY25OFF',
  totalReferrals: 2,
  pointsEarned: 200,
  link: 'https://easytopup.no/ref/EASY25OFF',
  invitations: [
    { email: 'john@example.com', date: '2025-09-10', status: 'Registered' },
    { email: 'sarah@example.com', date: '2025-09-25', status: 'Pending' }
  ]
};

const MOCK_DELIVERIES = [
  {
    id: 'PIN-789012',
    type: 'PIN',
    product: 'Lycamobile 10GB Data Bundle',
    pin: '1234-5678-9012-3456',
    status: 'Active',
    date: '2025-10-15',
    expires: '2025-12-15'
  },
  {
    id: 'SIM-789013',
    type: 'eSIM',
    product: 'Lycamobile 5GB Data Bundle',
    qrData: 'ESIM:SIM-789013',
    status: 'Active',
    date: '2025-10-10',
    expires: '2025-12-10'
  }
];

const TabButton = ({ id, active, onClick, icon: Icon, label }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
      active ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
    }`}
  >
    <Icon size={18} />
    <span className="font-semibold">{label}</span>
  </button>
);

const StatCard = ({ icon: Icon, title, value, hint, color = 'blue' }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-${color}-50 text-${color}-600`}> 
      <Icon size={20} />
    </div>
    <div className="text-gray-600 text-sm font-medium">{title}</div>
    <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
  </div>
);

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copied, setCopied] = useState(false);

  const referral = MOCK_REFERRAL;
  const rewards = MOCK_REWARDS;
  const purchases = MOCK_PURCHASES;
  const deliveries = MOCK_DELIVERIES;

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600 font-body mt-1">Manage your purchases, rewards, and referrals</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-xl">
              <Settings size={18} />
              Edit Profile
            </button>
            <button onClick={logout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={user?.name} src={user?.avatar} sizeClasses="w-16 h-16" rounded="rounded-2xl" />
              <div>
                <div className="text-xl font-bold text-gray-900">{user?.name || 'User'}</div>
                <div className="text-gray-600 flex items-center gap-2"><Mail size={16} />{user?.email}</div>
                <div className="text-gray-600 flex items-center gap-2"><Calendar size={16} />Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <StatCard icon={Gift} title="Reward Points" value={rewards.points} hint={`${rewards.pointsToNextLevel} pts to ${rewards.nextLevel}`} />
              <StatCard icon={ShoppingBag} title="Orders" value={purchases.length} hint="Lifetime" />
              <StatCard icon={Share2} title="Referrals" value={referral.totalReferrals} hint={`${referral.pointsEarned} pts earned`} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton id="dashboard" active={activeTab === 'dashboard'} onClick={setActiveTab} icon={History} label="Overview" />
          <TabButton id="purchases" active={activeTab === 'purchases'} onClick={setActiveTab} icon={ShoppingBag} label="Purchases" />
          <TabButton id="rewards" active={activeTab === 'rewards'} onClick={setActiveTab} icon={Gift} label="Rewards" />
          <TabButton id="referrals" active={activeTab === 'referrals'} onClick={setActiveTab} icon={Share2} label="Referrals" />
          <TabButton id="deliveries" active={activeTab === 'deliveries'} onClick={setActiveTab} icon={QrCode} label="PINs & eSIMs" />
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Purchases */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ShoppingBag size={20} className="text-blue-600" /> Recent Purchases</h3>
                <button onClick={() => setActiveTab('purchases')} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                  View all <ChevronRight size={16} />
                </button>
              </div>
              <div className="divide-y">
                {purchases.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{o.id}</div>
                      <div className="text-gray-600 text-sm">{new Date(o.date).toLocaleString()} • {o.products.map(p => `${p.name} x${p.quantity}`).join(', ')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{NOK.format(o.total)}</div>
                      <div className="text-xs text-gray-500">{o.status} • {o.deliveryType}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2"><Gift size={20} className="text-purple-600" /> Rewards</h3>
              <div className="text-3xl font-bold text-gray-900">{rewards.points} pts</div>
              <div className="text-sm text-gray-600">{rewards.pointsToNextLevel} pts to {rewards.nextLevel}</div>
              <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl">Redeem Points</button>
              <div className="mt-4 text-sm text-gray-600">Earn points on every purchase and by inviting friends.</div>
            </div>

            {/* Referral */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Share2 size={20} className="text-green-600" /> Refer & Earn</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div>
                  <div className="text-gray-700">Your referral code</div>
                  <div className="text-2xl font-bold text-gray-900">{referral.code}</div>
                  <div className="text-sm text-gray-600">{referral.totalReferrals} referred • {referral.pointsEarned} points earned</div>
                </div>
                <div className="flex gap-2 items-center">
                  <input readOnly value={referral.link} className="w-full md:w-96 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800" />
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(referral.link);
                        setCopied(true);
                      } catch {}
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ShoppingBag size={20} className="text-blue-600" /> Purchase History</h3>
              <Link to="/bundles" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">Shop more <ExternalLink size={16} /></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-gray-600 text-sm border-b">
                    <th className="py-3 pr-4">Order</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Items</th>
                    <th className="py-3 pr-4">Total</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((o) => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="py-4 pr-4 font-semibold text-gray-900">{o.id}</td>
                      <td className="py-4 pr-4 text-gray-700">{new Date(o.date).toLocaleString()}</td>
                      <td className="py-4 pr-4 text-gray-700">{o.products.map(p => `${p.name} x${p.quantity}`).join(', ')}</td>
                      <td className="py-4 pr-4 font-semibold text-gray-900">{NOK.format(o.total)}</td>
                      <td className="py-4 pr-4">
                        <span className="px-2 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">{o.status}</span>
                      </td>
                      <td className="py-4 pr-4 text-gray-700">{o.deliveryType} • {o.deliveryId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2"><Gift size={20} className="text-purple-600" /> Rewards Balance</h3>
              <div className="text-4xl font-extrabold text-gray-900">{rewards.points} pts</div>
              <div className="text-sm text-gray-600">Level: <span className="font-semibold">{rewards.level}</span></div>
              <div className="text-sm text-gray-600">{rewards.pointsToNextLevel} pts to {rewards.nextLevel}</div>
              <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl">Redeem Points</button>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">Earn points on every purchase and referrals.</div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><History size={20} className="text-blue-600" /> Points History</h3>
              <div className="space-y-3">
                {rewards.history.map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                    <div>
                      <div className="font-semibold text-gray-900">{h.action}</div>
                      <div className="text-sm text-gray-600">{new Date(h.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">+{h.points} pts</div>
                      <div className="text-xs text-gray-500">Balance: {h.balance} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Share2 size={20} className="text-green-600" /> Your Referral Link</h3>
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <input readOnly value={referral.link} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800" />
                <button
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(referral.link); setCopied(true); } catch {}
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-600">Share with friends to earn reward points on their first purchase.</div>
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Invitations</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="text-gray-600 text-sm border-b">
                        <th className="py-3 pr-4">Email</th>
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referral.invitations.map((inv, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-3 pr-4">{inv.email}</td>
                          <td className="py-3 pr-4">{new Date(inv.date).toLocaleDateString()}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 rounded-lg text-xs border ${inv.status === 'Registered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="text-gray-700">Your code</div>
              <div className="text-2xl font-bold text-gray-900">{referral.code}</div>
              <div className="text-sm text-gray-600 mt-1">{referral.totalReferrals} referrals • {referral.pointsEarned} points</div>
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-800">Invite a friend and earn points when they make their first purchase.</div>
            </div>
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deliveries.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{d.product}</div>
                  <span className="px-2 py-1 rounded-lg text-xs border bg-emerald-50 text-emerald-700 border-emerald-100">{d.status}</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">{d.type} • {d.id}</div>
                {d.type === 'PIN' ? (
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="font-mono text-lg tracking-wider">{d.pin}</div>
                    <button
                      onClick={async () => { try { await navigator.clipboard.writeText(d.pin); setCopied(true); } catch {} }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Copy size={16} /> Copy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <QrCode size={40} />
                    </div>
                    <div className="text-sm text-gray-600">Scan this QR with your device to install eSIM. ID: {d.id}</div>
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-600">Issued: {new Date(d.date).toLocaleDateString()} • Expires: {new Date(d.expires).toLocaleDateString()}</div>
                <div className="mt-4 flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700">
                    <Download size={16} /> Download
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700">
                    <ExternalLink size={16} /> View Instructions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Footer */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-gray-700">Need help with your order or eSIM setup?</div>
            <div className="flex gap-2">
              <Link to="/contact" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">Contact Support</Link>
              <a href="https://wa.me/" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;