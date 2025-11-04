// models/Referral.js
const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Referral', referralSchema);
