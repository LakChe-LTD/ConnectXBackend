// controllers/checkoutController.js
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch cart items
    const cartItems = await Cart.find({ userId }).populate('productId');

    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Build order items with product details
    const orderItems = cartItems.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price // assuming 'price' exists in Product model
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Create order
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount,
    });

    await newOrder.save();

    // Empty cart
    await Cart.deleteMany({ userId });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user"
      });
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user orders"
    });
  }
};
exports.getOrderDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
    });
  }
};

