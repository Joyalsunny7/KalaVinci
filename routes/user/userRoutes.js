import express from "express";

/* ================= AUTH CONTROLLERS ================= */
import {
  Login,
  PostLogin,
  Logout,
  Signup,
  PostSignup,

  VerifyOtpPage,
  PostVerifyOtp,
  resendOtp,

  ForgotPassword,
  PostForgotPassword,
  ResetPasswordPage,
  PostResetPassword,

  HomePage,
  collectionPage,

  addAddressPage,
  addAddress,
  editAddressPage,
  updateAddress,
  addressPage,
  deleteAddress,
} from "../../controllers/user/user.controller.js";

/* ================= PROFILE ================= */
import {
  ProfileRedirect,
  getEditProfile,
  updateProfile,
  startEmailReset,
  emailResetPage,
  postEmailReset,
} from "../../controllers/user/profileController.js";

/* ================= PRODUCTS ================= */
import {
  getListedCategories,
  getListedStyles,
  MyProductsPage,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductForEdit,
} from "../../controllers/user/product.controller.js";

/* ================= MIDDLEWARES ================= */
import { requireUserAuth, guestOnly } from "../../middlewares/auth.js";
import { uploadProfilePhoto, uploadProductImages } from "../../config/multer.js";
import { handleMulterUpload } from "../../middlewares/multerErrorHandler.js";

const router = express.Router();

/* =====================================================
   AUTH
===================================================== */
router.route("/login")
  .get(guestOnly, Login)
  .post(PostLogin);

router.route("/signup")
  .get(guestOnly, Signup)
  .post(PostSignup);

router.get("/logout", Logout);

/* =====================================================
   OTP
===================================================== */
router.route("/verify-otp")
  .get(VerifyOtpPage)
  .post(PostVerifyOtp);

router.post("/resend-otp", resendOtp);

/* =====================================================
   FORGOT PASSWORD
===================================================== */
router.route("/forgot-password")
  .get(ForgotPassword)
  .post(PostForgotPassword);

router.route("/reset-password")
  .get(ResetPasswordPage)
  .post(PostResetPassword);

/* =====================================================
   PROTECTED PAGES
===================================================== */
router.get("/home", requireUserAuth, HomePage);
router.get("/collections", requireUserAuth, collectionPage);

/* =====================================================
   PUBLIC APIs (FOR FORMS)
===================================================== */
router.get("/api/categories", getListedCategories);
router.get("/api/styles", getListedStyles);

/* =====================================================
   PROFILE
===================================================== */
router.get("/profile", requireUserAuth, ProfileRedirect);

router.get("/profile/edit", requireUserAuth, getEditProfile);

router.post(
  "/profile/update",
  requireUserAuth,
  handleMulterUpload(uploadProfilePhoto.single("profileImage")),
  updateProfile
);

/* ================= EMAIL RESET ================= */
router.get("/reset-email", requireUserAuth, startEmailReset);
router.route("/email-reset")
  .get(emailResetPage)
  .post(postEmailReset);

/* =====================================================
   MY PRODUCTS (SELLER DASHBOARD)
===================================================== */
router.get("/profile/products", requireUserAuth, MyProductsPage);

// GET product for editing (must be before :id route)
router.get(
  "/api/products/:id/edit",
  requireUserAuth,
  getProductForEdit
);

router.post(
  "/profile/products",
  requireUserAuth,
  handleMulterUpload(uploadProductImages.array("images")),
  addProduct
);

router.post(
  "/profile/products/:id",
  requireUserAuth,
  handleMulterUpload(uploadProductImages.array("images")),
  updateProduct
);

router.delete(
  "/profile/products/:id",
  requireUserAuth,
  deleteProduct
);

/* =====================================================
   ADDRESS
===================================================== */
router.get("/address", requireUserAuth, addressPage);

router.route("/address/add")
  .get(requireUserAuth, addAddressPage)
  .post(requireUserAuth, addAddress);

router.route("/address/edit/:id")
  .get(requireUserAuth, editAddressPage)
  .post(requireUserAuth, updateAddress);

router.post("/address/delete/:id", requireUserAuth, deleteAddress);

export default router;