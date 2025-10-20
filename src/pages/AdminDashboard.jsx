import React from 'react';
import { Globe2, MapPin, BarChart3, Languages, CreditCard, Users, Download, Filter } from 'lucide-react';

export default function AdminDashboard() {
  const logs = [
    { user:'alice@example.com', country:'Norway', city:'Oslo', time:'2025-10-20 10:22', page:'Bundles', action:'View' },
    { user:'bob@example.com', country:'Norway', city:'Bergen', time:'2025-10-20 10:05', page:'Checkout', action:'Purchase' },
    { user:'dev@test.no', country:'Sri Lanka', city:'Colombo', time:'2025-10-20 09:55', page:'Login', action:'Login' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center">
              <Globe2 />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">Admin Analytics</div>
              <div className="text-sm text-gray-600">Geo tracking, languages, conversions and gateways</div>
            </div>
          </div>
          <button className="px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-sm flex items-center gap-2"><Download size={16}/> Export CSV</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Users className="text-indigo-600"/> User Access by Region</div>
            <div className="text-sm text-gray-600">NO: 68% • EU: 20% • Other: 12%</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="font-bold text-gray-900 mb-2 flex items-center gap-2"><BarChart3 className="text-emerald-600"/> Conversion by Country</div>
            <div className="text-sm text-gray-600">Norway 3.8% • Sweden 2.1% • Germany 1.6%</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Languages className="text-purple-600"/> Popular Languages</div>
            <div className="text-sm text-gray-600">EN 72% • NB 25% • Other 3%</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-gray-900 flex items-center gap-2"><MapPin className="text-blue-600"/> Live Access Log</div>
            <button className="px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-sm text-gray-700 flex items-center gap-2"><Filter size={16}/> Filters</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-sm text-gray-600 border-b">
                  <th className="py-3 pr-4">User</th>
                  <th className="py-3 pr-4">Country / City</th>
                  <th className="py-3 pr-4">Date & Time</th>
                  <th className="py-3 pr-4">Page</th>
                  <th className="py-3 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-3 pr-4">{l.user}</td>
                    <td className="py-3 pr-4">{l.country} / {l.city}</td>
                    <td className="py-3 pr-4">{l.time}</td>
                    <td className="py-3 pr-4">{l.page}</td>
                    <td className="py-3 pr-4">{l.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="font-bold text-gray-900 mb-2 flex items-center gap-2"><CreditCard className="text-rose-600"/> Payment Gateways by Geo</div>
          <div className="text-sm text-gray-600">Vipps/BankAxept (Norway) • Stripe/Visa/MasterCard/PayPal (International)</div>
        </div>
      </div>
    </div>
  );
}
