// models/Analytics.js
const analyticsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  hotspotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotspot',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  bandwidthUsed: Number, // in GB
  dataIn: Number, // in MB
  dataOut: Number, // in MB
  activeUsers: Number,
  peakSpeed: Number, // Mbps
  averageSpeed: Number, // Mbps
  uptime: Number, // percentage
  earnings: Number,
  transactions: Number
}, { timestamps: true });

analyticsSchema.index({ hotspotId: 1, date: -1 });
analyticsSchema.index({ userId: 1, date: -1 });


