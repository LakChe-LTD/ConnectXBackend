// models/UserDevice.js
const mongoose = require('mongoose');

const UserDeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: { type: String, required: true, unique: true }, // e.g., dev_123abc
  name: { type: String, required: true }, // "MacBook Pro"
  platform: { type: String }, // "macOS", "iOS"
  browser: { type: String }, // "Chrome", "Safari"
  ipAddress: { type: String },
  location: { type: String }, // "San Francisco, CA"
  lastActive: { type: Date, default: Date.now },
  isCurrent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'inactive', 'revoked'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Compound index for fast lookup
UserDeviceSchema.index({ userId: 1, lastActive: -1 });

module.exports = mongoose.model('UserDevice', UserDeviceSchema);