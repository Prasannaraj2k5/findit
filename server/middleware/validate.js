import { validationResult, body, param, query } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join(', ');
    return next(new ValidationError(messages));
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const itemValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('type').isIn(['lost', 'found']).withMessage('Type must be lost or found'),
  body('category').isIn([
    'electronics', 'books', 'id_cards', 'keys', 'clothing',
    'accessories', 'bags', 'sports', 'documents', 'wallet', 'jewelry', 'other'
  ]).withMessage('Invalid category'),
  // Handle location sent as JSON string (multipart) or nested object
  body('location').custom((value) => {
    if (!value) throw new Error('Location is required');
    if (typeof value === 'string') {
      try { const parsed = JSON.parse(value); if (parsed.name) return true; } catch {}
      if (value.trim().length > 0) return true; // plain string location name
    }
    if (typeof value === 'object' && value.name && value.name.trim().length > 0) return true;
    throw new Error('Location is required');
  }),
  // Accept both YYYY-MM-DD and full ISO 8601 date strings
  body('dateLostOrFound').custom((value) => {
    if (!value) throw new Error('Valid date is required');
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new Error('Valid date is required');
    return true;
  }),
];

export const claimValidation = [
  body('itemId').trim().notEmpty().withMessage('Valid item ID is required'),
  body('verificationAnswers').trim().notEmpty().withMessage('Verification answer is required')
    .isLength({ max: 1000 }).withMessage('Answer cannot exceed 1000 characters'),
];

export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

export const mongoIdValidation = [
  param('id').trim().notEmpty().withMessage('Invalid ID format'),
];
