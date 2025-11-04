// models/Hotspot.js
const mongoose = require("mongoose");

const hotspotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Hotspot must belong to a user
    },
    name: { type: String, required: true },
    ssid: { type: String, required: true, unique: true },

    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      city: String,
      state: String,
      country: String,
    },

    bandwidthLimit: { type: Number, default: 100 }, // Mbps
    maxConnections: { type: Number, default: 50 },

    hardware: {
      model: String,
      macAddress: { type: String, unique: true },
    },

   status: {
  type: String,
  enum: ["online", "offline", "maintenance"],
  default: "offline",
},


    totalBandwidthUsed: { type: Number, default: 0 }, // e.g. GB used
    totalEarnings: { type: Number, default: 0 }, // earnings from hotspot users
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotspot", hotspotSchema);
