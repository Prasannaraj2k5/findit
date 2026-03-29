import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// Dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalItems,
      lostItems,
      foundItems,
      activeItems,
      matchedItems,
      closedItems,
      totalClaims,
      pendingClaims,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'active' }),
      Item.countDocuments({ status: 'matched' }),
      Item.countDocuments({ status: 'closed' }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'pending' }),
    ]);

    const recoveryRate = totalItems > 0 ? Math.round((closedItems / totalItems) * 100) : 0;

    // Recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentItems = await Item.countDocuments({ createdAt: { $gte: weekAgo } });

    // Monthly stats for chart
    const monthlyStats = await Item.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 24 },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalItems,
        lostItems,
        foundItems,
        activeItems,
        matchedItems,
        closedItems,
        totalClaims,
        pendingClaims,
        recoveryRate,
        recentItems,
      },
      monthlyStats,
    });
  } catch (error) {
    next(error);
  }
});

// Get all items (admin view)
router.get('/items', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'name email reputation'),
      Item.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// Remove item (admin)
router.delete('/items/:id', async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item removed by admin' });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// Update user role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

export default router;
