const express = require("express");
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { addToCart } = require('../controllers/cartController');

router.post('/add', authenticate, addToCart);

module.exports = router;
