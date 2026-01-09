import {
  getAllStylesService,
  addStyleService,
  deleteStyleService,
  getStyleByIdService,
  updateStyleService,
  toggleStyleListingService,
} from "../../services/admin/style.service.js";
import { sanitizeInput } from "../../utils/validators.js";

export const AdminStylePage = async (req, res) => {
  try {
    const styles = await getAllStylesService();
    const toast = req.session.toast;
    delete req.session.toast;

    res.render("admin/style", { activePage: "categories", styles, toast });
  } catch (err) {
    res.render("admin/style", { activePage: "categories", styles: [], toast: { type: "error", message: "Failed to load styles" } });
  }
};

export const addStyle = async (req, res) => {
  try {
    const name = sanitizeInput(req.body.styleName || "");
    const isListed = !!req.body.isListed;
    const adminId = req.session.adminId || null;

    await addStyleService({ name, isListed, createdBy: adminId });
    req.session.toast = { type: "success", message: "Style added" };
    res.redirect('/admin/styles');
  } catch (err) {
    req.session.toast = { type: "error", message: err.message };
    res.redirect('/admin/styles');
  }
};

export const deleteStyle = async (req, res) => {
  try {
    await deleteStyleService(req.params.id);
    req.session.toast = { type: "success", message: "Style deleted" };
    res.redirect('/admin/styles');
  } catch (err) {
    req.session.toast = { type: "error", message: err.message };
    res.redirect('/admin/styles');
  }
};

export const toggleStyleListing = async (req, res) => {
  try {
    const result = await toggleStyleListingService(req.params.id);
    return res.json({ success: true, isListed: result.isListed });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getStyleJson = async (req, res) => {
  try {
    const style = await getStyleByIdService(req.params.id);
    return res.json({ success: true, style });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateStyleJson = async (req, res) => {
  try {
    const { styleName, isListed } = req.body || {};
    const updates = {};
    if (typeof styleName === 'string') updates.name = sanitizeInput(styleName);
    if (typeof isListed !== 'undefined') updates.isListed = (isListed === true || isListed === 'true' || isListed === 'on');

    const style = await updateStyleService(req.params.id, updates);
    return res.json({ success: true, style });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const editStylePage = async (req, res) => {
  try {
    const style = await getStyleByIdService(req.params.id);
    res.render('admin/editStyle', { style, activePage: 'categories' });
  } catch (err) {
    req.session.toast = { type: 'error', message: err.message };
    res.redirect('/admin/styles');
  }
};

export const updateStyle = async (req, res) => {
  try {
    const name = sanitizeInput(req.body.styleName || '');
    const isListed = !!req.body.isListed;

    await updateStyleService(req.params.id, { name, isListed });
    req.session.toast = { type: 'success', message: 'Style updated' };
    res.redirect('/admin/styles');
  } catch (err) {
    req.session.toast = { type: 'error', message: err.message };
    res.redirect('/admin/styles');
  }
};