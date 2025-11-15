// middleware/auth.js
const jwt = require('jsonwebtoken');
const UserSession = require('../models/UserSession');

// middleware/auth.js
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware hit');
    console.log('Headers:', req.headers.authorization);
    
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Token received:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
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
        console.warn('Session update failed', e.message);
      }
    }

    console.log('✅ Auth passed, calling next()');
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
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
