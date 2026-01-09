import { adminLoginService } from "../../services/admin/admin.service.js";
import { validateEmail, sanitizeInput } from "../../utils/validators.js";

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




