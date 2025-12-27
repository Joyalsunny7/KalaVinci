import express from 'express';
import {
  Login,
  PostLogin,
  Signup,
  PostSignup,
  VerifyOtpPage,
  PostVerifyOtp,
  ForgotPassword,
  PostForgotPassword,
  ResetPasswordPage,
  PostResetPassword,
  HomePage,
  collectionPage,
  ProfileRedirect,
  getEditProfile
} from '../../controllers/auth.controller.js';

const router = express.Router();

/* ================= AUTH ================= */

router.route('/login')
  .get(Login)
  .post(PostLogin);

router.route('/signup')
  .get(Signup)
  .post(PostSignup);

/* ================= OTP ================= */

router.route('/verify-otp')
  .get(VerifyOtpPage)
  .post(PostVerifyOtp);

/* ================= FORGOT PASSWORD ================= */

router.route('/forgot-password')
  .get(ForgotPassword)
  .post(PostForgotPassword);

router.route('/reset-password')
  .get(ResetPasswordPage)
  .post(PostResetPassword);

/* ================= PROTECTED PAGES ================= */

router.route('/home')
  .get(HomePage);

router.route('/collections')
  .get(collectionPage);

router.route('/profile')
  .get(ProfileRedirect);

router.route('/profile/edit')
  .get(getEditProfile);

export default router;
