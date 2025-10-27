import React, { useState } from 'react';
import { Package, Users, BarChart3, Database, Shield, Globe } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import LoadingScreen from './LoadingScreen';
import AdminLoadingScreen from './AdminLoadingScreen';

const LoadingScreenShowcase = () => {
  const [currentDemo, setCurrentDemo] = useState('spinner');
  const [showFullScreen, setShowFullScreen] = useState(false);

  const customSteps = [
    { icon: Package, text: 'Loading products' },
    { icon: Users, text: 'Fetching user data' },
    { icon: BarChart3, text: 'Calculating analytics' },
    { icon: Database, text: 'Syncing database' },
    { icon: Shield, text: 'Verifying security' },
    { icon: Globe, text: 'Finalizing setup' }
  ];

  const demos = {
    spinner: {
      title: 'Loading Spinner',
      description: 'Compact spinner for inline loading states'
    },
    screen: {
      title: 'Loading Screen',
      description: 'Full-featured loading screen with progress and steps'
    },
    admin: {
      title: 'Admin Loading Screen',
      description: 'Specialized loading screen for admin dashboard'
    }
  };

  if (showFullScreen) {
    switch (currentDemo) {
      case 'screen':
        return (
          <LoadingScreen
            title="Loading Your Dashboard"
            subtitle="Setting up your personalized experience"
            variant="default"
            showProgress={true}
            showSteps={true}
            steps={customSteps}
            onSkip={() => setShowFullScreen(false)}
          />
        );
      case 'admin':
        return (
          <AdminLoadingScreen
            onSkip={() => setShowFullScreen(false)}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Loading Screen Showcase</h1>
          <p className="text-gray-600 text-lg">Explore our enhanced loading components</p>
        </div>

        {/* Demo Selection */}
        <div className="flex justify-center gap-4 mb-8">
          {Object.entries(demos).map(([key, demo]) => (
            <button
              key={key}
              onClick={() => setCurrentDemo(key)}
              className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                currentDemo === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {demo.title}
            </button>
          ))}
        </div>

        {/* Current Demo Info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {demos[currentDemo].title}
          </h2>
          <p className="text-gray-600">{demos[currentDemo].description}</p>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Compact Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Compact Preview</h3>
            
            {currentDemo === 'spinner' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Default Spinner</h4>
                  <LoadingSpinner message="Loading data..." />
                </div>
                
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Large with Progress</h4>
                  <LoadingSpinner 
                    message="Processing request..."
                    submessage="This may take a few moments"
                    variant="purple"
                    size="large"
                    showProgress={true}
                    progress={65}
                  />
                </div>
              </div>
            )}

            {currentDemo === 'screen' && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
                <LoadingScreen
                  title="Dashboard"
                  subtitle="Loading your content"
                  variant="default"
                  showProgress={true}
                  showSteps={false}
                  fullscreen={false}
                  onSkip={() => alert('Loading skipped!')}
                />
              </div>
            )}

            {currentDemo === 'admin' && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-600 mb-4">
                  Admin loading screen is designed for full-screen display.
                </p>
                <p className="text-sm text-gray-500">
                  Use the "View Fullscreen" button to see the complete experience.
                </p>
              </div>
            )}
          </div>

          {/* Variants & Options */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Variants</h3>
              
              {currentDemo === 'spinner' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-xl">
                    <LoadingSpinner variant="default" size="small" message="" />
                    <p className="text-xs mt-2 text-gray-600">Default</p>
                  </div>
                  <div className="text-center p-4 border rounded-xl">
                    <LoadingSpinner variant="success" size="small" message="" />
                    <p className="text-xs mt-2 text-gray-600">Success</p>
                  </div>
                  <div className="text-center p-4 border rounded-xl">
                    <LoadingSpinner variant="warning" size="small" message="" />
                    <p className="text-xs mt-2 text-gray-600">Warning</p>
                  </div>
                  <div className="text-center p-4 border rounded-xl">
                    <LoadingSpinner variant="purple" size="small" message="" />
                    <p className="text-xs mt-2 text-gray-600">Purple</p>
                  </div>
                </div>
              )}

              {currentDemo === 'screen' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-gray-700">Show Progress Bar</span>
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-gray-700">Show Loading Steps</span>
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-gray-700">Skip Button</span>
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-gray-700">Multiple Variants</span>
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  </div>
                </div>
              )}

              {currentDemo === 'admin' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-gray-700">Animated Steps</span>
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-gray-700">Progress Tracking</span>
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-gray-700">Background Animation</span>
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-gray-700">Skip & Retry Options</span>
                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowFullScreen(true)}
              disabled={currentDemo === 'spinner'}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                currentDemo === 'spinner'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {currentDemo === 'spinner' ? 'Spinner Only' : 'View Fullscreen'}
            </button>
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Usage Example</h3>
          <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            {currentDemo === 'spinner' && (
              <pre className="text-gray-700">
{`import LoadingSpinner from './LoadingSpinner';

// Basic usage
<LoadingSpinner message="Loading..." />

// With progress and variant
<LoadingSpinner 
  message="Processing request..."
  submessage="Please wait"
  variant="success"
  size="large"
  showProgress={true}
  progress={75}
/>`}
              </pre>
            )}

            {currentDemo === 'screen' && (
              <pre className="text-gray-700">
{`import LoadingScreen from './LoadingScreen';

// Full-screen loading with steps
<LoadingScreen
  title="Loading Dashboard"
  subtitle="Setting up your experience"
  variant="default"
  showProgress={true}
  showSteps={true}
  steps={customSteps}
  onSkip={() => handleSkip()}
/>`}
              </pre>
            )}

            {currentDemo === 'admin' && (
              <pre className="text-gray-700">
{`import AdminLoadingScreen from './AdminLoadingScreen';

// Admin dashboard loading
<AdminLoadingScreen 
  onSkip={() => setLoading(false)}
/>`}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreenShowcase;