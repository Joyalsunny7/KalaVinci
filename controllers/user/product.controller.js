import { getAllCategoriesService } from '../../services/admin/category.service.js';
import { validateObjectId, sanitizeInput } from '../../utils/validators.js';
import { createProduct, updateProduct as updateProductService, deleteProduct as deleteProductService, getProductsByUser } from '../../services/user/product.service.js';

export const getListedCategories = async (req, res) => {
  try {
    // reuse admin service but filter only listed categories
    const categories = await getAllCategoriesService();
    const listed = (categories || []).filter(c => c.isListed);
    return res.json({ success: true, categories: listed });
  } catch (err) {
    console.error('getListedCategories error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
};

export const MyProductsPage = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const products = await getProductsByUser(req.session.userId);

    const stats = {
      total: products.length,
      active: products.filter(p => p.status === 'ACTIVE').length,
      low: products.filter(p => typeof p.stock === 'number' && p.stock < 10).length,
    };

    res.render('users/addProduct', { products, stats, activePage: 'myproducts' });
  } catch (err) {
    console.error('MyProductsPage error:', err);
    res.render('users/addProduct', { products: [], stats: { total: 0, active: 0, low: 0 }, error: err.message, activePage: 'myproducts' });
  }
};

export const addProduct = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const files = req.files || [];
    const payload = req.body || {};

    const product = await createProduct(req.session.userId, payload, files);

    req.session.toast = { type: 'success', message: 'Product added' };
    return res.redirect('/profile/products');
  } catch (err) {
    console.error('addProduct error:', err);
    req.session.toast = { type: 'error', message: err.message || 'Failed to add product' };
    return res.redirect('/profile/products');
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (!req.session.userId) {
      if (req.xhr || req.headers.accept?.includes('application/json')) return res.status(401).json({ success: false, message: 'Unauthorized' });
      return res.redirect('/login');
    }

    const { id } = req.params;
    const payload = req.body || {};
    const files = req.files || [];

    console.debug('updateProduct payload:', payload);
    console.debug('updateProduct files count:', files.length);

    const product = await updateProductService(req.session.userId, id, payload, files);

    const plain = product.toObject ? product.toObject() : product;
    if (req.xhr || req.headers.accept?.includes('application/json')) return res.json({ success: true, product: plain });

    req.session.toast = { type: 'success', message: 'Product updated' };
    return res.redirect('/profile/products');
  } catch (err) {
    console.error('updateProduct error:', err);
    if (req.xhr || req.headers.accept?.includes('application/json')) return res.status(500).json({ success: false, message: err.message });
    req.session.toast = { type: 'error', message: err.message || 'Failed to update product' };
    return res.redirect('/profile/products');
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (!req.session.userId) {
      if (req.xhr || req.headers.accept?.includes('application/json')) return res.status(401).json({ success: false, message: 'Unauthorized' });
      return res.redirect('/login');
    }

    const { id } = req.params;

    await deleteProductService(req.session.userId, id);

    if (req.xhr || req.headers.accept?.includes('application/json')) return res.json({ success: true });

    req.session.toast = { type: 'success', message: 'Product deleted' };
    return res.redirect('/profile/products');
  } catch (err) {
    console.error('deleteProduct error:', err);
    if (req.xhr || req.headers.accept?.includes('application/json')) return res.status(500).json({ success: false, message: err.message });
    req.session.toast = { type: 'error', message: err.message || 'Failed to delete product' };
    return res.redirect('/profile/products');
  }
};
