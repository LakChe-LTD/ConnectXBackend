
// config/jwt.js
module.exports = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  secret: process.env.JWT_SECRET || 'your-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
};



