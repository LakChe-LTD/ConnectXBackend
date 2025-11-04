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



// GET /api/store/products/:id
exports.getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product details',
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
    });
  }
};



exports.getProductFilters = async (req, res) => {
  try {
    // Get distinct values for type and brand
    const types = await Product.distinct("type");
    const brands = await Product.distinct("brand");

    // Get min/max price range
    const prices = await Product.find().select("price");
    const priceRange = {
      min: prices.length ? Math.min(...prices.map(p => p.price)) : 0,
      max: prices.length ? Math.max(...prices.map(p => p.price)) : 0,
    };

    res.status(200).json({
      success: true,
      data: {
        types,
        brands,
        priceRange
      }
    });
  } catch (error) {
    console.error('Error fetching product filters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product filters',
    });
  }
};

