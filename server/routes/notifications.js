import express from 'express';
import { protect } from '../middleware/auth.js';
import { getUserNotifications, markAsRead, markAllAsRead } from '../services/notificationService.js';

const router = express.Router();

// Get notifications
router.get('/', protect, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await getUserNotifications(req.user._id, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Mark one as read
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ notification });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.put('/read-all', protect, async (req, res, next) => {
  try {
    await markAllAsRead(req.user._id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
