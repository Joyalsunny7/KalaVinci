// Validation utility functions

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

// Phone validation (10 digits)
export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Please enter a valid 10-digit phone number' };
  }
  
  return { valid: true };
};

// Name validation
export const validateName = (name) => {
  if (!name) {
    return { valid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { valid: false, message: 'Name must be less than 50 characters' };
  }
  
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name.trim())) {
    return { valid: false, message: 'Name can only contain letters and spaces' };
  }
  
  return { valid: true };
};

// OTP validation (6 digits)
export const validateOtp = (otp) => {
  if (!otp) {
    return { valid: false, message: 'OTP is required' };
  }
  
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    return { valid: false, message: 'OTP must be 6 digits' };
  }
  
  return { valid: true };
};

// Pincode validation (6 digits)
export const validatePincode = (pincode) => {
  if (!pincode) {
    return { valid: false, message: 'Pincode is required' };
  }
  
  const pincodeRegex = /^\d{6}$/;
  if (!pincodeRegex.test(pincode)) {
    return { valid: false, message: 'Pincode must be 6 digits' };
  }
  
  return { valid: true };
};

// Address validation
export const validateAddress = (addressData) => {
  const errors = {};
  
  if (!addressData.name || addressData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  const phoneValidation = validatePhone(addressData.phone);
  if (!phoneValidation.valid) {
    errors.phone = phoneValidation.message;
  }
  
  if (!addressData.addressLine || addressData.addressLine.trim().length < 5) {
    errors.addressLine = 'Address must be at least 5 characters long';
  }
  
  if (!addressData.city || addressData.city.trim().length < 2) {
    errors.city = 'City is required';
  }
  
  if (!addressData.state || addressData.state.trim().length < 2) {
    errors.state = 'State is required';
  }
  
  const pincodeValidation = validatePincode(addressData.pincode);
  if (!pincodeValidation.valid) {
    errors.pincode = pincodeValidation.message;
  }
  
  if (!addressData.label || !['Home', 'Office', 'Work'].includes(addressData.label)) {
    errors.label = 'Please select a valid address label';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// MongoDB ObjectId validation
export const validateObjectId = (id) => {
  if (!id) {
    return { valid: false, message: 'ID is required' };
  }
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return { valid: false, message: 'Invalid ID format' };
  }
  
  return { valid: true };
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

