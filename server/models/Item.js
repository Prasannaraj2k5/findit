import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: [true, 'Item type is required'],
  },
  category: {
    type: String,
    enum: [
      'electronics', 'books', 'id_cards', 'keys',
      'clothing', 'accessories', 'bags', 'sports',
      'documents', 'wallet', 'jewelry', 'other'
    ],
    required: [true, 'Category is required'],
  },
  location: {
    name: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    building: String,
    floor: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  dateLostOrFound: {
    type: Date,
    required: [true, 'Date is required'],
  },
  images: [{
    url: String,
    publicId: String,
  }],
  contactInfo: {
    phone: String,
    email: String,
    preferredMethod: {
      type: String,
      enum: ['email', 'phone', 'in_app'],
      default: 'in_app',
    },
  },
  verificationClues: {
    type: String,
    select: false, // Hidden by default - only shown during claim verification
    maxlength: [500, 'Verification clues cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: ['active', 'matched', 'claimed', 'closed'],
    default: 'active',
  },
  handoverStatus: {
    type: String,
    enum: ['with_finder', 'ready_for_pickup', 'handed_to_admin', 'returned'],
    default: 'with_finder',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Text index for full-text search
itemSchema.index({
  title: 'text',
  description: 'text',
  'location.name': 'text',
  category: 'text',
});

// Compound indexes for common queries
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ reportedBy: 1, createdAt: -1 });
itemSchema.index({ dateLostOrFound: -1 });

const Item = mongoose.model('Item', itemSchema);
export default Item;
