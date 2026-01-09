import User from '../models/user/user.model.js';

export const adminAuth = (req, res, next) => {
  if (!req.session.adminId) {

    const isApiRequest =
      req.xhr ||
      req.headers.accept?.includes("application/json") ||
      req.originalUrl.startsWith("/admin/users");

    if (isApiRequest) {
      return res.status(401).json({
        success: false,
        message: "Admin session expired"
      });
    }

    return res.redirect("/admin");
  }

  next();
};

export const checkBlocked = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return next();
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => res.redirect('/login'));
      return;
    }

    if (user.isBlocked) {
      req.session.destroy(() => {
        res.redirect('/login?error=blocked');
      });
      return;
    }

    next();
  } catch (error) {
    console.error('checkBlocked error:', error);
    req.session.destroy(() => res.redirect('/login'));
  }
};

export const Toasted = (req, res, next) => {
  res.locals.toast = req.session.toast;
  delete req.session.toast;
  next();
};

export const requireUserAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

export const guestOnly = (req, res, next) => {
  if (req.session?.userId) {
    return res.redirect('/home');
  }
  next();
};
