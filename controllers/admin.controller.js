import {
  adminLoginService,
  getAllCustomersService,
  toggleBlockUserService,
} from "../services/admin.service.js";
import { validateEmail, validateObjectId } from "../utils/validators.js";
import { sanitizeInput } from "../utils/validators.js";

// ================= Admin login page ================= //

export const AdminLoginPage = (req, res) => {
  if (req.session.adminId) {
    return res.redirect("admin/dashboard");
  }

  res.render("admin/login");
};

// ================= admin verification ================= //

export const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("admin/login", {
        error: "Email and password are required",
      });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.render("admin/login", {
        error: emailValidation.message,
      });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();
    const admin = await adminLoginService(sanitizedEmail, password);

    req.session.adminId = admin._id;

    req.session.toast = {
      type: "success",
      message: "Admin logged in successfully",
    };

    res.redirect("/admin/dashboard");
  } catch (err) {
    res.render("admin/login", {
      toast: {
        type: "error",
        message: err.message,
      },
    });
  }
};

// ================= admin dashboard ================= //

export const AdminDashboard = (req, res) => {
  const toast = req.session.toast;
  delete req.session.toast;

  res.render("admin/dashboard", {
    activePage: "dashboard",
    toast,
  });
};


// ================= admin customer page ================= //
export const AdminCustomersPage = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const search = sanitizeInput(req.query.search || "");
    const sort = req.query.sort === "asc" ? "asc" : "desc";

    const { customers, totalUsers } = await getAllCustomersService({
      page,
      limit,
      search,
      sort,
    });

    res.render("admin/customers", {
      activePage: "users",
      customers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      search,
      sort,
    });
  } catch (err) {
    res.render("admin/customers", {
      customers: [],
      currentPage: 1,
      totalPages: 1,
      search: "",
      sort: "desc",
      error: "Failed to load customers",
    });
  }
};

// ================= block or unblock user ================= //

export const toggleBlockUser = async (req, res) => {
  try {
    const user = await toggleBlockUserService(req.params.userId);

    return res.json({
      success: true,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ================= ADMIN LOGOUT ================= //

export const AdminLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect("admin/dashboard");
      }

      res.clearCookie("connect.sid");

      return res.redirect("/admin?logout=1");
    });
  } catch (error) {
    return res.redirect("admin/dashboard");
  }
};
