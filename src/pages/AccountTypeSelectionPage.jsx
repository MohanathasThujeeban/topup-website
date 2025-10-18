import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, ArrowLeft, CheckCircle, Star, Zap } from 'lucide-react';

const AccountTypeSelectionPage = () => {
  const navigate = useNavigate();

  const accountTypes = [
    {
      type: 'personal',
      title: 'Personal Account',
      subtitle: 'For individual customers',
      description: 'Perfect for personal use with access to all prepaid bundles, eSIMs, and rewards.',
      features: [
        'Browse and purchase all products',
        'Reward points system',
        'Referral program',
        'Purchase history and invoices',
        'Quick registration process'
      ],
      icon: User,
      color: 'blue',
      route: '/signup/personal'
    },
    {
      type: 'business',
      title: 'Business Account',
      subtitle: 'For retailers and businesses',
      description: 'Designed for businesses with bulk purchases, special pricing, and advanced features.',
      features: [
        'Wholesale pricing',
        'Bulk purchase options',
        'Business invoicing',
        'Priority support',
        'Account manager access'
      ],
      icon: Building2,
      color: 'green',
      route: '/signup/business'
    }
  ];

  const handleAccountTypeSelect = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-500 rounded-full filter blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            to="/" 
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Account Type
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the account type that best fits your needs. You can always upgrade later.
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {accountTypes.map((account) => {
              const IconComponent = account.icon;
              return (
                <div
                  key={account.type}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
                >
                  {/* Popular Badge for Personal */}
                  {account.type === 'personal' && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Popular
                    </div>
                  )}

                  <div className="p-8">
                    {/* Icon */}
                    <div className={`inline-flex p-4 rounded-2xl bg-${account.color}-100 mb-6`}>
                      <IconComponent className={`w-8 h-8 text-${account.color}-600`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {account.title}
                    </h3>
                    <p className="text-gray-500 font-medium mb-4">
                      {account.subtitle}
                    </p>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {account.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {account.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleAccountTypeSelect(account.route)}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-${account.color}-500 to-${account.color}-600 hover:from-${account.color}-600 hover:to-${account.color}-700 shadow-lg hover:shadow-xl`}
                    >
                      Create {account.title}
                    </button>
                  </div>

                  {/* Decorative Element */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${account.color}-400 to-${account.color}-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                </div>
              );
            })}
          </div>

          {/* Existing Account */}
          <div className="text-center mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <p className="text-gray-600 mb-4">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSelectionPage;