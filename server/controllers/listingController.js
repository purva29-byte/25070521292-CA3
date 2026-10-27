import mongoose from 'mongoose';
import { Listing } from '../models/Listing.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { buildPaginationMeta, escapeRegex, getPagination } from '../utils/pagination.js';
import { publicSeller } from '../utils/serializers.js';
import { CONDITION_LABELS, LISTING_CATEGORIES, LISTING_CONDITIONS } from '../utils/constants.js';
import { deleteStoredImages, removeUploadedFiles, uploadedImageUrls } from '../middleware/upload.js';

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function baseSearchFilter(query) {
  const filter = { status: 'approved' };
  const q = String(query.q || '').trim();

  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: regex }, { description: regex }, { category: regex }];
  }

  const categories = parseList(query.category).filter((item) => LISTING_CATEGORIES.includes(item));
  if (categories.length) filter.category = { $in: categories };

  const conditions = parseList(query.condition).filter((item) => LISTING_CONDITIONS.includes(item));
  if (conditions.length) filter.condition = { $in: conditions };

  if (query.minPrice !== undefined && query.minPrice !== '') filter.price = { ...(filter.price || {}), $gte: Number(query.minPrice) };
  if (query.maxPrice !== undefined && query.maxPrice !== '') filter.price = { ...(filter.price || {}), $lte: Number(query.maxPrice) };
  if (query.seller && mongoose.isValidObjectId(query.seller)) filter.seller = query.seller;
  if (query.college) filter.college = new RegExp(escapeRegex(String(query.college)), 'i');

  return { filter, q };
}

function sellerPopulate() {
  return { path: 'seller', select: 'name college department year createdAt role' };
}

function publicListing(listing, viewerId) {
  const source = listing.toObject ? listing.toObject() : listing;
  const seller = source.seller && source.seller._id ? publicSeller(source.seller) : null;
  return {
    ...source,
    seller,
    isOwner: Boolean(viewerId && seller && String(seller.id) === String(viewerId)),
  };
}

export const getListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { filter, q } = baseSearchFilter(req.query);
  const sort = req.query.sort || 'newest';

  let query = Listing.find(filter);
  let total;

  if (sort === 'relevance' && q) {
    const textFilter = {
      ...filter,
      $or: undefined,
      $text: { $search: q },
    };
    total = await Listing.countDocuments(textFilter);
    query = Listing.find(textFilter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' }, createdAt: -1 });
  } else {
    total = await Listing.countDocuments(filter);
    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1, createdAt: -1 },
      price_desc: { price: -1, createdAt: -1 },
    };
    query = query.sort(sortMap[sort] || sortMap.newest);
  }

  const listings = await query.populate(sellerPopulate()).skip(skip).limit(limit).lean();

  return res.json({
    success: true,
    data: {
      listings: listings.map((listing) => publicListing(listing, req.user?._id)),
    },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

export const getFeaturedListings = asyncHandler(async (req, res) => {
  const limit = Math.min(8, Math.max(1, Number(req.query.limit) || 3));
  const listings = await Listing.find({ status: 'approved' })
    .sort({ views: -1, createdAt: -1 })
    .limit(limit)
    .populate(sellerPopulate())
    .lean();

  return res.json({
    success: true,
    data: { listings: listings.map((listing) => publicListing(listing, req.user?._id)) },
  });
});

export const getCategoryCounts = asyncHandler(async (_req, res) => {
  const counts = await Listing.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [item._id, item.count]));

  return res.json({
    success: true,
    data: {
      categories: LISTING_CATEGORIES.map((category) => ({
        name: category,
        count: countMap.get(category) || 0,
      })),
    },
  });
});

export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 }).lean();
  const counts = listings.reduce(
    (acc, listing) => {
      acc.total += 1;
      if (listing.status === 'approved') acc.active += 1;
      if (listing.status === 'pending') acc.pending += 1;
      if (listing.status === 'sold') acc.sold += 1;
      if (listing.status === 'rejected') acc.rejected += 1;
      if (listing.status === 'removed') acc.removed += 1;
      return acc;
    },
    { total: 0, active: 0, pending: 0, sold: 0, rejected: 0, removed: 0 }
  );

  return res.json({
    success: true,
    data: { listings, counts },
  });
});

export const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(sellerPopulate());
  if (!listing) throw new ApiError(404, 'Listing not found.', { code: 'LISTING_NOT_FOUND' });

  const isOwner = req.user && String(listing.seller?._id) === String(req.user._id);
  const isAdmin = req.user?.role === 'admin';
  const publiclyVisible = ['approved', 'sold'].includes(listing.status);

  if (!publiclyVisible && !isOwner && !isAdmin) {
    throw new ApiError(404, 'Listing not found.', { code: 'LISTING_NOT_FOUND' });
  }

  if (listing.status === 'approved' && !isOwner) {
    await Listing.updateOne({ _id: listing._id }, { $inc: { views: 1 } });
    listing.views += 1;
  }

  return res.json({
    success: true,
    data: {
      listing: publicListing(listing, req.user?._id),
      conditionLabel: CONDITION_LABELS[listing.condition],
    },
  });
});

