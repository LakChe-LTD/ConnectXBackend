// controllers/storeController.js
const Product = require('../models/Product');  // Assuming you will create a Product model

exports.getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, availability } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (availability) filter.availability = availability;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
    });
  }
};
