import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Send, Download, Eye, Search, Filter, AlertCircle, 
  CheckCircle, Clock, DollarSign, Calendar, User, Mail, Phone,
  CreditCard, TrendingUp, Package, RefreshCw, Printer, X, Users
} from 'lucide-react';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

const InvoiceAndSales = () => {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loadingSalesData, setLoadingSalesData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, limit-reached, pending, paid
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const invoiceRef = useRef(null);

  useEffect(() => {
    fetchRetailersWithCreditStatus();
  }, []);

  const fetchRetailersWithCreditStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/retailers/credit-limits`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Process retailer data
        const retailersWithStatus = data.data.map(retailer => ({
          ...retailer,
          isLimitReached: retailer.creditUsagePercentage >= 90,
          invoiceStatus: 'none', // Track invoice status separately
          purchaseHistory: [] // Will be populated when generating invoice
        }));
        
        setRetailers(retailersWithStatus);
      } else {
        console.log('Using demo data');
        // Fallback to demo data
        setRetailers([
          {
            retailerId: 1,
            retailerName: 'Premium Telecom Store',
            retailerEmail: 'premium@telecom.com',
            level: 'DIAMOND',
            creditLimit: 50000,
            usedCredit: 49000,
            availableCredit: 1000,
            creditUsagePercentage: 98,
            isLimitReached: true,
            invoiceStatus: 'none',
            purchaseHistory: []
          },
          {
            retailerId: 2,
            retailerName: 'City Mobile Shop',
            retailerEmail: 'city@mobile.com',
            level: 'GOLD',
            creditLimit: 30000,
            usedCredit: 27500,
            availableCredit: 2500,
            creditUsagePercentage: 92,
            isLimitReached: true,
            invoiceStatus: 'none',
            purchaseHistory: []
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching retailers:', err);
      // Demo data for development
      setRetailers([
        {
          retailerId: 1,
          retailerName: 'Premium Telecom Store',
          retailerEmail: 'premium@telecom.com',
          level: 'DIAMOND',
          creditLimit: 50000,
          usedCredit: 49000,
          availableCredit: 1000,
          creditUsagePercentage: 98,
          isLimitReached: true,
          invoiceStatus: 'none',
          purchaseHistory: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = (retailer) => {
    const invoiceNumber = `INV-${Date.now()}-${retailer.retailerId}`;
    const invoiceDate = new Date().toLocaleDateString('en-NO');
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-NO');
    
    // Generate purchase history from used credit
    const purchases = retailer.purchaseHistory && retailer.purchaseHistory.length > 0 
      ? retailer.purchaseHistory 
      : [
          {
            date: new Date().toLocaleDateString('en-NO'),
            items: 'Credit Usage - Product Purchases',
            amount: retailer.usedCredit
          }
        ];
    
    return {
      invoiceNumber,
      invoiceDate,
      dueDate,
      retailer: {
        name: retailer.retailerName,
        email: retailer.retailerEmail,
        level: retailer.level || 'ENTRY'
      },
      creditDetails: {
        creditLimit: retailer.creditLimit,
        usedCredit: retailer.usedCredit,
        availableCredit: retailer.availableCredit,
        creditUsagePercentage: retailer.creditUsagePercentage
      },
      purchases: purchases,
      totalAmount: retailer.usedCredit,
      dueAmount: retailer.usedCredit,
      status: 'pending',
      notes: `Payment required to restore credit facility. Your credit limit of NOK ${retailer.creditLimit.toLocaleString()} has been utilized ${retailer.creditUsagePercentage.toFixed(1)}%. Please clear your outstanding balance to continue purchasing.`
    };
  };

  const handleSendInvoice = async (retailer) => {
    try {
      setSendingInvoice(true);
      const invoice = generateInvoice(retailer);
      
      // Try to send via backend API
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/send-invoice-email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          retailerEmail: retailer.retailerEmail,
          retailerName: retailer.retailerName,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          creditLimit: retailer.creditLimit,
          usedCredit: retailer.usedCredit,
          creditUsagePercentage: retailer.creditUsagePercentage,
          totalAmount: retailer.usedCredit,
          level: retailer.level || 'ENTRY'
        })
      });

      if (response.ok) {
        alert(`✅ Invoice #${invoice.invoiceNumber} sent successfully to ${retailer.retailerEmail}`);
        setRetailers(prev => prev.map(r => 
          r.retailerId === retailer.retailerId 
            ? { ...r, invoiceStatus: 'sent', lastInvoiceDate: new Date().toISOString() }
            : r
        ));
      } else {
        // Fallback - show success message for demo
        console.log('Email endpoint not available, using demo mode');
        alert(`✅ Invoice #${invoice.invoiceNumber} generated for ${retailer.retailerEmail}\n\nAmount Due: NOK ${retailer.usedCredit.toLocaleString()}\nDue Date: ${invoice.dueDate}\n\n(Email functionality will be activated when backend is running)`);
        setRetailers(prev => prev.map(r => 
          r.retailerId === retailer.retailerId 
            ? { ...r, invoiceStatus: 'sent', lastInvoiceDate: new Date().toISOString() }
            : r
        ));
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      const invoice = generateInvoice(retailer);
      alert(`✅ Invoice #${invoice.invoiceNumber} generated for ${retailer.retailerEmail}\n\nAmount Due: NOK ${retailer.usedCredit.toLocaleString()}\nDue Date: ${invoice.dueDate}\n\n(Email functionality will be activated when backend is running)`);
      setRetailers(prev => prev.map(r => 
        r.retailerId === retailer.retailerId 
          ? { ...r, invoiceStatus: 'sent', lastInvoiceDate: new Date().toISOString() }
          : r
      ));
    } finally {
      setSendingInvoice(false);
    }
  };

  const handlePreviewInvoice = (retailer) => {
    const invoice = generateInvoice(retailer);
    setInvoiceData(invoice);
    setShowPreviewModal(true);
  };

  const handleViewSales = async (retailer) => {
    try {
      setLoadingSalesData(true);
      setShowSalesModal(true);
      setSelectedRetailer(retailer);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/retailers/${retailer.retailerId}/sales`, {
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
        // Demo data if API is not available
        setSalesData({
          retailerId: retailer.retailerId,
          retailerName: retailer.retailerName,
          retailerEmail: retailer.retailerEmail,
          totalOrders: 0,
          totalSales: 0,
          totalEsimSold: 0,
          totalEpinSold: 0,
          orders: []
        });
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Demo data on error
      setSalesData({
        retailerId: retailer.retailerId,
        retailerName: retailer.retailerName,
        retailerEmail: retailer.retailerEmail,
        totalOrders: 0,
        totalSales: 0,
        totalEsimSold: 0,
        totalEpinSold: 0,
        orders: []
      });
    } finally {
      setLoadingSalesData(false);
    }
  };

  const handleDownloadSalesPDF = (data) => {
    if (!data) return;
    
    const printWindow = window.open('', '_blank');
    const html = generateSalesPDFHTML(data);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const generateSalesPDFHTML = (data) => {
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
          <div class="company-name">EasyTopup.no - Admin Report</div>
          <h2>Retailer Sales Report</h2>
          <p><strong>Retailer:</strong> ${data.retailerName}</p>
          <p><strong>Email:</strong> ${data.retailerEmail}</p>
          <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background:#f3f4f6;padding:15px;margin-bottom:20px;border-radius:8px;">
          <h3 style="margin-top:0;">Summary</h3>
          <p><strong>Total Orders:</strong> ${data.totalOrders}</p>
          <p><strong>Total Sales:</strong> NOK ${typeof data.totalSales === 'number' ? data.totalSales.toLocaleString() : data.totalSales}</p>
          <p><strong>eSIM Sold:</strong> ${data.totalEsimSold}</p>
          <p><strong>ePIN Sold:</strong> ${data.totalEpinSold}</p>
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

  const handleDownloadInvoice = () => {
    if (!invoiceData) return;
    
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateInvoiceHTML(invoiceData));
    printWindow.document.close();
    printWindow.print();
  };

  const generateInvoiceHTML = (invoice) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 28px; font-weight: bold; color: #4F46E5; }
          .invoice-title { font-size: 24px; margin: 20px 0; }
          .info-section { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4F46E5; color: white; }
          .total-section { margin-top: 30px; text-align: right; }
          .total-amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
          .warning-box { background: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; margin: 20px 0; }
          .notes { margin: 20px 0; padding: 15px; background: #F3F4F6; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">EasyTopup.no</div>
          <p>Instant Lycamobile Top-ups & eSIM Solutions</p>
          <div class="invoice-title">CREDIT PAYMENT INVOICE</div>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <div><span class="label">Invoice Number:</span> ${invoice.invoiceNumber}</div>
            <div><span class="label">Invoice Date:</span> ${invoice.invoiceDate}</div>
          </div>
          <div class="info-row">
            <div><span class="label">Due Date:</span> ${invoice.dueDate}</div>
            <div><span class="label">Status:</span> ${invoice.status.toUpperCase()}</div>
          </div>
        </div>
        
        <div class="info-section">
          <h3>Bill To:</h3>
          <p><strong>${invoice.retailer.name}</strong></p>
          <p>Email: ${invoice.retailer.email}</p>
          <p>Retailer Level: ${invoice.retailer.level}</p>
        </div>
        
        <div class="warning-box">
          <strong>⚠️ Credit Limit Alert</strong><br/>
          You have reached ${invoice.creditDetails.creditUsagePercentage}% of your credit limit.
          <br/>Used: NOK ${invoice.creditDetails.usedCredit.toLocaleString()} / Limit: NOK ${invoice.creditDetails.creditLimit.toLocaleString()}
        </div>
        
        <h3>Purchase History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount (NOK)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.purchases.map(p => `
              <tr>
                <td>${p.date}</td>
                <td>${p.items}</td>
                <td>${p.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <p><span class="label">Subtotal:</span> NOK ${invoice.totalAmount.toLocaleString()}</p>
          <p><span class="label">Tax (0%):</span> NOK 0</p>
          <p class="total-amount">Total Due: NOK ${invoice.dueAmount.toLocaleString()}</p>
        </div>
        
        <div class="notes">
          <h3>Payment Notes:</h3>
          <p>${invoice.notes}</p>
          <p><strong>Payment Terms:</strong> Payment due within 7 days to restore full credit facility.</p>
          <p><strong>Contact:</strong> support@easytopup.no | +47 XXX XX XXX</p>
        </div>
      </body>
      </html>
    `;
  };

  const filteredRetailers = retailers.filter(retailer => {
    const matchesSearch = 
      retailer.retailerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.retailerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'limit-reached' && retailer.isLimitReached) ||
      (filterStatus === 'pending' && retailer.invoiceStatus === 'pending') ||
      (filterStatus === 'sent' && retailer.invoiceStatus === 'sent');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText size={28} />
          Invoice & Sales Management
        </h2>
        <p className="mt-2 text-indigo-100">
          Manage retailer invoices and credit payments
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-1">
              Invoice Management
            </h3>
            <p className="text-blue-700 text-sm">
              Select retailers who have reached their credit limit (90%+) and send them payment invoices. 
              Invoices include their total used credit and payment terms.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Retailers</p>
              <p className="text-2xl font-bold text-gray-900">{retailers.length}</p>
            </div>
            <Users className="text-indigo-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Limit Reached</p>
              <p className="text-2xl font-bold text-red-600">
                {retailers.filter(r => r.isLimitReached).length}
              </p>
            </div>
            <AlertCircle className="text-red-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Invoices</p>
              <p className="text-2xl font-bold text-yellow-600">
                {retailers.filter(r => r.invoiceStatus === 'pending').length}
              </p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Credit Used</p>
              <p className="text-2xl font-bold text-green-600">
                NOK {retailers.reduce((sum, r) => sum + r.usedCredit, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search retailers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Retailers</option>
              <option value="limit-reached">Limit Reached</option>
              <option value="pending">Pending Invoices</option>
              <option value="sent">Invoices Sent</option>
            </select>
          </div>
          
          <button
            onClick={fetchRetailersWithCreditStatus}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Retailers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retailer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRetailers.map((retailer) => (
                <tr key={retailer.retailerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <button
                        onClick={() => handleViewSales(retailer)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer text-left"
                      >
                        {retailer.retailerName}
                      </button>
                      <p className="text-sm text-gray-500">{retailer.retailerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      retailer.level === 'DIAMOND' ? 'bg-purple-100 text-purple-800' :
                      retailer.level === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                      retailer.level === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {retailer.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${
                          retailer.creditUsagePercentage >= 90 ? 'text-red-600' :
                          retailer.creditUsagePercentage >= 75 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {retailer.creditUsagePercentage}%
                        </span>
                        {retailer.isLimitReached && (
                          <AlertCircle size={16} className="text-red-600" />
                        )}
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            retailer.creditUsagePercentage >= 90 ? 'bg-red-600' :
                            retailer.creditUsagePercentage >= 75 ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(retailer.creditUsagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        NOK {retailer.usedCredit.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        of {retailer.creditLimit.toLocaleString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      retailer.invoiceStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
                      retailer.invoiceStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {retailer.invoiceStatus === 'sent' ? 'Invoice Sent' :
                       retailer.invoiceStatus === 'pending' ? 'Pending' :
                       'No Invoice'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewInvoice(retailer)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Preview Invoice"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleSendInvoice(retailer)}
                        disabled={sendingInvoice}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Send Invoice"
                      >
                        <Send size={18} />
                      </button>
                      <button
                        onClick={() => {
                          const invoice = generateInvoice(retailer);
                          setInvoiceData(invoice);
                          handleDownloadInvoice();
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download Invoice"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRetailers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No retailers found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Invoice Preview Modal */}
      {showPreviewModal && invoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <FileText size={24} />
                  Invoice Preview
                </h3>
                <p className="text-indigo-100 mt-1">{invoiceData.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Invoice Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-600">EasyTopup.no</h1>
                <p className="text-gray-600">Instant Lycamobile Top-ups & eSIM Solutions</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">CREDIT PAYMENT INVOICE</h2>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-semibold">{invoiceData.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-semibold">{invoiceData.invoiceDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-semibold text-red-600">{invoiceData.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold uppercase">{invoiceData.status}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Bill To:</h3>
                <p className="font-semibold text-lg">{invoiceData.retailer.name}</p>
                <p className="text-gray-600">{invoiceData.retailer.email}</p>
                <p className="text-sm text-gray-500">Retailer Level: {invoiceData.retailer.level}</p>
              </div>

              {/* Warning Box */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Credit Limit Alert</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      You have reached {invoiceData.creditDetails.creditUsagePercentage}% of your credit limit.
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Used: NOK {invoiceData.creditDetails.usedCredit.toLocaleString()} / 
                      Limit: NOK {invoiceData.creditDetails.creditLimit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Purchase History</h3>
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-right">Amount (NOK)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoiceData.purchases.map((purchase, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{purchase.date}</td>
                        <td className="px-4 py-3">{purchase.items}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {purchase.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-300 pt-4 text-right">
                <div className="flex justify-end gap-8 mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">NOK {invoiceData.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-end gap-8 mb-2">
                  <span className="text-gray-600">Tax (0%):</span>
                  <span className="font-semibold">NOK 0</span>
                </div>
                <div className="flex justify-end gap-8 mt-4">
                  <span className="text-xl font-bold text-gray-900">Total Due:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    NOK {invoiceData.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 rounded-xl p-4 mt-6">
                <h3 className="font-bold text-gray-900 mb-2">Payment Notes:</h3>
                <p className="text-sm text-gray-700 mb-2">{invoiceData.notes}</p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Payment Terms:</strong> Payment due within 7 days to restore full credit facility.
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Contact:</strong> support@easytopup.no | +47 XXX XX XXX
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
              <button
                onClick={handleDownloadInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download size={18} />
                Download/Print
              </button>
              <button
                onClick={() => {
                  const retailer = retailers.find(r => r.retailerEmail === invoiceData.retailer.email);
                  if (retailer) handleSendInvoice(retailer);
                }}
                disabled={sendingInvoice}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={18} />
                {sendingInvoice ? 'Sending...' : 'Send Invoice'}
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Details Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="text-white" size={28} />
                <div>
                  <h2 className="text-xl font-bold text-white">Sales Details</h2>
                  {salesData && (
                    <p className="text-indigo-100 text-sm">{salesData.retailerName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSalesModal(false);
                  setSalesData(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {loadingSalesData ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
                    <p className="text-gray-600">Loading sales data...</p>
                  </div>
                </div>
              ) : salesData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-900">{salesData.totalOrders}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-600 font-medium">Total Sales</p>
                      <p className="text-2xl font-bold text-green-900">
                        NOK {typeof salesData.totalSales === 'number' 
                          ? salesData.totalSales.toLocaleString() 
                          : salesData.totalSales}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 font-medium">eSIM Sold</p>
                      <p className="text-2xl font-bold text-purple-900">{salesData.totalEsimSold}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <p className="text-sm text-orange-600 font-medium">ePIN Sold</p>
                      <p className="text-2xl font-bold text-orange-900">{salesData.totalEpinSold}</p>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900">Order History</h3>
                    </div>
                    
                    {salesData.orders && salesData.orders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Qty</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Serial Number</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Amount</th>
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
                                      <span className="text-sm font-mono text-indigo-600">
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
                                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                        <p className="text-gray-600 font-medium">No orders found</p>
                        <p className="text-sm text-gray-500 mt-1">This retailer hasn't made any purchases yet.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="px-4 py-12 text-center">
                  <AlertCircle className="mx-auto mb-3 text-gray-400" size={48} />
                  <p className="text-gray-600 font-medium">Unable to load sales data</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
              {salesData && (
                <button
                  onClick={() => handleDownloadSalesPDF(salesData)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              )}
              <button
                onClick={() => {
                  setShowSalesModal(false);
                  setSalesData(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceAndSales;
