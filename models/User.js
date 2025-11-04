// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true, minlength: 8, select: false },

  phone: String,
  location: String,
  bio: String,
  profileImage: String,

  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  totalEarnings: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },

  bankAccount: {
    accountHolder: String,
    accountNumber: String,
    routingNumber: String,
    bankName: String
  },

  twoFactorEnabled: { type: Boolean, default: false },

  // ✅ ADDED NOW
  twoFactorSecret: { 
    type: String, 
    select: false  // IMPORTANT: never expose to frontend
  },

  emailVerified: { type: Boolean, default: false },
  lastLogin: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
