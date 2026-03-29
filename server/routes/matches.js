import express from 'express';
import Match from '../models/Match.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get matches for current user's items
router.get('/my', protect, async (req, res, next) => {
  try {
    const matches = await Match.find({ status: 'suggested' })
      .sort({ score: -1 })
      .populate({
        path: 'lostItem',
        match: { reportedBy: req.user._id },
        select: 'title description category location images status reportedBy',
      })
      .populate({
        path: 'foundItem',
        match: { reportedBy: req.user._id },
        select: 'title description category location images status reportedBy',
      });

    // Filter to only include matches where user owns one of the items
    const userMatches = matches.filter(m => m.lostItem || m.foundItem);

    res.json({ matches: userMatches });
  } catch (error) {
    next(error);
  }
});

// Confirm or reject a match
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be confirmed or rejected' });
    }

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ match });
  } catch (error) {
    next(error);
  }
});

export default router;
