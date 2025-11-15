// controllers/adminController.js
const Product = require('../models/Product');  // Assuming you will create a Product model
const User = require('../models/User');
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

// GET /api/admin/users/growthUser?interval=day&start=2025-10-01&end=2025-11-10
exports.getUserGrowth = async (req, res) => {
  try {
    const { interval = 'day', start, end } = req.query;

    // Build date filter
    let match = { role: 'user' };
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end) match.createdAt.$lte = new Date(end);
    }

    // Define grouping by interval
    let groupId = {};
    let formatDate = (id) => '';

    switch(interval) {
      case 'month':
        groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        formatDate = (id) => `${id.year}-${String(id.month).padStart(2,'0')}`;
        break;
      case 'week':
        groupId = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
        formatDate = (id) => `Week ${id.week}, ${id.year}`;
        break;
      case 'day':
      default:
        groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
        formatDate = (id) => `${id.year}-${String(id.month).padStart(2,'0')}-${String(id.day).padStart(2,'0')}`;
    }

    const growthData = await User.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    const chartData = growthData.map(item => ({
      date: formatDate(item._id),
      users: item.count
    }));

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error fetching user growth:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



