import React, { useState, useEffect } from 'react';
import { 
  Shield, RefreshCw, Zap, Database, Wifi, Globe, 
  Users, Package, BarChart3, Settings, CheckCircle,
  Clock, Activity, Server, Lock
} from 'lucide-react';

const AdminLoadingScreen = ({ onSkip }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  const encouragingMessages = [
    "We're getting everything ready for you",
    "Almost there, just a moment more",
    "Setting up your personalized experience", 
    "Your dashboard will be ready soon",
    "Thanks for your patience"
  ];

  const loadingSteps = [
    { icon: Database, text: 'Setting up your workspace', color: 'text-blue-500' },
    { icon: Server, text: 'Starting your session', color: 'text-green-500' },
    { icon: Lock, text: 'Securing your account', color: 'text-purple-500' },
    { icon: Users, text: 'Loading customer information', color: 'text-orange-500' },
    { icon: Package, text: 'Preparing your products', color: 'text-indigo-500' },
    { icon: BarChart3, text: 'Getting your reports ready', color: 'text-pink-500' },
    { icon: CheckCircle, text: 'Welcome to your dashboard!', color: 'text-emerald-500' }
  ];

  useEffect(() => {
    // Animated dots
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 800);

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % encouragingMessages.length);
    }, 2000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md w-full">
          {/* Logo/Brand Area */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-bounce">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back, Admin!</h1>
            <p className="text-gray-600 transition-all duration-500">
              {encouragingMessages[messageIndex]}{dots}
            </p>
          </div>

          {/* Main Loading Spinner */}
          <div className="relative mb-8">
            {/* Outer Ring */}
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-blue-500 border-transparent animate-spin"></div>
              
              {/* Inner Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-indigo-600 mx-auto mb-1 animate-pulse" />
                  <div className="text-sm font-bold text-indigo-600">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute inset-0">
                <Zap className="absolute w-4 h-4 text-yellow-500 animate-ping" style={{ top: '10%', right: '20%' }} />
                <Globe className="absolute w-3 h-3 text-blue-500 animate-ping" style={{ bottom: '15%', left: '25%', animationDelay: '0.5s' }} />
                <Settings className="absolute w-3 h-3 text-purple-500 animate-ping" style={{ top: '30%', left: '15%', animationDelay: '1s' }} />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Loading Steps */}
          <div className="mb-8 space-y-3">
            {loadingSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                    isActive 
                      ? 'bg-white shadow-lg scale-105 border-2 border-indigo-200' 
                      : isCompleted 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-100 opacity-60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-indigo-100' 
                        : 'bg-gray-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? step.color : 'text-gray-400'}`} />
                    )}
                  </div>
                  <span className={`flex-1 text-left ${
                    isActive 
                      ? 'text-gray-800 font-medium' 
                      : isCompleted 
                        ? 'text-green-700' 
                        : 'text-gray-500'
                  }`}>
                    {step.text}
                  </span>
                  {isActive && (
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping"></div>
                      <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={onSkip}
              className="px-6 py-3 bg-white text-gray-600 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 justify-center"
            >
              <Clock className="w-4 h-4" />
              Continue Anyway
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 justify-center"
            >
              <RefreshCw className="w-4 h-4" />
              Start Fresh
            </button>
          </div>

          {/* Status Message */}
          <p className="mt-6 text-xs text-gray-400">
            Creating your personalized workspace experience...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoadingScreen;