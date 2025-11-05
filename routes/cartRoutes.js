const express = require("express");
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');

router.post('/add', authenticate, addToCart);
router.get('/', authenticate, getCart);
router.delete('/remove/:id', authenticate, removeFromCart);
module.exports = router;
