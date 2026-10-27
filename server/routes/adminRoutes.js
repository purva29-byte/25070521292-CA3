import { Router } from 'express';
import {
  getAdminListings,
  getAdminReports,
  getAdminUsers,
  getModerationLogs,
  getStats,
  moderateListing,
  reviewReport,
  updateUserStatus,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  idParamRule,
  moderationRules,
  reportReviewRules,
  userStatusRules,
} from '../validators/index.js';
import { writeLimiter } from '../middleware/rateLimits.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/listings', getAdminListings);
router.patch(
  '/listings/:id/moderate',
  writeLimiter,
  validate([...idParamRule, ...moderationRules]),
  moderateListing
);
router.get('/users', getAdminUsers);
router.patch(
  '/users/:id/status',
  writeLimiter,
  validate([...idParamRule, ...userStatusRules]),
  updateUserStatus
);
router.get('/reports', getAdminReports);
router.patch(
  '/reports/:id',
  writeLimiter,
  validate([...idParamRule, ...reportReviewRules]),
  reviewReport
);
router.get('/moderation-logs', getModerationLogs);

export default router;
