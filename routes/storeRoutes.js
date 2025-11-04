// routes/storeRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createProduct, getAllProducts, getProductDetails, getProductFilters } = require('../controllers/storeController');


// for testing 
router.post('/products', authenticate, createProduct);


router.get('/products', authenticate, getAllProducts);
// Get product details by ID
router.get('/products/:id', authenticate, getProductDetails);

// new route for the filters
router.get('/filters', authenticate, getProductFilters);

module.exports = router;
