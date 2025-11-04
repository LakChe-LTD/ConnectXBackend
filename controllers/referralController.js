// controllers/referralController.js
const User = require('../models/User'); // Assuming the referral link is stored in the User model
const Referral = require('../models/Referral');

exports.getReferralLink = async (req, res) => {
  try {
    const userId = req.userId; // userId from authenticated request
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Assuming that referralLink is a field in the User schema
    let referralLink = user.referralLink;

    // If referral link is not yet set, generate and save it
    if (!referralLink) {
      referralLink = `${process.env.CLIENT_URL}/signup?ref=${user._id}`;
      user.referralLink = referralLink;
      await user.save();
    }

    res.status(200).json({
      success: true,
      referralLink,
    });
  } catch (error) {
    console.error('Error fetching referral link:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral link',
    });
  }
};
// controllers/referralController.js


exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.userId; // from authenticate middleware

    // Fetch all referral stats for the user
    const totalReferrals = await Referral.countDocuments({ referrer: userId });
    const approvedReferrals = await Referral.countDocuments({ referrer: userId, status: 'approved' });
    const pendingReferrals = await Referral.countDocuments({ referrer: userId, status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        total: totalReferrals,
        approved: approvedReferrals,
        pending: pendingReferrals,
      },
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral stats',
    });
  }
};
// Get recent referral activity
exports.getReferralActivity = async (req, res) => {
  try {
    const referrerId = req.userId; // Comes from authenticate middleware
    const referrals = await Referral.find({ referrer: referrerId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('referredUser', 'email username name') // Customize as needed
      .lean();

    return res.status(200).json({
      success: true,
      data: referrals.map((ref) => ({
        id: ref._id,
        referredUser: ref.referredUser ? {
          email: ref.referredUser.email,
          username: ref.referredUser.username || null,
          name: ref.referredUser.name || null,
        } : null,
        status: ref.status,
        createdAt: ref.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching referral activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching referral activity',
    });
  }
};


// Get top referrers
exports.getReferralLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Referral.aggregate([
      {
        $match: { status: 'approved' } // Only count approved referrals
      },
      {
        $group: {
          _id: '$referredBy', // Group by the user who referred others
          totalReferrals: { $sum: 1 } // Count number of referrals
        }
      },
      {
        $sort: { totalReferrals: -1 } // Sort descending
      },
      {
        $limit: 10 // Limit to top 10 referrers
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.fullName',
          email: '$user.email',
          totalReferrals: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching referral leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral leaderboard'
    });
  }
};

// In controllers/referralController.js
exports.getReferralTiers = async (req, res) => {
  try {
    const userId = req.userId;

    // Example tier thresholds
    const tiers = [
      { level: 1, referralsNeeded: 5 },
      { level: 2, referralsNeeded: 10 },
      { level: 3, referralsNeeded: 20 },
      { level: 4, referralsNeeded: 50 },
    ];

    // Count how many referrals the user has
    const totalReferrals = await Referral.countDocuments({ referrer: userId });

    // Determine current tier and progress
    let currentTier = 0;
    let nextTier = null;

    for (const tier of tiers) {
      if (totalReferrals >= tier.referralsNeeded) {
        currentTier = tier.level;
      } else {
        nextTier = {
          level: tier.level,
          referralsRemaining: tier.referralsNeeded - totalReferrals,
        };
        break;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        currentTier,
        nextTier: nextTier || "Max tier achieved",
      },
    });
  } catch (err) {
    console.error("Error getting referral tiers:", err);
    res.status(500).json({
      success: false,
      message: "Error getting referral tiers",
    });
  }
};

// controllers/referralController.js

exports.getReferralRewards = async (req, res) => {
  try {
    // Example rewards data — replace with DB lookup if you have a Rewards model
    const rewards = [
      { tier: 1, reward: '5% Bonus' },
      { tier: 2, reward: '10% Bonus + Badge' },
      { tier: 3, reward: 'Exclusive Webinar Access' },
      { tier: 4, reward: 'Cash Bonus $50' },
    ];

    res.status(200).json({
      success: true,
      data: rewards
    });
  } catch (error) {
    console.error('Error fetching referral rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral rewards'
    });
  }
};
