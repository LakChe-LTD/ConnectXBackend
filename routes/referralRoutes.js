const express = require("express");
const router = express.Router();
const { authenticate } = require('../middleware/auth'); 

// ✅ Import the new function too
const { getReferralLink, getReferralStats, getReferralActivity, getReferralLeaderboard, getReferralTiers, getReferralRewards } = require('../controllers/referralController');

console.log('authenticate is: ', authenticate); 

router.get('/link', authenticate, getReferralLink);
router.get('/stats', authenticate, getReferralStats);

// ✅ Add the new route using the destructured method
router.get('/activity', authenticate, getReferralActivity);
router.get('/leaderboard', authenticate, getReferralLeaderboard);
router.get('/tiers', authenticate, getReferralTiers);
router.get('/rewards', authenticate, getReferralRewards);

module.exports = router;
