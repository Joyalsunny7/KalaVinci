import Category from "../../models/admin/categorySchema.js";
import { sanitizeInput, validateObjectId } from "../../utils/validators.js";

export const getAllCategoriesService = async () => {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  return categories;
};

export const addCategoryService = async ({ name, isListed = true, createdBy = null }) => {
  if (!name || !name.trim()) {
    throw new Error("Category name is required");
  }

  const cleanName = sanitizeInput(name);

  // Prevent duplicates (case-insensitive)
  const existing = await Category.findOne({ name: { $regex: `^${cleanName}$`, $options: "i" } });
  if (existing) {
    throw new Error("Category already exists");
  }

  const category = new Category({ name: cleanName, isListed: !!isListed, createdBy });
  await category.save();
  return category;
};

export const deleteCategoryService = async (id) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid category ID");

  const cat = await Category.findById(id);
  if (!cat) throw new Error("Category not found");

  await Category.findByIdAndDelete(id);
  return { id };
};

export const getCategoryByIdService = async (id) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid category ID");

  const cat = await Category.findById(id).lean();
  if (!cat) throw new Error("Category not found");

  return cat;
};

export const updateCategoryService = async (id, { name, isListed }) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid category ID");

  const updates = {};
  if (typeof name === "string") updates.name = sanitizeInput(name);
  if (typeof isListed !== "undefined") updates.isListed = !!isListed;

  const cat = await Category.findByIdAndUpdate(id, updates, { new: true });
  if (!cat) throw new Error("Category not found");

  return cat;
};

export const toggleCategoryListingService = async (id) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid category ID");

  const cat = await Category.findById(id);
  if (!cat) throw new Error("Category not found");

  cat.isListed = !cat.isListed;
  await cat.save();

  return { id: cat._id, isListed: cat.isListed };
};
