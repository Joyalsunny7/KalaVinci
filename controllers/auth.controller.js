import {
  signupWithOtp,
  verifyOtpAndSignup,
  sendForgotOtp,
  verifyForgototp,
  resetPasswordService,
  loginService
} from '../services/userauth.service.js';

// ================= AUTH PAGES ================= //

export const Login = (req, res) => {
  res.render('users/login');
};

export const PostLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await loginService(email, password);

    req.session.userId = user._id;

    res.redirect('/home');
  } catch (err) {
    res.render('users/login', { error: err.message });
  }
};

export const Signup = (req, res) => {
  res.render('users/signup');
};

export const PostSignup = async (req, res) => {
  try {
    await signupWithOtp(req.body, req.session);
    res.redirect('/verify-otp');
  } catch (error) {
    res.render('users/signup', { error: error.message });
  }
};

// ================= OTP ================= //

export const VerifyOtpPage = (req, res) => {
  if (!req.session.tempUser && !req.session.resetPassword) {
    return res.redirect('/login');
  }

  const email =
    req.session.tempUser?.email ||
    req.session.resetPassword?.email ||
    null;

  res.render('users/verifyOtp', { email });
};

export const PostVerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (req.session.tempUser) {
      await verifyOtpAndSignup(otp, req.session);
      return res.redirect('/login');
    }

    if (req.session.resetPassword) {
      await verifyForgototp(otp, req.session);
      return res.redirect('/reset-password');
    }

    throw new Error('Invalid OTP flow');
  } catch (error) {
    res.render('users/verifyOtp', { error: error.message });
  }
};

// ================= FORGOT PASSWORD ================= //

export const ForgotPassword = (req, res) => {
  res.render('users/forgotPassword');
};

export const PostForgotPassword = async (req, res) => {
  try {
    await sendForgotOtp(req.body.email, req.session);
    res.redirect('/verify-otp');
  } catch (error) {
    res.render('users/forgotPassword', { error: error.message });
  }
};

export const ResetPasswordPage = (req, res) => {
  if (!req.session.resetPassword) {
    return res.redirect('/forgot-password');
  }

  res.render('users/resetPassword');
};

export const PostResetPassword = async (req, res) => {
  try {
    const email = req.session.resetPassword?.email;
    if (!email) throw new Error('Session expired');

    await resetPasswordService(email, req.body.password);

    req.session.resetPassword = null;
    res.redirect('/login');
  } catch (error) {
    res.render('users/resetPassword', { error: error.message });
  }
};

// ================= PROTECTED PAGES ================= //

export const HomePage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.render('users/homePage');
};

export const collectionPage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.render('users/collections');
};

export const ProfileRedirect = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.render('users/userProfile');
};

export const getEditProfile = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.render('users/editProfile');
};
