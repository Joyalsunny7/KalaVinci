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


export default router;
