// routes/checkoutRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createOrder, getUserOrders, getOrderDetails } = require('../controllers/checkoutController');

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderDetails);


module.exports = router;
