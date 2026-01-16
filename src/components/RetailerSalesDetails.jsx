import React, { useState, useEffect } from 'react';
import { Download, Package, AlertCircle, RefreshCw, FileText, Printer } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

const RetailerSalesDetails = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/retailer/sales`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setSalesData(data.data);
      } else {
        console.error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!salesData) return;
    
    // Create printable HTML
    const printWindow = window.open('', '_blank');
    const html = generateSalesPDF(salesData);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const generateSalesPDF = (data) => {
    let itemsHTML = '';
    
    if (data.orders && data.orders.length > 0) {
      data.orders.forEach(order => {
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            const serialNums = item.serialNumbers && item.serialNumbers.length > 0 
              ? item.serialNumbers.join(', ') 
              : item.serialNumber || 'Not assigned';
            
            itemsHTML += `
              <tr>
                <td style="padding:8px;border:1px solid #ddd;">${new Date(order.date).toLocaleDateString()}</td>
                <td style="padding:8px;border:1px solid #ddd;">${order.orderNumber}</td>
                <td style="padding:8px;border:1px solid #ddd;">${item.productName}<br/><small>${item.productType}</small></td>
                <td style="padding:8px;border:1px solid #ddd;"><span style="background:${item.type === 'eSIM' ? '#a855f7' : '#fb923c'};color:white;padding:2px 8px;border-radius:4px;">${item.type}</span></td>
                <td style="padding:8px;border:1px solid #ddd;">${item.quantity}</td>
                <td style="padding:8px;border:1px solid #ddd;font-family:monospace;font-size:11px;">${serialNums}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">NOK ${(item.unitPrice * item.quantity).toLocaleString()}</td>
              </tr>
            `;
          });
        }
      });
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Report - ${data.retailerName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #4F46E5; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #4F46E5; color: white; padding: 10px; text-align: left; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">EasyTopup.no</div>
          <h2>Sales Report</h2>
          <p><strong>Retailer:</strong> ${data.retailerName}</p>
          <p><strong>Email:</strong> ${data.retailerEmail}</p>
          <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background:#f3f4f6;padding:15px;margin-bottom:20px;border-radius:8px;">
          <h3 style="margin-top:0;">Summary</h3>
          <p><strong>Total Orders:</strong> ${data.totalOrders}</p>
          <p><strong>Total Sales:</strong> NOK ${typeof data.totalSales === 'number' ? data.totalSales.toLocaleString() : data.totalSales}</p>
          
          <div style="display:grid;grid-template-columns:1fr;gap:15px;margin-top:15px;">
            <div style="background:white;padding:10px;border-radius:4px;border-left:4px solid #fb923c;">
              <p style="margin:0;color:#9a3412;font-weight:bold;">ePIN Sales</p>
              <p style="margin:5px 0;font-size:16px;font-weight:bold;">${data.totalEpinSold} units</p>
              <p style="margin:0;color:#fb923c;font-size:14px;">Earnings: NOK ${typeof data.epinEarnings === 'string' ? parseInt(data.epinEarnings).toLocaleString() : (data.epinEarnings ? data.epinEarnings.toLocaleString() : '0')}</p>
            </div>
          </div>
        </div>

        <h3>Detailed Sales</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Product</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Serial Number</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML || '<tr><td colspan="7" style="text-align:center;padding:20px;">No sales data</td></tr>'}
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 font-medium">Unable to load sales data</p>
        <button
          onClick={fetchSalesData}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <RefreshCw className="inline mr-2" size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-blue-900">{salesData.totalOrders}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Total Sales</p>
          <p className="text-3xl font-bold text-green-900">
            NOK {typeof salesData.totalSales === 'number' 
              ? salesData.totalSales.toLocaleString() 
              : salesData.totalSales}
          </p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-sm text-orange-600 font-medium">ePIN Sales</p>
          <p className="text-2xl font-bold text-orange-900">{salesData.totalEpinSold}</p>
          <p className="text-xs text-orange-600 mt-1">
            NOK {typeof salesData.epinEarnings === 'string' 
              ? parseInt(salesData.epinEarnings).toLocaleString()
              : (salesData.epinEarnings ? salesData.epinEarnings.toLocaleString() : '0')}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
          <p className="text-sm text-indigo-600 font-medium">Customer Count</p>
          <p className="text-3xl font-bold text-indigo-900">
            {salesData.orders ? new Set(salesData.orders.map(o => o.customerEmail || o.customerId)).size : 0}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Order History</h3>
        <div className="flex gap-3">
          <button
            onClick={fetchSalesData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {salesData.orders && salesData.orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Serial Number</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData.orders.map((order) => (
                  order.items && order.items.length > 0 ? (
                    order.items.map((item, itemIndex) => (
                      <tr key={`${order.orderId}-${itemIndex}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(order.date).toLocaleDateString('en-NO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-indigo-600 font-medium">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">{item.productType}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.type === 'eSIM' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.serialNumbers && item.serialNumbers.length > 0 ? (
                            <div className="font-mono text-xs space-y-1">
                              {item.serialNumbers.map((serial, idx) => (
                                <div key={idx} className="bg-gray-100 px-2 py-1 rounded">
                                  {serial}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">{item.serialNumber || 'Not assigned'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          NOK {(item.unitPrice * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key={order.orderId}>
                      <td colSpan="7" className="px-4 py-3 text-sm text-gray-500 text-center">
                        No items in this order
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <Package className="mx-auto mb-3 text-gray-400" size={48} />
            <p className="text-gray-600 font-medium">No sales yet</p>
            <p className="text-sm text-gray-500 mt-1">Your sales will appear here once you make purchases</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerSalesDetails;
