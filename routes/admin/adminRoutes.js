import express from "express";
import {
  AdminLoginPage,
  AdminLogin,
  AdminLogout,
  AdminDashboard,
} from "../../controllers/admin/admin.controller.js";

import {
  AdminCustomersPage,
  toggleBlockUser
} from "../../controllers/admin/customer.controller.js";

import {
  AdminCategoryPage,
  addCategory,
  deleteCategory,
  toggleCategoryListing,
  editCategoryPage,
  updateCategory,
  getCategoryJson,
  updateCategoryJson,
} from "../../controllers/admin/category.controller.js";

import {
  AdminStylePage,
  addStyle,
  deleteStyle,
  toggleStyleListing,
  editStylePage,
  updateStyle,
  getStyleJson,
  updateStyleJson,
} from "../../controllers/admin/style.controller.js";

import { adminAuth } from "../../middlewares/auth.js";

const router = express.Router();


router.route("/")
  .get(AdminLoginPage)
  .post(AdminLogin);

router.get('/logout', AdminLogout);


router.get("/dashboard", adminAuth, AdminDashboard);

router.get("/customers", adminAuth, AdminCustomersPage);

router.patch(
  "/users/:userId/toggle-block",
  adminAuth,
  toggleBlockUser
);

// Category management
router.get("/categories", adminAuth, AdminCategoryPage);
router.post("/add-category", adminAuth, addCategory);
router.get("/delete-category/:id", adminAuth, deleteCategory);
router.patch("/toggle-category/:id", adminAuth, toggleCategoryListing);
router.get("/edit-category/:id", adminAuth, editCategoryPage);
router.post("/edit-category/:id", adminAuth, updateCategory);

// Fetch category JSON for inline editing
router.get('/category/:id', adminAuth, getCategoryJson);
// Patch category via JSON for inline edits
router.patch('/category/:id', adminAuth, updateCategoryJson);

// Style management (mirror categories)
router.get('/styles', adminAuth, AdminStylePage);
router.post('/add-style', adminAuth, addStyle);
router.get('/delete-style/:id', adminAuth, deleteStyle);
router.patch('/toggle-style/:id', adminAuth, toggleStyleListing);
router.get('/edit-style/:id', adminAuth, editStylePage);
router.post('/edit-style/:id', adminAuth, updateStyle);

// Fetch style JSON and patch via JSON for inline edits
router.get('/style/:id', adminAuth, getStyleJson);
router.patch('/style/:id', adminAuth, updateStyleJson);

export default router;
