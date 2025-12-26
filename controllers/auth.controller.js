import {
  signupWithOtp,
  verifyOtpAndSignup,
  sendForgotOtp,
  verifyForgototp,
  resetPasswordService
} from '../services/userauth.service.js';


export const Login = (req, res) => {
  res.render('users/login');
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

export const VerifyOtpPage = (req, res) => {
  if (!req.session.tempUser && !req.session.resetPassword) {
    return res.redirect('/login');
  }

  let email = null;
  if(req.session.tempUser){
    email = req.session.tempUser.email
  }

  if(req.session.resetPassword){
    email = req.session.resetPassword.email
  }

  res.render('users/verifyOtp',{email});
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
