import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  lostItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  foundItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  factors: {
    keyword: { type: Number, default: 0 },
    category: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
    date: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['suggested', 'confirmed', 'rejected'],
    default: 'suggested',
  },
}, {
  timestamps: true,
});

matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
matchSchema.index({ score: -1 });

const Match = mongoose.model('Match', matchSchema);
export default Match;
