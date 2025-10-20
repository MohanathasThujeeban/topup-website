import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Building2, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function RetailerLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login({ email: email.trim().toLowerCase(), password });
    setLoading(false);
    if (res.success) {
      // If user is not business, route guard will bounce them later
      const from = location.state?.from?.pathname || '/retailer/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center">
            <Building2 />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Retailer Login</h1>
            <p className="text-sm text-gray-600">Sign in to your B2B account</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input className="w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                     value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="retailer@company.no" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input className="w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                     value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="••••••••" />
            </div>
          </div>
          <button disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold">
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <Link to="/support" className="text-blue-600 hover:text-blue-800">Need help?</Link>
        </div>
      </div>
    </div>
  );
}
