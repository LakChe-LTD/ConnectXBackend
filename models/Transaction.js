// models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["earning", "withdrawal", "bonus", "refund"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    hotspotId: mongoose.Schema.Types.ObjectId,
    paymentMethod: String,
    stripeTransactionId: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
