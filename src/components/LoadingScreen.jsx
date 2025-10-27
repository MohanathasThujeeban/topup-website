import React, { useState, useEffect } from 'react';
import { 
  Loader2, Zap, Shield, Globe, Database, Wifi, 
  CheckCircle, Clock, RefreshCw, ArrowRight
} from 'lucide-react';

const LoadingScreen = ({ 
  title = 'Loading',
  subtitle = 'Please wait while we prepare your content',
  variant = 'default',
  showProgress = true,
  showSteps = false,
  steps = [],
  onSkip = null,
  fullscreen = true,
  className = ''
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  const variants = {
    default: {
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-slate-50 via-blue-50 to-indigo-100',
      textColor: 'text-gray-800',
      accentColor: 'text-indigo-600',
      buttonColor: 'from-indigo-600 to-blue-600'
    },
    success: {
      gradient: 'from-green-600 to-emerald-600',
      bgGradient: 'from-slate-50 via-green-50 to-emerald-100',
      textColor: 'text-gray-800',
      accentColor: 'text-green-600',
      buttonColor: 'from-green-600 to-emerald-600'
    },
    warning: {
      gradient: 'from-yellow-600 to-orange-600',
      bgGradient: 'from-slate-50 via-yellow-50 to-orange-100',
      textColor: 'text-gray-800',
      accentColor: 'text-orange-600',
      buttonColor: 'from-yellow-600 to-orange-600'
    },
    purple: {
      gradient: 'from-purple-600 to-violet-600',
      bgGradient: 'from-slate-50 via-purple-50 to-violet-100',
      textColor: 'text-gray-800',
      accentColor: 'text-purple-600',
      buttonColor: 'from-purple-600 to-violet-600'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  const defaultSteps = [
    { icon: Database, text: 'Getting things ready' },
    { icon: Wifi, text: 'Connecting securely' },
    { icon: Shield, text: 'Keeping you safe' },
    { icon: Globe, text: 'Loading your content' },
    { icon: CheckCircle, text: "You're all set!" }
  ];

  const loadingSteps = steps.length > 0 ? steps : defaultSteps;

  useEffect(() => {
    // Animated dots
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Progress simulation
    if (showProgress) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 12;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);

      return () => {
        clearInterval(dotInterval);
        clearInterval(progressInterval);
      };
    }

    // Step progression
    if (showSteps && loadingSteps.length > 0) {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          clearInterval(stepInterval);
          return prev;
        });
      }, 1000);

      return () => {
        clearInterval(dotInterval);
        clearInterval(stepInterval);
      };
    }

    return () => clearInterval(dotInterval);
  }, [showProgress, showSteps, loadingSteps.length]);

  const containerClass = fullscreen 
    ? `min-h-screen bg-gradient-to-br ${currentVariant.bgGradient} relative overflow-hidden`
    : `bg-gradient-to-br ${currentVariant.bgGradient} relative overflow-hidden p-8 rounded-2xl`;

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse" 
             style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-pulse" 
             style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`relative z-10 flex items-center justify-center ${fullscreen ? 'min-h-screen' : 'min-h-[400px]'} p-4`}>
        <div className="text-center max-w-md w-full">
          {/* Title Section */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${currentVariant.textColor} mb-2`}>
              {title}{dots}
            </h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {/* Main Loading Animation */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto relative">
              {/* Spinning Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className={`absolute inset-0 rounded-full border-4 border-t-transparent bg-gradient-to-r ${currentVariant.gradient} animate-spin`}
                   style={{
                     maskImage: 'conic-gradient(transparent 270deg, black 360deg)',
                     WebkitMaskImage: 'conic-gradient(transparent 270deg, black 360deg)'
                   }}></div>
              
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className={`w-8 h-8 ${currentVariant.accentColor} animate-pulse`} />
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <Zap className={`absolute w-4 h-4 ${currentVariant.accentColor} animate-ping`} 
                   style={{ top: '20%', right: '25%' }} />
              <Globe className={`absolute w-3 h-3 ${currentVariant.accentColor} animate-ping`} 
                     style={{ bottom: '20%', left: '30%', animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className={`text-sm font-semibold ${currentVariant.accentColor}`}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full bg-gradient-to-r ${currentVariant.gradient} transition-all duration-300 ease-out`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Loading Steps */}
          {showSteps && loadingSteps.length > 0 && (
            <div className="mb-8 space-y-2">
              {loadingSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-500 ${
                      isActive 
                        ? 'bg-white shadow-md scale-105' 
                        : isCompleted 
                          ? 'bg-green-50' 
                          : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                          ? `bg-gradient-to-r ${currentVariant.gradient} text-white` 
                          : 'bg-gray-300 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      isActive ? currentVariant.textColor + ' font-medium' : 'text-gray-500'
                    }`}>
                      {step.text}
                    </span>
                    {isActive && (
                      <ArrowRight className={`w-4 h-4 ${currentVariant.accentColor} animate-pulse ml-auto`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          {onSkip && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={onSkip}
                className="px-6 py-3 bg-white text-gray-600 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 justify-center"
              >
                <Clock className="w-4 h-4" />
                Skip
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className={`px-6 py-3 bg-gradient-to-r ${currentVariant.buttonColor} text-white rounded-xl hover:shadow-xl transition-all duration-200 shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 justify-center`}
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;