import { ForbiddenError } from '../utils/errors.js';

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ForbiddenError('Admin access required'));
  }
};
