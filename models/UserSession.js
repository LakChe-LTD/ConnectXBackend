// models/UserSession.js
const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  device: { type: String, default: '' },       // e.g. "MacBook Pro - Chrome"
  userAgent: { type: String, default: '' },
  ip: { type: String, default: '' },
  os: { type: String, default: '' },
  browser: { type: String, default: '' },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('UserSession', userSessionSchema);
