import React from 'react';
import { Navigate } from 'react-router-dom';
import { User, Mail, Calendar, Settings, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            My Profile
          </h1>
          <p className="text-gray-600 font-body text-lg">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <img 
                src={user?.avatar} 
                alt={user?.name}
                className="w-24 h-24 rounded-2xl mx-auto mb-6 object-cover shadow-lg"
              />
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                {user?.name}
              </h2>
              <p className="text-gray-600 font-accent mb-6">
                {user?.email}
              </p>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-accent font-semibold py-3 px-6 rounded-xl transition-colors">
                  <Settings size={18} />
                  Edit Profile
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-accent font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User size={24} className="text-blue-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-accent font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 font-body text-gray-900">
                    {user?.name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-accent font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 font-body text-gray-900 flex items-center gap-2">
                    <Mail size={18} className="text-gray-500" />
                    {user?.email}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-accent font-semibold text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 font-body text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-gray-500" />
                    {new Date(user?.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-accent font-semibold text-gray-700 mb-2">
                    Account Status
                  </label>
                  <div className="bg-green-50 rounded-xl p-4 font-body text-green-800 flex items-center gap-2">
                    <Shield size={18} className="text-green-600" />
                    Active & Verified
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Settings size={24} className="text-blue-600" />
                Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-accent font-semibold text-gray-700 mb-2">
                    Currency
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 font-body text-gray-900">
                    {user?.preferences?.currency || 'USD'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-accent font-semibold text-gray-700 mb-2">
                    Language
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 font-body text-gray-900">
                    {user?.preferences?.language === 'en' ? 'English' : user?.preferences?.language}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-accent font-semibold text-gray-700 mb-2">
                    Notifications
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 font-body text-gray-900">
                    {user?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Recent Activity
              </h3>
              <div className="text-center py-12 text-gray-500">
                <p className="font-body">No recent activity to display</p>
                <p className="font-caption text-sm mt-2">Your transaction history will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;