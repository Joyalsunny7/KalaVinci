import Product from "../../models/user/product.model.js";
import { validateObjectId, sanitizeInput } from "../../utils/validators.js";

/* =========================
   GET PRODUCTS BY USER
========================= */
export async function getProductsByUser(userId) {
  if (!userId) throw new Error("Missing user id");

  const products = await Product.find({
    createdBy: userId,
    status: { $ne: "DELETED" },
  })
    .populate("category", "name")
    .populate("style", "name")
    .lean();

  return products || [];
}

/* =========================
   GET PRODUCT BY ID
========================= */
export async function getProductById(productId, userId) {
  if (!productId) throw new Error("Missing product id");
  if (!userId) throw new Error("Unauthorized");

  const { valid } = validateObjectId(productId);
  if (!valid) throw new Error("Invalid product id");

  const product = await Product.findOne({
    _id: productId,
    createdBy: userId,
    status: { $ne: "DELETED" },
  })
    .populate("category", "name _id")
    .populate("style", "name _id")
    .lean();

  if (!product) {
    throw new Error("Product not found or unauthorized");
  }

  return product;
}

/* =========================
   CREATE PRODUCT
========================= */
export async function createProduct(userId, payload = {}, files = []) {
  if (!userId) throw new Error("Unauthorized");

  const {
    name,
    description,
    price,
    size,
    category,
    style,
    stock,
  } = payload;

  if (!name || typeof name !== "string") {
    throw new Error("Product name is required");
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    throw new Error("Invalid price");
  }

  if (!style) {
    throw new Error("Style is required");
  }

  // Validate ObjectIds
  if (category) {
    const { valid } = validateObjectId(category);
    if (!valid) throw new Error("Invalid category id");
  }

  const { valid: styleValid } = validateObjectId(style);
  if (!styleValid) throw new Error("Invalid style id");

  const images = (files || []).map(
    (f) => `/uploads/products/${f.filename}`
  );

  const product = await Product.create({
    name: sanitizeInput(name.trim()),
    description: sanitizeInput((description || "").trim()),
    price: parsedPrice,
    size: size || "Medium",
    images,
    category: category || null,
    style,
    stock: Number(stock) || 0,
    createdBy: userId,
  });

  return product;
}

/* =========================
   UPDATE PRODUCT
========================= */
export async function updateProduct(userId, id, payload = {}, files = []) {
  if (!userId) throw new Error("Unauthorized");

  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid product id");

  const product = await Product.findOne({
    _id: id,
    createdBy: userId,
    status: { $ne: "DELETED" },
  });

  if (!product) throw new Error("Product not found");

  const {
    name,
    description,
    price,
    size,
    category,
    style,
    stock,
  } = payload;

  if (typeof name === "string" && name.trim()) {
    product.name = sanitizeInput(name.trim());
  }

  if (typeof description === "string") {
    product.description = sanitizeInput(description.trim());
  }

  if (typeof price !== "undefined") {
    const parsed = Number(price);
    if (Number.isNaN(parsed) || parsed < 0) {
      throw new Error("Invalid price");
    }
    product.price = parsed;
  }

  if (typeof size === "string") {
    product.size = sanitizeInput(size);
  }

  if (typeof stock !== "undefined") {
    product.stock = Number(stock) || 0;
  }

  if (typeof category !== "undefined") {
    if (category) {
      const { valid } = validateObjectId(category);
      if (!valid) throw new Error("Invalid category id");
    }
    product.category = category || null;
  }

  if (typeof style !== "undefined") {
    if (!style) throw new Error("Style cannot be empty");

    const { valid } = validateObjectId(style);
    if (!valid) throw new Error("Invalid style id");

    product.style = style;
  }

  const newImages = (files || []).map(
    (f) => `/uploads/products/${f.filename}`
  );

  if (newImages.length) {
    product.images = [...(product.images || []), ...newImages];
  }

  await product.save();
  return product;
}

/* =========================
   DELETE PRODUCT (SOFT)
========================= */
export async function deleteProduct(userId, id) {
  if (!userId) throw new Error("Unauthorized");

  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid product id");

  const product = await Product.findOne({
    _id: id,
    createdBy: userId,
    status: { $ne: "DELETED" },
  });

  if (!product) throw new Error("Product not found");

  product.status = "DELETED";
  await product.save();

  return product;
}


