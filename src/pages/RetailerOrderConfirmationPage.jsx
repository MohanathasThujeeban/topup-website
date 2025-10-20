import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Printer, FileText, ShoppingBag } from 'lucide-react';

export default function RetailerOrderConfirmationPage() {
  const { orderId } = useParams();

  // In a real flow, fetch order details by orderId
  const mock = {
    email: 'retailer@example.no',
    mobile: '+47 912 34 567',
    total: 'NOK 1,249.00'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Confirmed</h1>
            <p className="text-sm text-gray-600">Order #{orderId}</p>
          </div>
        </div>

        <div className="space-y-3 text-gray-700">
          <div><span className="text-gray-500">Delivery Email:</span> {mock.email}</div>
          <div><span className="text-gray-500">Delivery Mobile:</span> {mock.mobile}</div>
          <div><span className="text-gray-500">Total:</span> {mock.total}</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 flex items-center gap-2">
            <Printer size={18} /> Print
          </button>
          <Link to="/retailer/dashboard" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <ShoppingBag size={18} /> Back to Dashboard
          </Link>
          <Link to="/retailer/dashboard" state={{ tab: 'Reports' }} className="px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 flex items-center gap-2">
            <FileText size={18} /> View Reports
          </Link>
        </div>
      </div>
    </div>
  );
}
