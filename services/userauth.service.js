import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateOtp } from './otp.services.js';
import { sendOtpEmail } from './email.service.js';
import { validateEmail, validatePassword, validatePhone, validateName } from '../utils/validators.js';

// ================= LOGIN =================

export const loginService = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(emailValidation.message);
  }

  email = email.toLowerCase().trim();

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.isBlocked) {
    throw new Error('Your account has been blocked');
  }

  if (!user.password) {
    throw new Error('Please use Google login for this account');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return user;
};

// ================= SIGNUP WITH OTP =================

export const signupWithOtp = async (data, session) => {
  const { name, email, phone, password } = data;

  // Validate inputs
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    throw new Error(nameValidation.message);
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(emailValidation.message);
  }

  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    throw new Error(phoneValidation.message);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message);
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  // Check if phone already exists
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    throw new Error('Phone number is already registered');
  }

  const otp = generateOtp();

  session.tempUser = {
    full_name: name,
    email: email.toLowerCase().trim(),
    phone,
    password,
    otp,
    otpExpiry: Date.now() + 5 * 60 * 1000,
  };

  await sendOtpEmail(email.toLowerCase().trim(), otp);
};


// ================= VERIFY OTP & CREATE USER =================

export const verifyOtpAndSignup = async (otp, session) => {
  const tempUser = session.tempUser;

  if (!tempUser) {
    throw new Error('Session expired. Please sign up again.');
  }

  // Check OTP expiry
  if (Date.now() > tempUser.otpExpiry) {
    session.tempUser = null;
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (tempUser.otp !== otp) {
    throw new Error('Invalid OTP');
  }

  // Check if email was registered during OTP wait time
  const existingUser = await User.findOne({ email: tempUser.email });
  if (existingUser) {
    session.tempUser = null;
    throw new Error('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(tempUser.password, 10);
  const user = new User({
    full_name: tempUser.full_name,
    email: tempUser.email,
    phone: tempUser.phone,
    password: hashedPassword,
  });

  await user.save();
  session.tempUser = null;
};



// ================= FORGOT PASSWORD =================


export const sendForgotOtp = async (email, session) => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(emailValidation.message);
  }

  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if user exists (for password reset)
  if (session.resetPassword || (!session.emailReset && !session.tempUser)) {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error('No account found with this email');
    }
    
    if (user.googleId && !user.password) {
      throw new Error('This account uses Google login. Please use Google to sign in.');
    }
  }

  const otp = generateOtp();

  // Determine which session object to use
  if (session.emailReset) {
    // For email reset flow
    session.emailReset.otp = otp;
    session.emailReset.otpExpiry = Date.now() + 5 * 60 * 1000;
  } else {
    // For password reset flow
    session.resetPassword = {
      email: normalizedEmail,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
  }

  await sendOtpEmail(normalizedEmail, otp);
};

export const verifyForgototp = async (otp, session) => {
  let data = session.resetPassword || session.emailReset;
  
  if (!data) {
    throw new Error('OTP session expired. Please request a new OTP.');
  }

  const expiryTime = data.expiresAt || data.otpExpiry;
  if (!expiryTime || Date.now() > expiryTime) {
    if (session.resetPassword) session.resetPassword = null;
    if (session.emailReset) session.emailReset = null;
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (otp !== data.otp) {
    throw new Error('Invalid OTP');
  }

  return data.email || session.emailReset?.email;
};


// ================= RESET PASSWORD =================

export const resetPasswordService = async (email, password) => {
  if (!email) throw new Error('Session expired');
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new Error('User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.updateOne(
    { email: email.toLowerCase().trim() },
    { $set: { password: hashedPassword } }
  );
};
