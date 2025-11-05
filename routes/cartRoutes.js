const express = require("express");
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { addToCart, getCart } = require('../controllers/cartController');

router.post('/add', authenticate, addToCart);
router.get('/', authenticate, getCart);
module.exports = router;
