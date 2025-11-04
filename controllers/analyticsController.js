
// controllers/analyticsController.js
const Analytics = require('../models/Analytics');
const Hotspot = require('../models/Hotspot');
const Transaction = require('../models/Transaction');

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.userId;

    // Get hotspot stats
    const hotspots = await Hotspot.find({ userId });
    const activeHotspots = hotspots.filter(h => h.status === 'online').length;
    
    const totalConnectedUsers = hotspots.reduce((sum, h) => sum + h.connectedUsers, 0);
    const totalBandwidthUsed = hotspots.reduce((sum, h) => sum + h.bandwidthUsed, 0);
    const totalEarnings = hotspots.reduce((sum, h) => sum + h.totalEarnings, 0);
    const monthlyEarnings = hotspots.reduce((sum, h) => sum + h.monthlyEarnings, 0);

    // Get available balance from transactions
    const transactions = await Transaction.find({ userId });
    const availableBalance = transactions
      .filter(t => t.status === 'completed' && t.type !== 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      overview: {
        totalHotspots: hotspots.length,
        activeHotspots,
        totalConnectedUsers,
        totalBandwidthUsed,
        monthlyEarnings,
        totalEarnings,
        availableBalance
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboardOverview };
