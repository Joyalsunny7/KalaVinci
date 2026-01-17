import Style from "../../models/admin/styleSchema.js"; // Adjust if your file is named differently
import { sanitizeInput, validateObjectId } from "../../utils/validators.js";

export const getAllStylesService = async (sort = 'newest') => {
  const sortQuery = sort === 'oldest'
    ? { createdAt: 1 }
    : { createdAt: -1 };

  return Style.find().sort(sortQuery);
};

export const addStyleService = async ({ name, status = 'ACTIVE' }) => {
  if (!name || !name.trim()) {
    throw new Error("Style name is required");
  }

  const cleanName = sanitizeInput(name);

  // Prevent duplicates (case-insensitive)
  const existing = await Style.findOne({ name: { $regex: `^${cleanName}$`, $options: "i" } });
  if (existing) {
    throw new Error("Style already exists");
  }

  const style = new Style({ name: cleanName, status });
  await style.save();
  return style;
};

export const deleteStyleService = async (id) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid style ID");

  const style = await Style.findById(id);
  if (!style) throw new Error("Style not found");

  await Style.findByIdAndDelete(id);
  return { id };
};

export const getStyleByIdService = async (id) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid style ID");

  const style = await Style.findById(id).lean();
  if (!style) throw new Error("Style not found");

  return style;
};

export const updateStyleService = async (id, { name, status }) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid style ID");

  const updates = {};
  if (typeof name === "string") updates.name = sanitizeInput(name);
  if (typeof status === "string") updates.status = status;

  const style = await Style.findByIdAndUpdate(id, updates, { new: true });
  if (!style) throw new Error("Style not found");

  return style;
};

export const toggleStyleListingService = async (id) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid style ID");

  const style = await Style.findById(id);
  if (!style) throw new Error("Style not found");

  style.status = style.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  await style.save();

  return { id: style._id, status: style.status };
};