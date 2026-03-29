import Item from '../models/Item.js';
import Match from '../models/Match.js';
import { calculateDateProximity, calculateStringSimilarity } from '../utils/helpers.js';
import { createNotification } from './notificationService.js';

const MATCH_THRESHOLD = 40;

const WEIGHTS = {
  category: 0.30,
  keyword: 0.30,
  location: 0.20,
  date: 0.20,
};

export const findMatches = async (item) => {
  try {
    const oppositeType = item.type === 'lost' ? 'found' : 'lost';

    // Find potential matches of opposite type that are still active
    const candidates = await Item.find({
      type: oppositeType,
      status: 'active',
      category: item.category, // Must be same category for initial filter
      _id: { $ne: item._id },
    }).limit(50);

    const matches = [];

    for (const candidate of candidates) {
      const factors = {};

      // Category match (already filtered, so 100%)
      factors.category = 100;

      // Keyword similarity
      const titleSim = calculateStringSimilarity(item.title, candidate.title);
      const descSim = calculateStringSimilarity(item.description, candidate.description);
      factors.keyword = Math.round(titleSim * 0.6 + descSim * 0.4);

      // Location proximity
      factors.location = calculateStringSimilarity(
        item.location.name,
        candidate.location.name
      );

      // Date proximity
      factors.date = calculateDateProximity(
        new Date(item.dateLostOrFound),
        new Date(candidate.dateLostOrFound)
      );

      // Calculate weighted score
      const score = Math.round(
        factors.category * WEIGHTS.category +
        factors.keyword * WEIGHTS.keyword +
        factors.location * WEIGHTS.location +
        factors.date * WEIGHTS.date
      );

      if (score >= MATCH_THRESHOLD) {
        matches.push({ candidate, score, factors });
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    // Save top matches
    for (const match of matches.slice(0, 5)) {
      const matchData = {
        lostItem: item.type === 'lost' ? item._id : match.candidate._id,
        foundItem: item.type === 'found' ? item._id : match.candidate._id,
        score: match.score,
        factors: match.factors,
      };

      await Match.findOneAndUpdate(
        { lostItem: matchData.lostItem, foundItem: matchData.foundItem },
        matchData,
        { upsert: true, new: true }
      );

      // Notify both users
      await createNotification({
        user: item.reportedBy,
        type: 'match',
        title: 'Potential Match Found!',
        message: `We found a potential match for your ${item.type} item "${item.title}" with ${match.score}% confidence.`,
        relatedItem: match.candidate._id,
        actionUrl: `/items/${match.candidate._id}`,
      });

      await createNotification({
        user: match.candidate.reportedBy,
        type: 'match',
        title: 'Potential Match Found!',
        message: `Someone reported a ${item.type} item that might match your "${match.candidate.title}" with ${match.score}% confidence.`,
        relatedItem: item._id,
        actionUrl: `/items/${item._id}`,
      });
    }

    return matches;
  } catch (error) {
    console.error('Matching error:', error);
    return [];
  }
};

export const getMatchesForItem = async (itemId) => {
  try {
    const matches = await Match.find({
      $or: [{ lostItem: itemId }, { foundItem: itemId }],
      status: 'suggested',
    })
    .sort({ score: -1 })
    .populate('lostItem', 'title description category location images status')
    .populate('foundItem', 'title description category location images status');

    return matches;
  } catch (error) {
    console.error('Get matches error:', error);
    return [];
  }
};
