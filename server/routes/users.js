import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { getReputationBadge } from '../services/reputationService.js';

const router = express.Router();

// Get current user profile
router.get('/profile', protect, async (req, res) => {
  const badge = getReputationBadge(req.user.reputation.level);
  res.json({
    user: req.user.toJSON(),
    badge,
  });
});

// Leaderboard (must be before /:id routes)
router.get('/leaderboard', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('name avatar reputation createdAt')
        .sort({ 'reputation.score': -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    const leaderboard = users.map((user, index) => ({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      reputation: user.reputation,
      badge: getReputationBadge(user.reputation.level),
      rank: skip + index + 1,
    }));

    res.json({
      leaderboard,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'avatar'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/account', protect, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user reputation (must be after specific routes)
router.get('/:id/reputation', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar reputation');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const badge = getReputationBadge(user.reputation.level);
    res.json({
      name: user.name,
      avatar: user.avatar,
      reputation: user.reputation,
      badge,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
