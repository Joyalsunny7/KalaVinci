import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateOtp } from './otp.services.js';
import { sendOtpEmail } from './email.service.js';

// ================= LOGIN =================

export const loginService = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  return user;
};

// ================= SIGNUP WITH OTP =================

export const signupWithOtp = async (data, session) => {

  const { name, email, phone, password } = data;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  session.tempUser = {
    full_name: name,
    email,
    phone,
    password,
    otp,
    otpExpiry: Date.now() + 5 * 60 * 1000,
  };

  console.log("📦 TEMP USER SET:", session.tempUser);

  await sendOtpEmail(email, otp);

};


// ================= VERIFY OTP & CREATE USER =================

export const verifyOtpAndSignup = async (otp, session) => {


  const tempUser = session.tempUser;

  if (!tempUser) {
    throw new Error('Session expired');
  }


  if (tempUser.otp !== otp) {
    throw new Error('Invalid OTP');
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
  const otp = generateOtp();

  session.resetPassword = {
    email,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, 
  };

  await sendOtpEmail(email, otp);
};

export const verifyForgototp = async (otp, session) => {
  const data = session.resetPassword;
  if (!data) throw new Error('OTP session expired');

  if (Date.now() > data.expiresAt || otp !== data.otp) {
    throw new Error('Invalid or expired OTP');
  }

  return data.email;
};


// ================= RESET PASSWORD =================

export const resetPasswordService = async (email, password) => {
  if (!email) throw new Error('Session expired');
  if (!password) throw new Error('Password is required');

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.updateOne(
    { email },
    { $set: { password: hashedPassword } }
  );
};
