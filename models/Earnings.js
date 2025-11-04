const mongoose = require("mongoose");

const EarningsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  source: { type: String, default: "reward" }, // staking, referral, etc.
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Earnings", EarningsSchema);
