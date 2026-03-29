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

// Get user reputation
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
