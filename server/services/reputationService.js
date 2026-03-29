import User from '../models/User.js';

const POINTS = {
  REPORT_FOUND: 5,
  REPORT_LOST: 2,
  SUCCESSFUL_RETURN: 15,
  CLAIM_APPROVED: 10,
  DAILY_LOGIN: 1,
};

export const addReputationPoints = async (userId, action) => {
  try {
    const points = POINTS[action] || 0;
    if (points === 0) return;

    const user = await User.findById(userId);
    if (!user) return;

    user.reputation.score += points;

    // Update counters
    if (action === 'REPORT_FOUND') user.reputation.itemsFound += 1;
    if (action === 'REPORT_LOST') user.reputation.itemsReported += 1;
    if (action === 'SUCCESSFUL_RETURN') user.reputation.successfulReturns += 1;

    // Update level
    user.updateReputationLevel();
    await user.save();

    return user.reputation;
  } catch (error) {
    console.error('Reputation update error:', error);
  }
};

export const getReputationBadge = (level) => {
  const badges = {
    new: { label: 'New User', color: '#94a3b8', icon: '🌱' },
    trusted: { label: 'Trusted', color: '#3b82f6', icon: '⭐' },
    highly_trusted: { label: 'Highly Trusted', color: '#8b5cf6', icon: '🏆' },
    champion: { label: 'Champion', color: '#f59e0b', icon: '👑' },
  };
  return badges[level] || badges.new;
};
