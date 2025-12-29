import { adminLoginService,
         getAllCustomersService
 } from "../services/admin.service.js";



// ================= Admin login page ================= //

export const AdminLoginPage = (req, res) => {
  if (req.session.adminId) {
    return res.redirect("/admin/dashboard");
  }

  res.render("admin/login");
};

// ================= admin verification ================= //

export const AdminLogin = async (req, res) => {


  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email or password missing");
    }

    const admin = await adminLoginService(email, password);

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
    console.log("📥 AdminCustomersPage HIT");

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || "";
    const sort = req.query.sort || "desc";

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

export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.redirect("/admin/customers");

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.redirect("/admin/customers");
  } catch (err) {
    console.error("BLOCK USER ERROR:", err);
    res.redirect("/admin/customers");
  }
};



