import express from 'express';
import Item from '../models/Item.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate, itemValidation, paginationValidation, mongoIdValidation } from '../middleware/validate.js';
import { upload, useCloudinary } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { buildFilterQuery } from '../utils/helpers.js';
import { findMatches, getMatchesForItem } from '../services/matchingService.js';
import { addReputationPoints } from '../services/reputationService.js';

const router = express.Router();

// Create item (lost or found)
router.post('/', protect, uploadLimiter, upload.array('images', 5), itemValidation, validate, async (req, res, next) => {
  try {
    const { title, description, type, category, location, dateLostOrFound, contactInfo, verificationClues, handoverStatus } = req.body;

    const images = (req.files || []).map(file => ({
      url: useCloudinary ? file.path : `/uploads/${file.filename}`,
      publicId: useCloudinary ? file.filename : file.filename,
    }));

    const item = await Item.create({
      title,
      description,
      type,
      category,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      dateLostOrFound,
      images,
      contactInfo: typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo,
      verificationClues,
      handoverStatus: type === 'found' ? (handoverStatus || 'with_finder') : undefined,
      reportedBy: req.user._id,
    });

    // Update reputation
    await addReputationPoints(
      req.user._id,
      type === 'found' ? 'REPORT_FOUND' : 'REPORT_LOST'
    );

    // Trigger smart matching
    const matches = await findMatches(item);

    res.status(201).json({
      item,
      matchCount: matches.length,
    });
  } catch (error) {
    next(error);
  }
});

// Browse/search items
router.get('/', optionalAuth, paginationValidation, validate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';

    const filterQuery = buildFilterQuery(req.query);
    
    const [items, total] = await Promise.all([
      Item.find(filterQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'name avatar reputation.level reputation.score'),
      Item.countDocuments(filterQuery),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// Get single item
router.get('/:id', optionalAuth, mongoIdValidation, validate, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name avatar reputation email')
      .populate('matchedWith', 'title type status images');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({ item });
  } catch (error) {
    next(error);
  }
});

// Get matches for item
router.get('/:id/matches', protect, mongoIdValidation, validate, async (req, res, next) => {
  try {
    const matches = await getMatchesForItem(req.params.id);
    res.json({ matches });
  } catch (error) {
    next(error);
  }
});

// Update item
router.put('/:id', protect, mongoIdValidation, validate, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    const allowedUpdates = ['title', 'description', 'category', 'location', 'status', 'contactInfo', 'handoverStatus'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

// Delete item
router.delete('/:id', protect, mongoIdValidation, validate, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user's items
router.get('/user/my-items', protect, async (req, res, next) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id })
      .sort('-createdAt')
      .populate('matchedWith', 'title type status');

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

export default router;
