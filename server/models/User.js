import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  googleId: {
    type: String,
    sparse: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  reputation: {
    score: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ['new', 'trusted', 'highly_trusted', 'champion'],
      default: 'new',
    },
    itemsReported: { type: Number, default: 0 },
    itemsFound: { type: Number, default: 0 },
    successfulReturns: { type: Number, default: 0 },
  },
  refreshToken: String,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update reputation level based on score
userSchema.methods.updateReputationLevel = function() {
  const score = this.reputation.score;
  if (score >= 100) this.reputation.level = 'champion';
  else if (score >= 50) this.reputation.level = 'highly_trusted';
  else if (score >= 20) this.reputation.level = 'trusted';
  else this.reputation.level = 'new';
};

// Remove sensitive fields from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
