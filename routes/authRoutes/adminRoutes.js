import express from "express";
import {
  AdminLoginPage,
  AdminLogin,
  AdminDashboard,
  AdminCustomersPage,
  toggleBlockUser
} from "../../controllers/admin.controller.js";

import { adminAuth } from "../../middlewares/adminAuth.js";

const router = express.Router();


router.route("/")
  .get(AdminLoginPage)
  .post(AdminLogin);

router.get("/dashboard", adminAuth, AdminDashboard);

router.get("/customers", adminAuth, AdminCustomersPage);

router.post('/users/:userId/block-toggle',adminAuth,toggleBlockUser)

export default router;
