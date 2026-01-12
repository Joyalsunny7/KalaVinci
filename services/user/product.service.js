import Product from '../../models/user/product.model.js';
import { validateObjectId, sanitizeInput } from '../../utils/validators.js';

export async function getProductsByUser(userId) {
  if (!userId) throw new Error('Missing user id');
  const products = await Product.find({ createdBy: userId, status: { $ne: 'DELETED' } }).lean();
  return products || [];
}

export async function createProduct(userId, payload = {}, files = []) {
  if (!userId) throw new Error('Unauthorized');
  const { name, description, price, size, category } = payload;
  if (!name || typeof name !== 'string') throw new Error('Name is required');
  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) throw new Error('Invalid price');

  const images = (files || []).map(f => `/uploads/products/${f.filename}`);

  const product = await Product.create({
    name: sanitizeInput(name.trim()),
    description: (description || '').trim(),
    price: parsedPrice,
    size: size || 'Medium',
    images,
    category: category || null,
    createdBy: userId,
  });

  return product;
}

export async function updateProduct(userId, id, payload = {}, files = []) {
  if (!userId) throw new Error('Unauthorized');
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error('Invalid product id');

  const product = await Product.findOne({ _id: id, createdBy: userId });
  if (!product) throw new Error('Product not found');

  const { name, description, price, size, category } = payload;

  if (typeof name === 'string' && name.trim()) product.name = sanitizeInput(name.trim());
  if (typeof description === 'string') product.description = sanitizeInput(description.trim());
  if (typeof price !== 'undefined') {
    const parsed = Number(price);
    if (Number.isNaN(parsed) || parsed < 0) throw new Error('Invalid price');
    product.price = parsed;
  }
  if (typeof size === 'string') product.size = sanitizeInput(size);
  if (typeof category !== 'undefined') product.category = category || null;

  const imgs = (files || []).map(f => `/uploads/products/${f.filename}`);
  if (imgs.length) product.images = (product.images || []).concat(imgs);

  await product.save();
  return product;
}

export async function deleteProduct(userId, id) {
  if (!userId) throw new Error('Unauthorized');
  const { valid } = validateObjectId(id);
  if (!valid) throw new Error('Invalid product id');

  const product = await Product.findOne({ _id: id, createdBy: userId });
  if (!product) throw new Error('Product not found');

  product.status = 'DELETED';
  await product.save();
  return product;
}
