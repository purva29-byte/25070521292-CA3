import { body, param, query } from 'express-validator';
import { LISTING_CATEGORIES, LISTING_CONDITIONS } from '../utils/constants.js';

export const strongPassword = (field = 'password') =>
  body(field)
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8–128 characters long.')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number.');

export const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be 2–80 characters long.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('college')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('College name must be 2–120 characters long.'),
  body('department')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters.'),
  body('year')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 30 })
    .withMessage('Year cannot exceed 30 characters.'),
  strongPassword('password'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
  body('terms')
    .custom((value) => value === true || value === 'true')
    .withMessage('You must agree to the terms and safety guidelines.'),
];

export const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required.'),
];

export const forgotPasswordRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address.')
    .normalizeEmail(),
];

export const resetPasswordRules = [
  body('token').trim().isLength({ min: 20, max: 200 }).withMessage('Reset token is invalid.'),
  strongPassword('password'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
];

export const idParamRule = [param('id').isMongoId().withMessage('Invalid resource id.')];
export const listingIdParamRule = [
  param('listingId').isMongoId().withMessage('Invalid listing id.'),
];

export const profileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be 2–80 characters long.'),
  body('college')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('College name must be 2–120 characters long.'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters.'),
  body('year')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Year cannot exceed 30 characters.'),
];

export const listingBodyRules = ({ partial = false } = {}) => {
  const maybe = (chain) => (partial ? chain.optional() : chain);
  return [
    maybe(body('title').trim().isLength({ min: 4, max: 120 })).withMessage(
      'Title must be 4–120 characters long.'
    ),
    maybe(body('description').trim().isLength({ min: 20, max: 3000 })).withMessage(
      'Description must be 20–3000 characters long.'
    ),
    maybe(body('price').isFloat({ min: 0, max: 1000000 }).toFloat()).withMessage(
      'Price must be between ₹0 and ₹10,00,000.'
    ),
    maybe(body('category').isIn(LISTING_CATEGORIES)).withMessage('Choose a valid category.'),
    maybe(body('condition').isIn(LISTING_CONDITIONS)).withMessage('Choose a valid condition.'),
    maybe(body('college').trim().isLength({ min: 2, max: 120 })).withMessage(
      'Campus or college is required.'
    ),
    body('pickupLocation')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ max: 120 })
      .withMessage('Pickup location cannot exceed 120 characters.'),
    body('isNegotiable')
      .optional()
      .custom((value) => ['true', 'false', true, false].includes(value))
      .withMessage('Negotiable must be true or false.'),
    body('keptImages')
      .optional()
      .custom((value) => {
        if (value === undefined || value === '') return true;
        try {
          const parsed = typeof value === 'string' ? JSON.parse(value) : value;
          return Array.isArray(parsed) && parsed.length <= 6 && parsed.every((item) => typeof item === 'string');
        } catch {
          return false;
        }
      })
      .withMessage('Existing images are invalid.'),
  ];
};

export const listingQueryRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 48 }).toInt(),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('sort')
    .optional()
    .isIn(['newest', 'price_asc', 'price_desc', 'relevance'])
    .withMessage('Invalid sort option.'),
  query('category').optional().isString(),
  query('condition').optional().isString(),
  query('seller').optional().isMongoId().withMessage('Invalid seller id.'),
];

export const listingStatusRules = [
  body('status').isIn(['sold', 'pending']).withMessage('Status must be sold or pending.'),
];

export const conversationRules = [
  body('listingId').isMongoId().withMessage('Invalid listing id.'),
];

export const messageRules = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be 1–2000 characters long.'),
];

export const reportRules = [
  body('listingId').isMongoId().withMessage('Invalid listing id.'),
  body('reason')
    .isIn(['prohibited_item', 'misleading', 'spam', 'scam', 'other'])
    .withMessage('Choose a valid report reason.'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters.'),
];

export const moderationRules = [
  body('action')
    .isIn(['approve', 'reject', 'remove', 'restore'])
    .withMessage('Invalid moderation action.'),
  body('reason')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Reason cannot exceed 1000 characters.'),
];

export const reportReviewRules = [
  body('status').isIn(['resolved', 'dismissed']).withMessage('Invalid report status.'),
  body('resolutionNote')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Resolution note cannot exceed 1000 characters.'),
  body('removeListing').optional().isBoolean().toBoolean(),
];

export const userStatusRules = [
  body('status').isIn(['active', 'suspended']).withMessage('Invalid user status.'),
  body('reason')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Reason cannot exceed 1000 characters.'),
];
