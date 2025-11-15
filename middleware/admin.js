// middleware/admin.js
module.exports = (req, res, next) => {
  if (!req.userRole) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
  }

  next();
};
