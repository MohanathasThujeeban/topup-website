import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Package, DollarSign, TrendingUp, Clock, 
  AlertCircle, CheckCircle, Eye, Edit, Plus, Search, RefreshCw,
  ShoppingCart, Award, Activity, Bell, Download, LogOut, Tag,
  Menu, X, Building, Box, MessageCircle, PieChart, Globe2, Copy
} from 'lucide-react';

const RetailerDashboard = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-4">
          <h2>Test Header</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="text-indigo-600" size={24} />
                  Special Offers & Promotions
                </h3>
                <p className="text-gray-600 mb-6">
                  Take advantage of exclusive promotional offers and reward campaigns!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;