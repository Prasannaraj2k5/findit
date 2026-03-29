import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['match', 'claim', 'claim_approved', 'claim_rejected', 'status_update', 'system', 'message'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  },
  relatedClaim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  actionUrl: String,
}, {
  timestamps: true,
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
