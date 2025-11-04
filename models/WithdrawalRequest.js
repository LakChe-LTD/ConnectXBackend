
// models/WithdrawalRequest.js
const withdrawalSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10 // minimum $10 withdrawal
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
    default: 'pending'
  },
  bankAccount: {
    accountHolder: String,
    accountNumber: String,
    routingNumber: String,
    bankName: String
  },
  transactionId: mongoose.Schema.Types.ObjectId,
  rejectionReason: String,
  processedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

withdrawalSchema.index({ userId: 1, createdAt: -1 });