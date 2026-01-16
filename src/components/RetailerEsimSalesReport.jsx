import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Smartphone, DollarSign, Hash, Download } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

const RetailerEsimSalesReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // If not authenticated (demo/offline), don't call backend
      if (!token) {
        console.warn('No auth token found - skipping eSIM sales report fetch');
        setReport(null);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/retailer/esim-sales-report`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.data) {
        setReport(data.data);
      } else {
        console.error('Failed to fetch eSIM sales report', data);
        setReport(null);
      }
    } catch (error) {
      console.error('Error fetching eSIM sales report:', error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!report) return;

    const win = window.open('', '_blank');
    const rows = (report.sales || []).map((sale) => {
      const iccid = sale.iccid || (sale.iccids && sale.iccids.length > 0 ? sale.iccids[0] : '');
      const date = sale.orderDate ? new Date(sale.orderDate).toLocaleString('en-NO') : '';
      const amount = typeof sale.totalAmount === 'number'
        ? sale.totalAmount
        : Number(sale.totalAmount || 0);

      return `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${date}</td>
          <td style="padding:8px;border:1px solid #ddd;">${sale.orderNumber || ''}</td>
          <td style="padding:8px;border:1px solid #ddd;">${sale.customerName || ''}</td>
          <td style="padding:8px;border:1px solid #ddd;">${iccid || ''}</td>
          <td style="padding:8px;border:1px solid #ddd;">${sale.quantity || 0}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">NOK ${amount.toLocaleString('no-NO')}</td>
        </tr>
      `;
    }).join('');

    const totalEsims = report.totalEsimsSold || 0;
    const totalEarningsNum = typeof report.totalEarnings === 'number'
      ? report.totalEarnings
      : Number(report.totalEarnings || 0);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>eSIM POS Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2, h3 { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #4F46E5; color: white; padding: 8px; text-align: left; }
          td { padding: 8px; border: 1px solid #ddd; }
          .summary { margin-top: 10px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>eSIM POS Sales Report</h1>
        <p>Generated: ${new Date().toLocaleString('en-NO')}</p>
        <div class="summary">
          <p><strong>Total eSIMs Sold:</strong> ${totalEsims}</p>
          <p><strong>Total Earnings:</strong> NOK ${totalEarningsNum.toLocaleString('no-NO')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>ICCID</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="6" style="text-align:center;padding:12px;">No eSIM POS sales yet</td></tr>'}
          </tbody>
        </table>
      </body>
      </html>
    `;

    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
          <p className="text-gray-600">Loading eSIM POS sales report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 font-medium">Unable to load eSIM POS sales report</p>
        <button
          onClick={fetchReport}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <RefreshCw className="inline mr-2" size={16} />
          Retry
        </button>
      </div>
    );
  }

  const totalEsims = report.totalEsimsSold || 0;
  const totalOrders = report.totalOrders || 0;
  const totalEarningsNum = typeof report.totalEarnings === 'number'
    ? report.totalEarnings
    : Number(report.totalEarnings || 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium">Total eSIMs Sold (POS)</p>
            <p className="text-3xl font-bold text-purple-900">{totalEsims}</p>
          </div>
          <div className="p-3 rounded-full bg-purple-100">
            <Smartphone className="text-purple-700" size={24} />
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-600 font-medium">Total Earnings</p>
            <p className="text-3xl font-bold text-emerald-900">
              NOK {totalEarningsNum.toLocaleString('no-NO', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 rounded-full bg-emerald-100">
            <DollarSign className="text-emerald-700" size={24} />
          </div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-600 font-medium">Orders with eSIM</p>
            <p className="text-3xl font-bold text-indigo-900">{totalOrders}</p>
          </div>
          <div className="p-3 rounded-full bg-indigo-100">
            <Hash className="text-indigo-700" size={24} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">eSIM POS Sales</h3>
        <div className="flex gap-3">
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Download size={18} />
            Print / Download
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {report.sales && report.sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Customer Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">ICCID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.sales.map((sale, index) => {
                  const iccid = sale.iccid || (sale.iccids && sale.iccids.length > 0 ? sale.iccids[0] : '');
                  const date = sale.orderDate
                    ? new Date(sale.orderDate).toLocaleDateString('en-NO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '';
                  const amountNum = typeof sale.totalAmount === 'number'
                    ? sale.totalAmount
                    : Number(sale.totalAmount || 0);

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{date}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-indigo-600 font-medium">
                          {sale.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{sale.customerName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{iccid || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{sale.quantity || 0}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        NOK {amountNum.toLocaleString('no-NO')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <Smartphone className="mx-auto mb-3 text-gray-400" size={48} />
            <p className="text-gray-600 font-medium">No eSIM POS sales yet</p>
            <p className="text-sm text-gray-500 mt-1">Sales recorded through Point of Sale will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerEsimSalesReport;
