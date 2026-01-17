import { getAllCategoriesService } from "../../services/admin/category.service.js";
import { getAllStylesService } from "../../services/admin/style.service.js";
import {
  createProduct,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  getProductsByUser,
  getProductById,
} from "../../services/user/product.service.js";

/* =========================
   HELPERS
========================= */
const isJson = (req) =>
  req.xhr || req.headers.accept?.includes("application/json");

const requireAuth = (req, res) => {
  if (!req.session.userId) {
    if (isJson(req)) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return false;
    }
    res.redirect("/login");
    return false;
  }
  return true;
};

/* =========================
   CATEGORIES
========================= */
export const getListedCategories = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();
    const listed = (categories || []).filter((c) => c.isListed === true); // ✅ Use isListed
    res.json({ success: true, categories: listed });
  } catch (err) {
    console.error("getListedCategories:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load categories" });
  }
};

/* =========================
   STYLES
========================= */

export const getListedStyles = async (req, res) => {
  try {
    const styles = await getAllStylesService();

    const listed = (styles || []).filter((s) => s.status === "ACTIVE");

    res.json({
      success: true,
      styles: listed.map((s) => ({
        _id: s._id,
        name: s.name,
      })),
    });
  } catch (err) {
    console.error("getListedStyles:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load styles",
    });
  }
};

/* =========================
   MY PRODUCTS PAGE
========================= */
export const MyProductsPage = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const products = await getProductsByUser(req.session.userId);
    const categories = await getAllCategoriesService();
    const styles = await getAllStylesService();
    
    // ✅ Different filters for each
    const listedCategories = (categories || []).filter((c) => c.isListed === true);
    const listedStyles = (styles || []).filter((s) => s.status === "ACTIVE");
    
    const stats = {
      total: products.length,
      active: products.filter((p) => p.status === "ACTIVE").length,
      low: products.filter((p) => p.stock < 10).length,
    };

    res.render("users/addProduct", {
      products,
      stats,
      categories: listedCategories,
      styles: listedStyles,
      activePage: "myproducts",
    });
  } catch (err) {
    console.error("MyProductsPage:", err);
    res.render("users/addProduct", {
      products: [],
      stats: { total: 0, active: 0, low: 0 },
      categories: [],
      styles: [],
      activePage: "myproducts",
    });
  }
};

/* =========================
   GET PRODUCT FOR EDIT
========================= */
export const getProductForEdit = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const product = await getProductById(req.params.id, req.session.userId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const categories = await getAllCategoriesService();
    const styles = await getAllStylesService();

    // ✅ Different filters
    const listedCategories = (categories || []).filter((c) => c.isListed === true);
    const listedStyles = (styles || []).filter((s) => s.status === "ACTIVE");

    const productData = product.toObject ? product.toObject() : product;

    res.json({
      success: true,
      product: {
        ...productData,
        _id: productData._id.toString(),
        category:
          productData.category?._id?.toString() ||
          productData.category?.toString(),
        style:
          productData.style?._id?.toString() || productData.style?.toString(),
      },
      categories: listedCategories.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
      })),
      styles: listedStyles.map((s) => ({
        _id: s._id.toString(),
        name: s.name,
      })),
    });
  } catch (err) {
    console.error("getProductForEdit:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to load product",
    });
  }
};

/* =========================
   ADD PRODUCT
========================= */
export const addProduct = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    await createProduct(req.session.userId, req.body, req.files || []);

    req.session.toast = { type: "success", message: "Product added" };
    res.redirect("/profile/products");
  } catch (err) {
    console.error("addProduct:", err);
    req.session.toast = {
      type: "error",
      message: err.message || "Failed to add product",
    };
    res.redirect("/profile/products");
  }
};

/* =========================
   UPDATE PRODUCT
========================= */
export const updateProduct = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const product = await updateProductService(
      req.session.userId,
      req.params.id,
      req.body,
      req.files || []
    );

    const plain = product.toObject ? product.toObject() : product;

    if (isJson(req)) {
      return res.json({ success: true, product: plain });
    }

    req.session.toast = { type: "success", message: "Product updated" };
    res.redirect("/profile/products");
  } catch (err) {
    console.error("updateProduct:", err);

    if (isJson(req)) {
      return res.status(500).json({ success: false, message: err.message });
    }

    req.session.toast = {
      type: "error",
      message: err.message || "Failed to update product",
    };
    res.redirect("/profile/products");
  }
};

/* =========================
   DELETE PRODUCT
========================= */
export const deleteProduct = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    await deleteProductService(req.session.userId, req.params.id);

    if (isJson(req)) {
      return res.json({ success: true });
    }

    req.session.toast = { type: "success", message: "Product deleted" };
    res.redirect("/profile/products");
  } catch (err) {
    console.error("deleteProduct:", err);

    if (isJson(req)) {
      return res.status(500).json({ success: false, message: err.message });
    }

    req.session.toast = {
      type: "error",
      message: err.message || "Failed to delete product",
    };
    res.redirect("/profile/products");
  }
};
