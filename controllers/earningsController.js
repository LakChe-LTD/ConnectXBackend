// controllers/earningsController.js
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const getEarningsTrend = async (req, res) => {
  try {
    const userId = req.userId;

    const earningsData = await Transaction.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId), 
          type: { $in: ['earning', 'bonus'] } // make sure this aligns with your types
        } 
      },
      { 
        $group: { 
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          earnings: { $sum: '$amount' }
        } 
      },
      { 
        $sort: { '_id.year': 1, '_id.month': 1 } 
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lte: ['$_id.month', 9] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]
              }
            ]
          },
          earnings: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: earningsData,
    });

  } catch (error) {
    console.error('Error fetching earnings trend data:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching earnings trend data',
    });
  }
};

module.exports = { getEarningsTrend };
