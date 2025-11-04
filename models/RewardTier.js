
// models/RewardTier.js
const rewardTierSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    required: true,
    unique: true
  },
  minBandwidth: {
    type: Number, // in GB per month
    required: true
  },
  bonusPercentage: {
    type: Number,
    required: true
  },
  description: String,
  benefits: [String],
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


