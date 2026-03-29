import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  verificationAnswers: {
    type: String,
    required: [true, 'Verification answer is required'],
    maxlength: [1000, 'Answer cannot exceed 1000 characters'],
  },
  additionalInfo: {
    type: String,
    maxlength: [500, 'Additional info cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewNote: String,
}, {
  timestamps: true,
});

claimSchema.index({ item: 1, claimant: 1 }, { unique: true });
claimSchema.index({ status: 1 });

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
