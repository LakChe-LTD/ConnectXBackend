const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new Cart({
        userId,
        productId,
        quantity,
      });
    }

    await cartItem.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cartItem,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: "Error adding item to cart",
    });
  }
};


// Get cart items
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItems = await Cart.find({ userId })
      .populate('productId', 'name price imageUrl') 
      .exec();

    res.status(200).json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart data",
    });
  }
};

