import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, ShoppingBag, QrCode, Gift, CreditCard, Bell, AlertTriangle, FileText, Download, Printer, Globe, Languages, Shield, TrendingUp, CircleDollarSign } from 'lucide-react';
import RequireBusiness from '../components/RequireBusiness';
import { useAuth } from '../contexts/AuthContext';

const NOK = new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' });

const TABS = ['Overview', 'Orders', 'Offers', 'Reports', 'Rewards', 'Settings'];

export default function RetailerDashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('Overview');
  const { logout } = useAuth();

  useEffect(() => {
    const defaultTab = location.state?.tab;
    if (defaultTab && TABS.includes(defaultTab)) setTab(defaultTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RequireBusiness>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center">
                <Building2 />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Retailer Dashboard</div>
                <div className="text-sm text-gray-600">Manage bundles, eSIMs, invoices and reports</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/bundles" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">Browse Bundles</Link>
              <Link to="/esim" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white">Browse eSIMs</Link>
              <button onClick={logout} className="px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700">Sign Out</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl border ${tab===t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>{t}</button>
            ))}
          </div>

          {/* Content */}
          {tab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Credit limits */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold text-gray-900 flex items-center gap-2"><CreditCard className="text-blue-600" /> Retailer Credit</div>
                  <div className="text-sm text-gray-600">Invoice payments only</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[2500, 5000, 7500, 10000, 15000, 20000].map(limit => {
                    const current = 4200; // mock usage
                    const available = limit - current;
                    const reached90 = current / limit >= 0.9;
                    const reached100 = current >= limit;
                    const disabled = limit < current; // blur lower limits than current usage
                    return (
                      <div key={limit} className={`p-4 rounded-xl border ${disabled ? 'opacity-50 grayscale' : ''} ${reached100 ? 'border-red-300 bg-red-50' : reached90 ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                        <div className="font-semibold text-gray-900">Limit {NOK.format(limit)}</div>
                        <div className="text-sm text-gray-600">Used {NOK.format(current)} • Left {NOK.format(available)}</div>
                        {reached100 && <div className="mt-2 text-xs text-red-700 flex items-center gap-1"><AlertTriangle size={14} /> Limit exceeded</div>}
                        {!reached100 && reached90 && <div className="mt-2 text-xs text-amber-700 flex items-center gap-1"><Bell size={14} /> 90% reached</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Bell className="text-purple-600" /> Notifications</div>
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-800">You reached 90% of your credit limit. Please settle invoices.</div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">New offers available for eSIM bundles.</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'Orders' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-gray-900 flex items-center gap-2"><ShoppingBag className="text-blue-600" /> Orders & Checkout</div>
                <div className="text-sm text-gray-600">Invoice method only</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-gray-200">
                  <div className="font-semibold mb-2">Bundles & eSIMs</div>
                  <p className="text-sm text-gray-600 mb-3">Access retailer-exclusive bundles, eSIMs and promotions.</p>
                  <div className="flex gap-2">
                    <Link to="/bundles" className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Browse Bundles</Link>
                    <Link to="/esim" className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm">Browse eSIMs</Link>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200">
                  <div className="font-semibold mb-2">Invoice Checkout</div>
                  <p className="text-sm text-gray-600 mb-3">Place orders on invoice; usage contributes to your credit limit.</p>
                  <div className="text-sm text-gray-700">Payment method: Invoice (Tripletex)</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'Offers' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="font-bold text-gray-900 mb-4">Retailer Offers</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="p-4 rounded-xl border border-gray-200">
                    <div className="font-semibold">Bundle Promo {i}</div>
                    <div className="text-sm text-gray-600">Special retailer pricing.</div>
                    <button className="mt-3 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Apply</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Reports' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="text-blue-600" /> Reports</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-600 border-b">
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">Product</th>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Amount</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{type:'eSIM Activation', product:'eSIM 10GB', date:'2025-10-01', amount:199, within24:true},{type:'PIN Sale', product:'PIN 100 NOK', date:'2025-09-30', amount:100, within24:false}].map((r, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-3 pr-4">{r.type}</td>
                        <td className="py-3 pr-4">{r.product}</td>
                        <td className="py-3 pr-4">{r.date}</td>
                        <td className="py-3 pr-4 font-semibold">{NOK.format(r.amount)}</td>
                        <td className="py-3 pr-4">
                          {r.within24 ? (
                            <div className="flex gap-2">
                              <button className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-sm flex items-center gap-1"><Download size={14}/> Download</button>
                              <button className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-sm flex items-center gap-1"><Printer size={14}/> Print</button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Available for 24 hours only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'Rewards' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 lg:col-span-2">
                <div className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Gift className="text-purple-600" /> Retailer Rewards</div>
                <p className="text-sm text-gray-600 mb-4">Earn rewards for eSIM activations and hitting purchase targets (14/21 days). Redeem on future purchases.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200">
                    <div className="font-semibold">eSIM Activation Rewards</div>
                    <div className="text-sm text-gray-600">Track activations and earned points.</div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200">
                    <div className="font-semibold">Target Campaigns</div>
                    <div className="text-sm text-gray-600">Current window: 14 days • Progress: 60%</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="font-bold text-gray-900 mb-2 flex items-center gap-2"><TrendingUp className="text-green-600" /> Current Points</div>
                <div className="text-3xl font-extrabold text-gray-900">420 pts</div>
                <button className="mt-4 w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">Redeem</button>
              </div>
            </div>
          )}

          {tab === 'Settings' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Globe className="text-blue-600" /> Geo & Payments</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-gray-200">
                  <div className="font-semibold mb-2 flex items-center gap-2"><Languages className="text-purple-600" /> Language</div>
                  <div className="text-sm text-gray-600">Default: English • Support Norwegian Bokmål</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200">
                  <div className="font-semibold mb-2 flex items-center gap-2"><Shield className="text-emerald-600" /> Payment Gateways</div>
                  <div className="text-sm text-gray-600">Adaptive gateways by geo: Vipps/BankAxept (Norway), Stripe/PayPal (international)</div>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl border border-gray-200 text-sm text-gray-600">
                Admin analytics: access logs by region, conversion per country, language usage, top bundles by geography (export CSV/XLSX)
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireBusiness>
  );
}
