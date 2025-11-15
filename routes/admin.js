const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth'); // your JWT auth middleware
const authorizeAdmin = require('../middleware/admin'); // optional: only admins

// Example: GET /api/admin/users/growthUser
router.get(
  '/users/growthUser',
  authenticate,       // check if logged in
  authorizeAdmin,     // check if role is 'admin' (optional)
  adminController.getUserGrowth
);

module.exports = router;
