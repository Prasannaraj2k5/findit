import express from 'express';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import { protect } from '../middleware/auth.js';
import { validate, claimValidation, mongoIdValidation } from '../middleware/validate.js';
import { createNotification } from '../services/notificationService.js';
import { addReputationPoints } from '../services/reputationService.js';

const router = express.Router();

// Submit a claim
router.post('/', protect, claimValidation, validate, async (req, res, next) => {
  try {
    const { itemId, verificationAnswers, additionalInfo } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot claim your own item' });
    }

    if (item.status === 'closed') {
      return res.status(400).json({ error: 'This item has been closed' });
    }

    // Check for existing claim
    const existingClaim = await Claim.findOne({ item: itemId, claimant: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ error: 'You have already submitted a claim for this item' });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      verificationAnswers,
      additionalInfo,
    });

    // Update item status
    item.status = 'claimed';
    await item.save();

    // Notify item owner
    await createNotification({
      user: item.reportedBy,
      type: 'claim',
      title: 'New Claim Received',
      message: `${req.user.name} has submitted a claim for your item "${item.title}". Review their verification answers.`,
      relatedItem: item._id,
      relatedClaim: claim._id,
      actionUrl: `/items/${item._id}`,
    });

    res.status(201).json({ claim });
  } catch (error) {
    next(error);
  }
});

// Get my claims
router.get('/my', protect, async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .sort('-createdAt')
      .populate('item', 'title type status images category');

    res.json({ claims });
  } catch (error) {
    next(error);
  }
});

// Get claims for an item (item owner only)
router.get('/item/:id', protect, mongoIdValidation, validate, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const claims = await Claim.find({ item: req.params.id })
      .sort('-createdAt')
      .populate('claimant', 'name email avatar reputation');

    res.json({ claims });
  } catch (error) {
    next(error);
  }
});

// Approve claim
router.put('/:id/approve', protect, mongoIdValidation, validate, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const item = claim.item;
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    claim.status = 'approved';
    claim.reviewedBy = req.user._id;
    claim.reviewNote = req.body.note;
    await claim.save();

    // Update item
    item.status = 'closed';
    item.claimedBy = claim.claimant;
    item.handoverStatus = 'returned';
    await item.save();

    // Reject other claims
    await Claim.updateMany(
      { item: item._id, _id: { $ne: claim._id }, status: 'pending' },
      { status: 'rejected', reviewNote: 'Another claim was approved' }
    );

    // Reputation rewards
    await addReputationPoints(claim.claimant, 'CLAIM_APPROVED');
    if (item.type === 'found') {
      await addReputationPoints(item.reportedBy, 'SUCCESSFUL_RETURN');
    }

    // Notify claimant
    await createNotification({
      user: claim.claimant,
      type: 'claim_approved',
      title: 'Claim Approved! 🎉',
      message: `Your claim for "${item.title}" has been approved! Contact the reporter to arrange pickup.`,
      relatedItem: item._id,
      actionUrl: `/items/${item._id}`,
    });

    res.json({ claim, item });
  } catch (error) {
    next(error);
  }
});

// Reject claim
router.put('/:id/reject', protect, mongoIdValidation, validate, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const item = claim.item;
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    claim.status = 'rejected';
    claim.reviewedBy = req.user._id;
    claim.reviewNote = req.body.note || 'Verification failed';
    await claim.save();

    // Check if there are other pending claims
    const pendingClaims = await Claim.countDocuments({ item: item._id, status: 'pending' });
    if (pendingClaims === 0) {
      item.status = 'active';
      await item.save();
    }

    // Notify claimant
    await createNotification({
      user: claim.claimant,
      type: 'claim_rejected',
      title: 'Claim Rejected',
      message: `Your claim for "${item.title}" was not approved. ${req.body.note || ''}`,
      relatedItem: item._id,
      actionUrl: `/items/${item._id}`,
    });

    res.json({ claim });
  } catch (error) {
    next(error);
  }
});

// Add message to claim
router.post('/:id/messages', protect, mongoIdValidation, validate, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Only claimant or item owner can message
    const isClaimant = claim.claimant.toString() === req.user._id.toString();
    const isOwner = claim.item.reportedBy.toString() === req.user._id.toString();

    if (!isClaimant && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    claim.messages.push({
      sender: req.user._id,
      content: req.body.content,
    });
    await claim.save();

    // Notify the other party
    const recipientId = isClaimant ? claim.item.reportedBy : claim.claimant;
    await createNotification({
      user: recipientId,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name} sent you a message about "${claim.item.title}".`,
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
      actionUrl: `/items/${claim.item._id}`,
    });

    res.json({ message: claim.messages[claim.messages.length - 1] });
  } catch (error) {
    next(error);
  }
});

export default router;
