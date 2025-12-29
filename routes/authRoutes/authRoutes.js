import express from 'express';
import {
  //auth
  Login,
  PostLogin,
  Signup,
  PostSignup,
  //otp
  VerifyOtpPage,
  PostVerifyOtp,
  //forgot
  ForgotPassword,
  PostForgotPassword,
  ResetPasswordPage,
  PostResetPassword,
  //home
  HomePage,
  collectionPage,
  //profile
  ProfileRedirect,
  getEditProfile,
  updateProfile,
  //email
  startEmailReset,
  emailResetPage,
  postEmailReset,
  //address
  addAddressPage,
  addAddress,
  editAddressPage,
  updateAddress,
  addressPage,
  deleteAddress
} from '../../controllers/auth.controller.js';
import {uploadProfilePhoto} from '../../config/multer.js';
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

// ================ profile ================ //

router.route('/profile')
  .get(ProfileRedirect);

router.route('/edit')
  .get(getEditProfile);

router.route('/photo')
  .post(uploadProfilePhoto.single('profileImage'));

router.route('/update')
  .post(uploadProfilePhoto.single('profileImage'),updateProfile );

//==============email===============//

router.route('/reset-email')
  .get(startEmailReset);

router.route('/email-reset')
  .get(emailResetPage)
  .post(postEmailReset);

//==============   address   ===============//

router.route('/address')
  .get(addressPage);

router.route('/address/add')
  .get(addAddressPage)
  .post(addAddress);

router.route('/address/edit/:id')
  .get(editAddressPage)
  .post(updateAddress);

  router.route('/address/delete/:id')
  .post(deleteAddress)

export default router;
