import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';

const TermsPage = () => {
  const lastUpdated = "December 3, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      
      {/* Breadcrumb */}
      <div className="bg-bgLight py-4">
        <div className="container-custom px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-600">Terms & Conditions</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-300/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-600 rounded-full flex items-center justify-center shadow-2xl">
                <FileText className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6 font-display">
              Terms & <span className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent">Conditions</span>
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-8">
              <Calendar className="w-5 h-5" />
              <span>Last updated: {lastUpdated}</span>
            </div>
            
            <p className="text-xl text-gray-600 font-body leading-relaxed">
              Our terms and conditions will be available soon.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl">
              
              {/* Important Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-blue-800 mb-2">Coming Soon</h3>
                    <p className="text-blue-700">
                      We are currently preparing our comprehensive terms and conditions. This page will be updated shortly with detailed information about our services, policies, and user agreements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-12">
                <FileText className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Terms & Conditions</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  This page is currently being updated. Please check back soon for our complete terms and conditions.
                </p>
                <p className="text-gray-500 text-sm">
                  For any questions or concerns, please contact our support team.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;