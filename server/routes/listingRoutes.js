import { Router } from 'express';
import {
  createListing,
  deleteListing,
  getCategoryCounts,
  getFeaturedListings,
  getListingById,
  getListings,
  getMyListings,
  updateListing,
  updateListingStatus,
} from '../controllers/listingController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { uploadListingImages } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  idParamRule,
  listingBodyRules,
  listingQueryRules,
  listingStatusRules,
} from '../validators/index.js';
import { writeLimiter } from '../middleware/rateLimits.js';

const router = Router();

router.get('/', optionalAuthenticate, validate(listingQueryRules), getListings);
router.get('/featured', optionalAuthenticate, getFeaturedListings);
router.get('/categories', getCategoryCounts);
router.get('/mine', authenticate, getMyListings);

router.post(
  '/',
  authenticate,
  writeLimiter,
  uploadListingImages,
  validate(listingBodyRules()),
  createListing
);

router.get('/:id', optionalAuthenticate, validate(idParamRule), getListingById);

router.patch(
  '/:id',
  authenticate,
  writeLimiter,
  uploadListingImages,
  validate([...idParamRule, ...listingBodyRules({ partial: true })]),
  updateListing
);

router.delete('/:id', authenticate, writeLimiter, validate(idParamRule), deleteListing);
router.patch(
  '/:id/status',
  authenticate,
  writeLimiter,
  validate([...idParamRule, ...listingStatusRules]),
  updateListingStatus
);

export default router;
