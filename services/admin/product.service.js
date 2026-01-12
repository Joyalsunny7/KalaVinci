import Product from '../../models/user/product.model.js';

export async function getAllProducts() {
  return Product.find({}).lean();
}

export async function getProductById(id) {
  return Product.findById(id).lean();
}

export async function updateProductAdmin(id, payload = {}) {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  Object.keys(payload).forEach(k => { product[k] = payload[k]; });
  await product.save();
  return product;
}

export async function deleteProductAdmin(id) {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  product.status = 'DELETED';
  await product.save();
  return product;
}
