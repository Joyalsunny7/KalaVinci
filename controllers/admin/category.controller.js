import {
  getAllCategoriesService,
  addCategoryService,
  deleteCategoryService,
  getCategoryByIdService,
  updateCategoryService,
  toggleCategoryListingService,
} from "../../services/admin/category.service.js";
import { sanitizeInput } from "../../utils/validators.js";

// ================= Admin Category Page ================= //
export const AdminCategoryPage = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();
    const toast = req.session.toast;
    delete req.session.toast;

    res.render("admin/category", {
      activePage: "category",
      categories,
      toast,
    });
  } catch (err) {
    res.render("admin/category", {
      activePage: "category",
      categories: [],
      toast: { type: "error", message: "Failed to load categories" },
    });
  }
};

// ================= Add Category ================= //
export const addCategory = async (req, res) => {
  try {
    const name = sanitizeInput(req.body.categoryName || "");
    const isListed = !!req.body.isListed;
    const adminId = req.session.adminId || null;

    await addCategoryService({ name, isListed, createdBy: adminId });

    req.session.toast = { type: "success", message: "Category added" };
    res.redirect("/admin/categories");
  } catch (err) {
    req.session.toast = { type: "error", message: err.message };
    res.redirect("/admin/categories");
  }
};

// ================= Delete Category ================= //
export const deleteCategory = async (req, res) => {
  try {
    await deleteCategoryService(req.params.id);
    req.session.toast = { type: "success", message: "Category deleted" };
    res.redirect("/admin/categories");
  } catch (err) {
    req.session.toast = { type: "error", message: err.message };
    res.redirect("/admin/categories");
  }
};

// ================= Toggle List/Unlist ================= //
export const toggleCategoryListing = async (req, res) => {
  try {
    const result = await toggleCategoryListingService(req.params.id);
    return res.json({ success: true, isListed: result.isListed });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ================= Edit / Update Category ================= //
export const editCategoryPage = async (req, res) => {
  try {
    const category = await getCategoryByIdService(req.params.id);
    res.render("admin/editCategory", { category, activePage: "category" });
  } catch (err) {
    req.session.toast = { type: "error", message: err.message };
    res.redirect("/admin/categories");
  }
};

export const updateCategory = async (req, res) => {
  try {
    const name = sanitizeInput(req.body.categoryName || "");
    const isListed = !!req.body.isListed;

    await updateCategoryService(req.params.id, { name, isListed });

    req.session.toast = { type: "success", message: "Category updated" };
    res.redirect("/admin/categories");
  } catch (err) {
    req.session.toast = { type: "error", message: err.message };
    res.redirect("/admin/categories");
  }
};

// ================= Get Category JSON ================= //
export const getCategoryJson = async (req, res) => {
  try {
    const category = await getCategoryByIdService(req.params.id);
    return res.json({ success: true, category });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ================= Update Category (JSON) ================= //
export const updateCategoryJson = async (req, res) => {
  try {
    const { categoryName, isListed } = req.body || {};
    const updates = {};
    if (typeof categoryName === 'string') updates.name = sanitizeInput(categoryName);
    if (typeof isListed !== 'undefined') updates.isListed = (isListed === true || isListed === 'true' || isListed === 'on');

    const category = await updateCategoryService(req.params.id, updates);
    return res.json({ success: true, category });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
