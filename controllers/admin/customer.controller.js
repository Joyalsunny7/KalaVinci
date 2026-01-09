import {
  getAllCustomersService,
  toggleBlockUserService,
} from "../../services/admin/admin.service.js";
import { sanitizeInput } from "../../utils/validators.js";

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
