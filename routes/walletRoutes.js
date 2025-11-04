const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth"); // ✅ Corrected import
const { getWalletBalance, claimPendingRewards, withdrawKXT,getEarningsSummary, getMonthlyEarningsBarChart, getEarningsTrend} = require("../controllers/walletController");
// const { getWalletBalance } = require("../controllers/walletController");

// @route   GET /api/wallet/balance
// @desc    Get KXT balance (available + wallet)
// @access  Private
router.get("/balance", authenticate, getWalletBalance);
router.get("/transactions", authenticate, async (req, res) => {
  try {
    // Replace this mock data with actual logic
    res.json({
      success: true,
      message: "Wallet transactions fetched successfully",
      data: [],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
});

// POST /api/wallet/claim
router.post("/claim", authenticate, claimPendingRewards);
// POST /api/wallet/withdraw
router.post("/withdraw", authenticate, withdrawKXT);
// GET /api/wallet/earnings/summary - Total, monthly earnings, trend
router.get("/earnings/summary", authenticate, getEarningsSummary);
// GET /api/wallet/earnings/monthly - Bar chart data
router.get("/earnings/monthly", authenticate, getMonthlyEarningsBarChart);
router.get("/earnings/trend", authenticate, getEarningsTrend);



module.exports = router;




