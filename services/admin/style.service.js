import Style from "../../models/admin/styleSchema.js";
import { sanitizeInput, validateObjectId } from "../../utils/validators.js";

export const getAllStylesService = async () => {
  const styles = await Style.find().sort({ createdAt: -1 }).lean();
  return styles;
};

export const addStyleService = async ({ name, isListed = true, createdBy = null }) => {
  if (!name || !name.trim()) throw new Error("Style name is required");

  const cleanName = sanitizeInput(name);
  const existing = await Style.findOne({ name: { $regex: `^${cleanName}$`, $options: "i" } });
  if (existing) throw new Error("Style already exists");

  const style = new Style({ name: cleanName, isListed: !!isListed, createdBy });
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

export const updateStyleService = async (id, { name, isListed }) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid style ID");

  const updates = {};
  if (typeof name === "string") updates.name = sanitizeInput(name);
  if (typeof isListed !== "undefined") updates.isListed = !!isListed;

  const style = await Style.findByIdAndUpdate(id, updates, { new: true });
  if (!style) throw new Error("Style not found");

  return style;
};

export const toggleStyleListingService = async (id) => {
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error("Invalid style ID");

  const style = await Style.findById(id);
  if (!style) throw new Error("Style not found");

  style.isListed = !style.isListed;
  await style.save();

  return { id: style._id, isListed: style.isListed };
};
