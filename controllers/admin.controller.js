import { adminLoginService,
         getAllCustomersService,
         toggleBlockUserService
 } from "../services/admin.service.js";
import { validateEmail, validateObjectId } from "../utils/validators.js";
import { sanitizeInput } from "../utils/validators.js";



// ================= Admin login page ================= //

export const AdminLoginPage = (req, res) => {
  if (req.session.adminId) {
    return res.render("admin/dashboard",{activePage : "dashboard"});
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

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);

    res.render("admin/login", {
      error: err.message,
    });
  }
};


// ================= admin dashboard ================= //

export const AdminDashboard = (req, res) => {
  res.render("admin/dashboard");
};

// ================= admin customer page ================= //
export const AdminCustomersPage = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const search = sanitizeInput(req.query.search || "");
    const sort = req.query.sort === "asc" ? "asc" : "desc";

    const { customers, totalUsers } =
      await getAllCustomersService({
        page,
        limit,
        search,
        sort,
      });

    res.render("admin/customers", {
      customers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      search,
      sort,
    });
  } catch (err) {
    console.error("CUSTOMERS PAGE ERROR:", err.message);

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

    const { userId } = req.params;

    const idValidation = validateObjectId(userId);
    if (!idValidation.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    const user = await toggleBlockUserService(userId);

    return res.status(200).json({
      success: true,
      isBlocked: user.isBlocked
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= ADMIN LOGOUT ================= //

export const AdminLogout = (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        console.error('Admin logout error:', err);
        return res.redirect('admin/dashboard');
      }

      res.clearCookie('connect.sid');

      return res.redirect('/admin');
    });
  } catch (error) {
    console.error('Admin logout failed:', error);
    return res.redirect('admin/dashboard');
  }
};






