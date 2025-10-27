import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, User, Shield, CreditCard, CheckCircle, 
  Smartphone, QrCode, Mail, Phone, FileText, AlertCircle,
  ArrowLeft, ArrowRight, Home
} from 'lucide-react';

const SIMRegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationType, setRegistrationType] = useState('new');
  const [simType, setSimType] = useState('with-number');
  const [formData, setFormData] = useState({
    simNumber: '',
    personalNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    documentType: 'passport',
    documentNumber: ''
  });

  const steps = [
    { id: 1, title: 'Registration', icon: Smartphone, completed: currentStep > 1 },
    { id: 2, title: 'Customer Information(0/2)', icon: User, completed: currentStep > 2 },
    { id: 3, title: 'Additional Information', icon: FileText, completed: currentStep > 3 },
    { id: 4, title: 'Terms & Conditions', icon: Shield, completed: currentStep > 4 }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              <Home size={16} />
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-500">SIM Registration</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SIM Registration</h1>
          <p className="text-lg text-gray-600">Register your new or existing SIM & get started</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-blue-600 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                    step.completed || currentStep === step.id
                      ? 'bg-white text-blue-600 border-white'
                      : 'bg-blue-400 text-white border-blue-300'
                  }`}>
                    {step.completed ? (
                      <CheckCircle size={20} />
                    ) : (
                      <step.icon size={20} />
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    step.completed || currentStep === step.id ? 'text-white' : 'text-blue-200'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-white' : 'bg-blue-400'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            {/* Step 1: Registration Type */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Register your new SIM</h2>
                </div>

                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>If you have just received your SIM, you can start your registration here.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>If you had already attempted registration but have not completed, you can still continue and complete your registration here.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Keep your ID documents handy.</span>
                      </li>
                    </ul>
                  </div>

                  {/* SIM Number Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SIM Number
                      <span className="ml-1 text-gray-400">
                        <AlertCircle size={14} className="inline" />
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter Last 12 Digit length"
                        value={formData.simNumber}
                        onChange={(e) => handleInputChange('simNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={12}
                      />
                      <QrCode className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>

                  {/* Registration Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Select Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSimType('with-number')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          simType === 'with-number'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            simType === 'with-number' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                          }`}>
                            {simType === 'with-number' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                          </div>
                          <span className="font-medium text-gray-900">With Personal Number</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setSimType('without-number')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          simType === 'without-number'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            simType === 'without-number' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                          }`}>
                            {simType === 'without-number' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                          </div>
                          <span className="font-medium text-gray-900">Without Personal Number</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  disabled={!formData.simNumber}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Customer Information */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">New Customer</h2>
                  <p className="text-gray-600">Please provide your personal information</p>
                </div>

                <div className="space-y-6">
                  {/* Personal Number */}
                  {simType === 'with-number' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personal Number (Norwegian ID)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your 11-digit personal number"
                        value={formData.personalNumber}
                        onChange={(e) => handleInputChange('personalNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={11}
                      />
                    </div>
                  )}

                  {/* Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="flex">
                      <div className="bg-gray-50 border border-r-0 border-gray-300 rounded-l-xl px-3 py-3 text-gray-600 text-sm">
                        +47
                      </div>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-4 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!formData.firstName || !formData.lastName || !formData.email}
                    className="flex-1 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h2>
                  <p className="text-gray-600">Please provide your address and identification</p>
                </div>

                <div className="space-y-6">
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        placeholder="Enter postal code"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  {/* ID Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Document Type</label>
                    <select
                      value={formData.documentType}
                      onChange={(e) => handleInputChange('documentType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="passport">Passport</option>
                      <option value="national-id">National ID Card</option>
                      <option value="drivers-license">Driver's License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Number</label>
                    <input
                      type="text"
                      placeholder="Enter document number"
                      value={formData.documentNumber}
                      onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Upload Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                      <div>
                        <h4 className="font-medium text-yellow-800">Document Upload Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          You will need to upload a clear photo of your ID document in the next step.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-4 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!formData.address || !formData.city || !formData.postalCode || !formData.documentNumber}
                    className="flex-1 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Terms & Conditions */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Terms & Conditions</h2>
                  <p className="text-gray-600">Please review and accept our terms</p>
                </div>

                <div className="space-y-6">
                  {/* Terms Content */}
                  <div className="bg-gray-50 rounded-xl p-6 max-h-64 overflow-y-auto">
                    <h4 className="font-semibold text-gray-900 mb-4">Lycamobile Terms of Service</h4>
                    <div className="space-y-4 text-sm text-gray-700">
                      <p>
                        By registering your SIM card with Lycamobile Norway, you agree to the following terms and conditions:
                      </p>
                      <p>
                        1. <strong>Service Usage:</strong> You agree to use our services responsibly and in accordance with Norwegian telecommunications regulations.
                      </p>
                      <p>
                        2. <strong>Identity Verification:</strong> You confirm that all provided information is accurate and that you are authorized to use the provided identification documents.
                      </p>
                      <p>
                        3. <strong>Data Protection:</strong> We will process your personal data in accordance with GDPR and our Privacy Policy.
                      </p>
                      <p>
                        4. <strong>Service Availability:</strong> While we strive for 100% uptime, service availability may vary based on location and network conditions.
                      </p>
                      <p>
                        5. <strong>Fair Usage:</strong> Our unlimited plans are subject to fair usage policies to ensure network quality for all users.
                      </p>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                      <span className="text-sm text-gray-700">
                        I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link> of Lycamobile
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                      <span className="text-sm text-gray-700">
                        I have read and agree to the <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                      <span className="text-sm text-gray-700">
                        I consent to receive marketing communications from Lycamobile (optional)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-4 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    onClick={() => {
                      alert('Registration submitted successfully! You will receive a confirmation email shortly.');
                      // Here you would normally submit to backend
                    }}
                    className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    Complete Registration
                    <CheckCircle size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIMRegistrationPage;