// routes/adminAnalytics.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

// Protect route: must be authenticated and have role 'admin'
router.get(
  '/dashboard',
  authenticate,
  authorize(['admin']),
  adminAnalyticsController.getDashboardOverview
);

module.exports = router;
