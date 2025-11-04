// middleware/auth.js
const jwt = require('jsonwebtoken');
const UserSession = require('../models/UserSession');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // Update session lastActive if session id provided
    const sessionId = req.get('x-session-id') || req.headers['x-session-id'];
    if (sessionId) {
      try {
        await UserSession.findOneAndUpdate(
          { _id: sessionId, user: req.userId },
          { $set: { lastActive: new Date() } }
        );
      } catch (e) {
        // ignore session update errors (do not block request)
        console.warn('Session update failed', e.message);
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
