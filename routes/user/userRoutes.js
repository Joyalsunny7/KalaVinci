import express from 'express';
import {
  //auth
  Login,
  PostLogin,
  Logout,
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
  //address
  addAddressPage,
  addAddress,
  editAddressPage,
  updateAddress,
  addressPage,
  deleteAddress,
  resendOtp
} from '../../controllers/user/user.controller.js';

import {
  ProfileRedirect,
  getEditProfile,
  updateProfile,
  startEmailReset,
  emailResetPage,
  postEmailReset,
} from '../../controllers/user/profileController.js';

import { getListedCategories, MyProductsPage, addProduct, updateProduct, deleteProduct } from '../../controllers/user/product.controller.js';
import {uploadProfilePhoto} from '../../config/multer.js';
import { requireUserAuth, guestOnly } from '../../middlewares/auth.js';
const router = express.Router();

/* ================= AUTH ================= */

router.route('/login')
  .get(guestOnly, Login)
  .post(PostLogin);

router.route('/signup')
  .get(Signup)
  .post(PostSignup);

router.route('/logout')
  .get(Logout) 

/* ================= OTP ================= */

router.route('/verify-otp')
  .get(VerifyOtpPage)
  .post(PostVerifyOtp);

router.route('/resend-otp')
  .post(resendOtp);

/* ================= FORGOT PASSWORD ================= */

router.route('/forgot-password')
  .get(ForgotPassword)
  .post(PostForgotPassword);

router.route('/reset-password')
  .get(ResetPasswordPage)
  .post(PostResetPassword);

/* ================= PROTECTED PAGES ================= */

router.route('/home')
  .get(requireUserAuth, HomePage);

router.route('/collections')
  .get(requireUserAuth, collectionPage);

// Public API: listed categories for product forms
router.get('/api/categories', getListedCategories);

// ================ profile ================ //

router.route('/profile')
  .get(requireUserAuth, ProfileRedirect);

// My Products (seller-facing product management)
router.get('/profile/products', requireUserAuth, MyProductsPage);

// Add product (multipart images)
import { uploadProductImages } from '../../config/multer.js';
import { handleMulterUpload } from '../../middlewares/multerErrorHandler.js';

router.post('/profile/products/add', requireUserAuth, handleMulterUpload(uploadProductImages.array('images')), addProduct);
router.post('/profile/products/:id/edit', requireUserAuth, handleMulterUpload(uploadProductImages.array('images')), updateProduct);
// Soft-delete product
router.post('/profile/products/:id/delete', requireUserAuth, deleteProduct);

router.route('/edit')
  .get(getEditProfile);

// Photo upload route removed - handled in update route

router.route('/update')
  .post(
    handleMulterUpload(uploadProfilePhoto.single('profileImage')),
    updateProfile
  );

//==============email===============//

router.route('/reset-email')
  .get(startEmailReset);

router.route('/email-reset')
  .get(emailResetPage)
  .post(postEmailReset);

//==============   address   ===============//

router.route('/address')
  .get(requireUserAuth, addressPage);

router.route('/address/add')
  .get(addAddressPage)
  .post(addAddress);

router.route('/address/edit/:id')
  .get(editAddressPage)
  .post(updateAddress);

  router.route('/address/delete/:id')
  .post(deleteAddress)

export default router;
