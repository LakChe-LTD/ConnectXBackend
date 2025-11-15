// controllers/adminAnalyticsController.js
const User = require('../models/User');
const Hotspot = require('../models/Hotspot');
const Transaction = require('../models/Transaction');

/**
 * GET /api/admin/dashboard
 * Overview: users, hotspots, payouts, average speed
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    // Count users (excluding admins)
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Count total hotspots
    const totalHotspots = await Hotspot.countDocuments();

    // Count total completed payouts
    const totalPayouts = await Transaction.countDocuments({
      type: 'withdrawal',
      status: 'completed',
    });

    // Average bandwidth speed (Mbps)
    const avgSpeedAgg = await Hotspot.aggregate([
      { $group: { _id: null, avgSpeed: { $avg: '$bandwidthLimit' } } },
    ]);
    const averageSpeed = avgSpeedAgg.length ? avgSpeedAgg[0].avgSpeed : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalHotspots,
        totalPayouts,
        averageSpeed: `${averageSpeed.toFixed(2)} Mbps`,
      },
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard data',
    });
  }
};
