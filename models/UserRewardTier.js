// models/UserRewardTier.js
const userRewardTierSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tierName: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  monthlyBandwidth: {
    type: Number,
    default: 0
  },
  bonusRate: Number,
  earnedBonuses: {
    type: Number,
    default: 0
  },
  achievedAt: Date,
  upgradedAt: Date
}, { timestamps: true });

userRewardTierSchema.index({ userId: 1 });