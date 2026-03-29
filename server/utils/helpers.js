import crypto from 'crypto';

export const generateToken = () => crypto.randomBytes(32).toString('hex');

export const paginate = (query, page = 1, limit = 12) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

export const buildFilterQuery = (filters) => {
  const query = {};

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.location) {
    query['location.name'] = { $regex: filters.location, $options: 'i' };
  }
  if (filters.dateFrom || filters.dateTo) {
    query.dateLostOrFound = {};
    if (filters.dateFrom) query.dateLostOrFound.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.dateLostOrFound.$lte = new Date(filters.dateTo);
  }
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return query;
};

export const calculateDateProximity = (date1, date2) => {
  const diffDays = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 100;
  if (diffDays <= 3) return 80;
  if (diffDays <= 7) return 60;
  if (diffDays <= 14) return 40;
  if (diffDays <= 30) return 20;
  return 5;
};

export const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1 === s2) return 100;

  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let matches = 0;
  for (const word of words1) {
    if (words2.has(word)) matches++;
  }

  const union = new Set([...words1, ...words2]).size;
  return Math.round((matches / union) * 100);
};
