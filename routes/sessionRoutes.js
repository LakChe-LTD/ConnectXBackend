// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getUserDevices, deleteUserDevice } = require('../controllers/sessionController');

router.get('/devices', authenticate, getUserDevices);
router.delete('/devices/:id', authenticate, deleteUserDevice);

module.exports = router;
