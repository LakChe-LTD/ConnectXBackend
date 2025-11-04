
// models/SupportTicket.js
const ticketSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'account', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  attachments: [String],
  replies: [{
    adminId: mongoose.Schema.Types.ObjectId,
    message: String,
    createdAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
}, { timestamps: true });
