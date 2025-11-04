const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    available: {
      type: Number,
      default: 0
    },
    wallet: {
      type: Number,
      default: 0
    },
    pendingRewards: {
    type: Number,
    default: 0,
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", WalletSchema);