export const createListing = asyncHandler(async (req, res) => {
  const newImages = uploadedImageUrls(req.files);
  if (newImages.length === 0) {
    throw new ApiError(422, 'Add at least one photo of the item.', {
      code: 'IMAGE_REQUIRED',
      details: [{ field: 'images', message: 'At least one image is required.' }],
    });
  }

  const listing = await Listing.create({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    condition: req.body.condition,
    images: newImages,
    seller: req.user._id,
    college: req.body.college || req.user.college,
    pickupLocation: req.body.pickupLocation || '',
    isNegotiable: req.body.isNegotiable === true || req.body.isNegotiable === 'true',
    status: 'pending',
  });

  const populated = await Listing.findById(listing._id).populate(sellerPopulate()).lean();

  return res.status(201).json({
    success: true,
    message: 'Listing submitted. An administrator will review it before it appears in the marketplace.',
    data: { listing: publicListing(populated, req.user._id) },
  });
});

export const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.', { code: 'LISTING_NOT_FOUND' });
  if (String(listing.seller) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only edit your own listings.', { code: 'NOT_OWNER' });
  }

  if (listing.status === 'sold') {
    throw new ApiError(409, 'Sold listings cannot be edited. Relist the item first.', {
      code: 'LISTING_SOLD',
    });
  }
  if (listing.status === 'removed') {
    throw new ApiError(409, 'This listing was removed by an administrator and cannot be edited.', {
      code: 'LISTING_REMOVED',
    });
  }

  const significantFields = ['title', 'description', 'price', 'category', 'condition'];
  const updates = {};
  let hasSignificantChange = false;

  for (const field of significantFields) {
    if (req.body[field] !== undefined && String(req.body[field]) !== String(listing[field])) {
      updates[field] = req.body[field];
      hasSignificantChange = true;
    }
  }

  if (req.body.pickupLocation !== undefined) updates.pickupLocation = req.body.pickupLocation;
  if (req.body.isNegotiable !== undefined) {
    updates.isNegotiable = req.body.isNegotiable === true || req.body.isNegotiable === 'true';
  }
  if (req.body.college !== undefined) updates.college = req.body.college;

  let keptImages = listing.images;
  if (req.body.keptImages !== undefined) {
    try {
      const parsed = typeof req.body.keptImages === 'string' ? JSON.parse(req.body.keptImages) : req.body.keptImages;
      keptImages = Array.isArray(parsed) ? parsed.filter((image) => listing.images.includes(image)) : listing.images;
    } catch {
      removeUploadedFiles(req.files);
      throw new ApiError(422, 'Existing image selection is invalid.', { code: 'INVALID_IMAGES' });
    }
  }

  const newImages = uploadedImageUrls(req.files);
  const finalImages = [...keptImages, ...newImages];

  if (finalImages.length === 0) {
    removeUploadedFiles(req.files);
    throw new ApiError(422, 'Keep or add at least one photo.', {
      code: 'IMAGE_REQUIRED',
      details: [{ field: 'images', message: 'At least one image is required.' }],
    });
  }
  if (finalImages.length > 6) {
    removeUploadedFiles(req.files);
    throw new ApiError(422, 'A listing can have at most 6 images.', {
      code: 'TOO_MANY_IMAGES',
    });
  }

  if (newImages.length || keptImages.length !== listing.images.length) hasSignificantChange = true;
  updates.images = finalImages;

  if (hasSignificantChange) {
    updates.status = 'pending';
    updates.rejectionReason = '';
    updates.moderatedBy = null;
    updates.moderatedAt = null;
  }

  const removedImages = listing.images.filter((image) => !keptImages.includes(image));
  Object.assign(listing, updates);
  await listing.save();
  deleteStoredImages(removedImages);

  const populated = await Listing.findById(listing._id).populate(sellerPopulate()).lean();

  return res.json({
    success: true,
    message: hasSignificantChange
      ? 'Listing updated and sent for moderation.'
      : 'Listing updated.',
    data: { listing: publicListing(populated, req.user._id) },
  });
});

export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.', { code: 'LISTING_NOT_FOUND' });
  if (String(listing.seller) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only delete your own listings.', { code: 'NOT_OWNER' });
  }

  const conversations = await Conversation.find({ listing: listing._id }).select('_id');
  const conversationIds = conversations.map((conversation) => conversation._id);

  await Promise.all([
    Message.deleteMany({ conversation: { $in: conversationIds } }),
    Conversation.deleteMany({ listing: listing._id }),
    Report.deleteMany({ listing: listing._id }),
    User.updateMany({ favorites: listing._id }, { $pull: { favorites: listing._id } }),
    Listing.deleteOne({ _id: listing._id }),
  ]);

  deleteStoredImages(listing.images);

  return res.json({ success: true, message: 'Listing deleted.' });
});

export const updateListingStatus = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.', { code: 'LISTING_NOT_FOUND' });
  if (String(listing.seller) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only update your own listings.', { code: 'NOT_OWNER' });
  }

  if (req.body.status === 'sold') {
    if (listing.status !== 'approved') {
      throw new ApiError(409, 'Only an approved listing can be marked as sold.', {
        code: 'INVALID_STATUS_TRANSITION',
      });
    }
    listing.status = 'sold';
    listing.soldAt = new Date();
  } else if (req.body.status === 'pending') {
    if (listing.status !== 'sold') {
      throw new ApiError(409, 'Only a sold listing can be relisted.', {
        code: 'INVALID_STATUS_TRANSITION',
      });
    }
    listing.status = 'pending';
    listing.soldAt = null;
    listing.rejectionReason = '';
    listing.moderatedBy = null;
    listing.moderatedAt = null;
  }

  await listing.save();
  const populated = await Listing.findById(listing._id).populate(sellerPopulate()).lean();

  return res.json({
    success: true,
    message:
      listing.status === 'sold'
        ? 'Listing marked as sold.'
        : 'Listing submitted for moderation so it can be relisted.',
    data: { listing: publicListing(populated, req.user._id) },
  });
});
