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
