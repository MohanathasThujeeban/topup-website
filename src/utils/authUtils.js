// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: getPasswordStrength(password)
  };
};

// Password strength calculation
export const getPasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  if (password.length >= 16) score += 1;

  if (score <= 2) return { level: 'weak', color: 'red', percentage: 25 };
  if (score <= 4) return { level: 'medium', color: 'yellow', percentage: 50 };
  if (score <= 5) return { level: 'strong', color: 'green', percentage: 75 };
  return { level: 'very-strong', color: 'green', percentage: 100 };
};

// Name validation
export const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Phone validation (optional)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Form validation for login
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Form validation for signup
export const validateSignupForm = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = 'Full name is required';
  } else if (!isValidName(formData.name)) {
    errors.name = 'Please enter a valid name (letters and spaces only, 2-50 characters)';
  }

  // Email validation
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0]; // Show first error
    }
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Terms acceptance
  if (!formData.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions';
  }

  // Phone validation (if provided)
  if (formData.phone && formData.phone.trim() && !isValidPhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format error messages for display
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

// Debounce function for real-time validation
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};