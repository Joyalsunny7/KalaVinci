import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateOtp } from './otp.services.js';
import { sendOtpEmail } from './email.service.js';

// ================= LOGIN ================= //

export const loginService = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return user;
};

// ================= SIGNUP WITH OTP ================= //

export const signupWithOtp = async (data, session) => {
  const { name, email, password, phone } = data;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('Email already registered');
  }

  const otp = generateOtp();

  session.tempUser = {
    full_name: name,
    email,
    password,
    phone,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, 
  };

  await sendOtpEmail(email, otp);
};

// ================= VERIFY OTP & CREATE USER ================= //

export const verifyOtpAndSignup = async (otp, session) => {
  const tempUser = session.tempUser;
  if (!tempUser) {
    throw new Error('Session expired');
  }

  const isOtpValid =
    otp == tempUser.otp && tempUser.expiresAt > Date.now();

  if (!isOtpValid) {
    throw new Error('Invalid or expired OTP');
  }

  const hashedPassword = await bcrypt.hash(tempUser.password, 10);

  const user = await User.create({
    full_name: tempUser.full_name,
    email: tempUser.email,
    password: hashedPassword,
    phone: tempUser.phone,
  });

  session.tempUser = null;
  return user;
};

// ================= FORGOT PASSWORD ================= //

export const sendForgotOtp = async (email, session) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Email is not registered');
  }

  const otp = generateOtp();

  session.resetPassword = {
    email,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  await sendOtpEmail(email, otp);
};

export const verifyForgototp = async (otp, session) => {
  const resetData = session.resetPassword;
  if (!resetData) {
    throw new Error('OTP session expired');
  }

  const isExpired = Date.now() > resetData.expiresAt;
  const isInvalid = otp != resetData.otp;

  if (isExpired || isInvalid) {
    throw new Error('Invalid or expired OTP');
  }

  return resetData.email;
};

// ================= RESET PASSWORD ================= //

export const resetPasswordService = async (email, password) => {
  if (!email) {
    throw new Error('Session expired');
  }

  if (!password) {
    throw new Error('Password is required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.updateOne(
    { email },
    { $set: { password: hashedPassword } }
  );
};
