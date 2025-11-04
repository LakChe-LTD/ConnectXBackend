const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

const Wallet = require("../models/Wallet");
const Earnings = require("../models/Earnings");

const getWalletBalance = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the user's wallet
    let wallet = await Wallet.findOne({ user: userId });

    // If no wallet exists, create one with default values
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    return res.json({
      success: true,
      data: {
        available: wallet.available,
        wallet: wallet.wallet
      }
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching wallet balance"
    });
  }
};
// Claim pending rewards
const claimPendingRewards = async (req, res) => {
  try {
    const userId = req.userId;
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (wallet.pendingRewards <= 0) {
      return res.status(400).json({
        success: false,
        message: "No pending rewards to claim",
      });
    }

    wallet.available += wallet.pendingRewards;
    wallet.pendingRewards = 0;
    await wallet.save();

    return res.status(200).json({
      success: true,
      message: "Pending rewards claimed successfully",
      data: {
        available: wallet.available,
        pendingRewards: wallet.pendingRewards,
      },
    });
  } catch (error) {
    console.error("Error claiming pending rewards:", error);
    return res.status(500).json({
      success: false,
      message: "Server error claiming pending rewards",
    });
  }
};
const withdrawKXT = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, externalAddress } = req.body;

    if (!amount || !externalAddress) {
      return res.status(400).json({
        success: false,
        message: "Amount and external address are required",
      });
    }

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (wallet.available < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Deduct from available balance
    wallet.available -= amount;
    await wallet.save();

    // You would normally integrate with blockchain here to send the tokens
    // e.g., call smart contract or send via API to a crypto provider

    return res.status(200).json({
      success: true,
      message: `$${amount} KXT withdrawn to ${externalAddress} successfully`,
      data: {
        available: wallet.available,
      },
    });
  } catch (error) {
    console.error("Error during withdrawal:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during withdrawal",
    });
  }
};


const getEarningsSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch all earnings for the user
    const earnings = await Earnings.find({ user: userId }).sort({ date: 1 });

    if (!earnings.length) {
      return res.status(200).json({
        success: true,
        message: "No earnings found",
        data: {
          totalEarnings: 0,
          monthlyEarnings: {},
          trend: [],
        },
      });
    }

    // Total earnings
    const totalEarnings = earnings.reduce((sum, record) => sum + record.amount, 0);

    // Monthly earnings summary
    const monthlyEarnings = {};
    const trend = [];

    earnings.forEach((record) => {
      const month = record.date.toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyEarnings[month]) monthlyEarnings[month] = 0;
      monthlyEarnings[month] += record.amount;
    });

    // Prepare trend data for graphing (e.g., last 6 months)
    Object.keys(monthlyEarnings).slice(-6).forEach((month) => {
      trend.push({ month, amount: monthlyEarnings[month] });
    });

    return res.json({
      success: true,
      message: "Earnings summary fetched successfully",
      data: {
        totalEarnings,
        monthlyEarnings,
        trend,
      },
    });
  } catch (error) {
    console.error("Error fetching earnings summary:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching earnings summary",
    });
  }
};


const getMonthlyEarningsBarChart = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch all earnings of the user
    const earnings = await Earnings.find({ user: userId }).sort({ date: 1 });

    if (!earnings.length) {
      return res.json({
        success: true,
        message: "No earnings found",
        data: [],
      });
    }

    // Group earnings by month
    const monthlyEarnings = {}; // Ex: { "2025-01": 300, ... }

    earnings.forEach((record) => {
      const month = record.date.toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyEarnings[month]) monthlyEarnings[month] = 0;
      monthlyEarnings[month] += record.amount;
    });

    // Convert to array format for chart
    const chartData = Object.entries(monthlyEarnings)
      .map(([month, amount]) => ({
        month,
        amount,
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    return res.json({
      success: true,
      message: "Monthly earnings bar chart data fetched successfully",
      data: chartData,
    });
  } catch (error) {
    console.error("Error fetching monthly earnings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching monthly earnings",
    });
  }
};


// controllers/walletController.js

const getEarningsTrend = async (req, res) => {
  try {
    const userId = req.userId;

    const earningsData = await Transaction.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId), 
          type: { $in: ['earning', 'bonus'] } 
        } 
      },
      { 
        $group: { 
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          earnings: { $sum: '$amount' }
        } 
      },
      { 
        $sort: { '_id.year': 1, '_id.month': 1 } 
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: '$_id.year' }, '-',
              {
                $cond: [
                  { $lte: ['$_id.month', 9] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]
              }
            ]
          },
          earnings: 1
        }
      }
    ]);

    console.log("Earnings Trend Data:", earningsData);

    res.status(200).json({
      success: true,
      data: earningsData,
    });

  } catch (error) {
    console.error('Error fetching line chart earnings data:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching earnings trend data",
    });
  }
};




module.exports = {
  getWalletBalance,
  claimPendingRewards,
  withdrawKXT,
  getEarningsSummary,
  getMonthlyEarningsBarChart,
  getEarningsTrend
};


