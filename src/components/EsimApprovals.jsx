import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, User, Mail, Phone, Shield, Calendar } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://topup-backend-production.up.railway.app/api'
  : 'http://localhost:8080/api';

export default function EsimApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/admin/esim-requests?status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      const data = await response.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching eSIM requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this eSIM request?')) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail') || 'admin@topup.no';

      const response = await fetch(
        `${API_BASE_URL}/admin/esim-requests/${requestId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ adminEmail: userEmail })
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('eSIM request approved successfully! Email sent to customer.');
        fetchRequests(); // Refresh list
      } else {
        alert('Error approving request: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/admin/esim-requests/${requestId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ reason: rejectionReason })
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('eSIM request rejected. Customer will be notified.');
        setShowModal(false);
        setRejectionReason('');
        fetchRequests();
      } else {
        alert('Error rejecting request: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center gap-1">
          <Clock size={14} /> Pending
        </span>;
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1">
          <CheckCircle size={14} /> Approved
        </span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold flex items-center gap-1">
          <XCircle size={14} /> Rejected
        </span>;
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">eSIM Approval Requests</h2>
        <p className="text-gray-600">Review and approve customer eSIM purchase requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            filter === 'PENDING'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            filter === 'APPROVED'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            filter === 'REJECTED'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No {filter.toLowerCase()} requests found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Order #{request.orderNumber}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(request.requestDate).toLocaleString()}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Customer Name</p>
                    <p className="font-semibold">{request.customerFullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold">{request.customerEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-semibold">{request.customerPhone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">ID Type</p>
                    <p className="font-semibold capitalize">{request.idType?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">ID Number</p>
                    <p className="font-mono font-bold text-gray-800">{request.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Product</p>
                    <p className="font-semibold text-gray-800">{request.productName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="font-bold text-green-600">NOK {request.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-800 capitalize">{request.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {request.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle size={20} />
                    {processing ? 'Processing...' : 'Approve & Assign eSIM'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowModal(true);
                    }}
                    disabled={processing}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={20} />
                    Reject Request
                  </button>
                </div>
              )}

              {request.status === 'APPROVED' && request.assignedEsimSerial && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Assigned eSIM:</p>
                  <p className="font-mono font-bold text-green-800">{request.assignedEsimSerial}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Approved on: {new Date(request.approvedDate).toLocaleString()}
                  </p>
                </div>
              )}

              {request.status === 'REJECTED' && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Rejection Reason:</p>
                  <p className="text-red-800">{request.rejectionReason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Rejected on: {new Date(request.rejectedDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject eSIM Request</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this request:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border-2 border-gray-300 rounded-lg p-3 mb-4 min-h-[100px]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleReject(selectedRequest.id)}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectionReason('');
                }}
                disabled={processing}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
