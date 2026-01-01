import User from '../models/user.js';


export const adminAuth = (req, res, next) => {
  if (!req.session.adminId) {
    return res.redirect("/admin");
  }
  next();
};


export const checkBlocked = async (req, res, next) => {
  if (!req.session.userId) return next();

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.session.destroy(() => {
        return res.redirect('/login');
      });
      return;
    }

    if (user.isBlocked) {
      req.session.destroy(() => {
        return res.redirect('/login?error=blocked');
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking blocked status:', error);
    req.session.destroy(() => {
      return res.redirect('/login');
    });
  }
};

export const Toasted = (req,res,next) => {
  res.locals.toast = req.session.toast;
  delete req.session.toast;
  next()
}