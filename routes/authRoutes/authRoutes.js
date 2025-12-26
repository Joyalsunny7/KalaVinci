import express from 'express';
import {
  Login,
  Signup,
  PostSignup,
  VerifyOtpPage,
  PostVerifyOtp,
  ForgotPassword,
  PostForgotPassword,
  ResetPasswordPage,
  PostResetPassword
} from '../../controllers/auth.controller.js';

const router = express.Router();

/* LOGIN */
router.get('/login', Login);

/* SIGNUP */
router.route('/signup')
  .get(Signup)
  .post(PostSignup);

/* SHARED OTP (Signup + Forgot) */
router.route('/verify-otp')
  .get(VerifyOtpPage)
  .post(PostVerifyOtp);

/* FORGOT PASSWORD */
router.route('/forgot-password')
  .get(ForgotPassword)
  .post(PostForgotPassword);

/* RESET PASSWORD */
router.route('/reset-password')
  .get(ResetPasswordPage)
  .post(PostResetPassword);

export default router;
