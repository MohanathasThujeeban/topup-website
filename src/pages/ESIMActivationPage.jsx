import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Globe2, CheckCircle, Smartphone, AlertCircle, 
  Download, ChevronRight, Wifi, QrCode, Info
} from 'lucide-react';

export default function ESIMActivationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [esimCode, setEsimCode] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Get parameters from URL
    const code = searchParams.get('code');
    const serial = searchParams.get('serial');
    
    if (code) setEsimCode(code);
    if (serial) setSerialNumber(serial);
  }, [searchParams]);

  const handleActivation = async () => {
    if (!esimCode || !serialNumber) {
      setError('eSIM code and serial number are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual activation API call
      // const response = await fetch('/api/esim/activate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ esimCode, serialNumber })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to next step - show instructions
      setStep(2);
    } catch (err) {
      setError('Failed to verify eSIM. Please contact support.');
      console.error('Activation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe2 className="text-green-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EasyTopup.no</h1>
                <p className="text-sm text-gray-600">eSIM Activation</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 ? (
          /* Step 1: Verification */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="text-green-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Activate Your eSIM
              </h2>
              <p className="text-gray-600">
                Enter your eSIM details to begin activation
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="text-red-400 mr-3" size={20} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  eSIM Code
                </label>
                <input
                  type="text"
                  value={esimCode}
                  onChange={(e) => setEsimCode(e.target.value)}
                  placeholder="Enter your eSIM code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  readOnly={searchParams.get('code') !== null}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Enter serial number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  readOnly={searchParams.get('serial') !== null}
                />
              </div>

              <button
                onClick={handleActivation}
                disabled={loading || !esimCode || !serialNumber}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 mt-0.5" size={20} />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Need Help?</p>
                  <p>If you don't have your eSIM code, please contact our support team or check your email for activation details.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Activation Instructions */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                eSIM Verified Successfully!
              </h2>
              <p className="text-gray-600">
                Follow the steps below to complete activation
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {/* Step 1 */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Smartphone size={18} />
                    Open Settings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Go to <strong>Settings → Mobile Data → Add eSIM</strong> on your device
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <QrCode size={18} />
                    Scan QR Code or Enter Details
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Use your device camera to scan the QR code provided, or manually enter:
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">eSIM Code:</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">{esimCode}</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Download size={18} />
                    Install eSIM Profile
                  </h3>
                  <p className="text-sm text-gray-600">
                    Confirm the installation when prompted. Your device will download and install the eSIM profile.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Wifi size={18} />
                    Activate & Connect
                  </h3>
                  <p className="text-sm text-gray-600">
                    Once installed, turn on the eSIM and enable mobile data. You're all set!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-400 mt-0.5" size={20} />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-1">Important Note</p>
                  <p>Make sure you have a stable WiFi connection during activation. The process may take a few minutes.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all"
              >
                Return Home
              </button>
              <button
                onClick={() => navigate('/support')}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
              >
                Need Help?
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            © 2025 EasyTopup.no - All rights reserved | Need help? Contact our support team
          </p>
        </div>
      </footer>
    </div>
  );
}
