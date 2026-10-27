import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Report } from '../models/Report.js';
import { Message } from '../models/Message.js';
import { ModerationLog } from '../models/ModerationLog.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { buildPaginationMeta, escapeRegex, getPagination } from '../utils/pagination.js';
import { publicSeller } from '../utils/serializers.js';
import { LISTING_CATEGORIES } from '../utils/constants.js';

function countMapFromAggregation(rows) {
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}

function adminSeller(seller) {
  if (!seller) return null;
  return {
    ...publicSeller(seller),
    email: seller.email,
  };
}

function adminListing(listing) {
  const source = listing.toObject ? listing.toObject() : listing;
  return {
    ...source,
    seller: source.seller ? adminSeller(source.seller) : null,
  };
}

export const getStats = asyncHandler(async (_req, res) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    totalUsers,
    userStatusRows,
    roleRows,
    totalListings,
    listingStatusRows,
    totalReports,
    reportStatusRows,
    totalMessages,
    categoryRows,
    trendRows,
    recentListings,
    recentReports,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Listing.countDocuments(),
    Listing.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Report.countDocuments(),
    Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Message.countDocuments(),
    Listing.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    Listing.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Listing.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({ path: 'seller', select: 'name email college department year createdAt' })
      .lean(),
    Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'listing', select: 'title status' })
      .populate({ path: 'reportedBy', select: 'name email' })
      .lean(),
    ModerationLog.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({ path: 'admin', select: 'name' })
      .populate({ path: 'listing', select: 'title' })
      .populate({ path: 'targetUser', select: 'name' })
      .lean(),
  ]);

  const listingStatuses = countMapFromAggregation(listingStatusRows);
  const userStatuses = countMapFromAggregation(userStatusRows);
  const roles = countMapFromAggregation(roleRows);
  const reportStatuses = countMapFromAggregation(reportStatusRows);
  const categoryCounts = countMapFromAggregation(categoryRows);
  const trendMap = countMapFromAggregation(trendRows);

  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    return {
      date: key,
      label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      count: trendMap[key] || 0,
    };
  });

  return res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: userStatuses.active || 0,
        suspended: userStatuses.suspended || 0,
        students: roles.student || 0,
        admins: roles.admin || 0,
      },
      listings: {
        total: totalListings,
        pending: listingStatuses.pending || 0,
        approved: listingStatuses.approved || 0,
        rejected: listingStatuses.rejected || 0,
        sold: listingStatuses.sold || 0,
        removed: listingStatuses.removed || 0,
      },
      reports: {
        total: totalReports,
        open: reportStatuses.open || 0,
        resolved: reportStatuses.resolved || 0,
        dismissed: reportStatuses.dismissed || 0,
      },
      messages: { total: totalMessages },
      categories: LISTING_CATEGORIES.map((name) => ({
        name,
        count: categoryCounts[name] || 0,
      })),
      trend,
      recentListings: recentListings.map(adminListing),
      recentReports,
      recentActivity,
    },
  });
});

export const getAdminListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { limit: 15, max: 50 });
  const filter = {};

  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) {
    const regex = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
    filter.$or = [{ title: regex }, { description: regex }, { college: regex }];
  }

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'seller', select: 'name email college department year createdAt' })
      .lean(),
    Listing.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: { listings: listings.map(adminListing) },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

export const moderateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.', { code: 'LISTING_NOT_FOUND' });

  const { action } = req.body;
  const reason = String(req.body.reason || '').trim();

  if (['reject', 'remove'].includes(action) && reason.length < 3) {
    throw new ApiError(422, 'Add a reason so the seller understands the decision.', {
      code: 'REASON_REQUIRED',
      details: [{ field: 'reason', message: 'A reason is required for this action.' }],
    });
  }

  const actionMap = {
    approve: { status: 'approved', log: 'approve_listing' },
    reject: { status: 'rejected', log: 'reject_listing' },
    remove: { status: 'removed', log: 'remove_listing' },
    restore: { status: 'approved', log: 'restore_listing' },
  };
  const selected = actionMap[action];

  listing.status = selected.status;
  listing.rejectionReason = ['reject', 'remove'].includes(action) ? reason : '';
  listing.moderatedBy = req.user._id;
  listing.moderatedAt = new Date();
  if (action === 'restore') listing.soldAt = null;
  await listing.save();

  await ModerationLog.create({
    admin: req.user._id,
    listing: listing._id,
    action: selected.log,
    reason,
  });

  if (action === 'remove') {
    await Report.updateMany(
      { listing: listing._id, status: 'open' },
      {
        $set: {
          status: 'resolved',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          resolutionNote: reason || 'Listing removed by moderation.',
        },
      }
    );
  }

  const populated = await Listing.findById(listing._id)
    .populate({ path: 'seller', select: 'name email college department year createdAt' })
    .lean();

  return res.json({
    success: true,
    message: `Listing ${action === 'restore' ? 'restored' : `${action}d`}.`,
    data: { listing: adminListing(populated) },
  });
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { limit: 15, max: 50 });
  const filter = {};
  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
  if (req.query.role && req.query.role !== 'all') filter.role = req.query.role;
  if (req.query.q) {
    const regex = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { college: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: {
      users: users.map((user) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      })),
    },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot change the status of your own account.', {
      code: 'CANNOT_MODERATE_SELF',
    });
  }

  const user = await User.findById(req.params.id).select('+tokenVersion');
  if (!user) throw new ApiError(404, 'User not found.', { code: 'USER_NOT_FOUND' });
  if (user.role === 'admin') {
    throw new ApiError(403, 'Administrator accounts cannot be suspended from this screen.', {
      code: 'CANNOT_MODERATE_ADMIN',
    });
  }

  const previousStatus = user.status;
  user.status = req.body.status;
  if (user.status === 'suspended') user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save({ validateBeforeSave: false });

  await ModerationLog.create({
    admin: req.user._id,
    targetUser: user._id,
    action: user.status === 'suspended' ? 'suspend_user' : 'reactivate_user',
    reason: req.body.reason || '',
  });

  return res.json({
    success: true,
    message:
      user.status === 'suspended'
        ? 'Account suspended and active sessions revoked.'
        : 'Account reactivated.',
    data: {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        status: user.status,
        previousStatus,
      },
    },
  });
});

export const getAdminReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { limit: 15, max: 50 });
  const filter = {};
  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ status: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'listing', select: 'title status images price seller' })
      .populate({ path: 'reportedBy', select: 'name email college' })
      .populate({ path: 'reviewedBy', select: 'name' })
      .lean(),
    Report.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: { reports },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

export const reviewReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).populate({
    path: 'listing',
    select: 'title status seller',
  });
  if (!report) throw new ApiError(404, 'Report not found.', { code: 'REPORT_NOT_FOUND' });
  if (report.status !== 'open') {
    throw new ApiError(409, 'This report has already been reviewed.', {
      code: 'REPORT_ALREADY_REVIEWED',
    });
  }

  report.status = req.body.status;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  report.resolutionNote = req.body.resolutionNote || '';
  await report.save();

  let removedListing = false;
  if (req.body.removeListing === true && report.listing) {
    const listing = await Listing.findById(report.listing._id);
    if (listing && listing.status !== 'removed') {
      listing.status = 'removed';
      listing.rejectionReason = req.body.resolutionNote || 'Removed following a report.';
      listing.moderatedBy = req.user._id;
      listing.moderatedAt = new Date();
      await listing.save();
      removedListing = true;

      await ModerationLog.create({
        admin: req.user._id,
        listing: listing._id,
        action: 'remove_listing',
        reason: req.body.resolutionNote || 'Listing removed after report review.',
      });
    }
  }

  await ModerationLog.create({
    admin: req.user._id,
    listing: report.listing?._id || null,
    action: req.body.status === 'resolved' ? 'resolve_report' : 'dismiss_report',
    reason: req.body.resolutionNote || '',
  });

  return res.json({
    success: true,
    message: removedListing
      ? 'Report resolved and listing removed.'
      : `Report ${req.body.status}.`,
    data: { report: { id: String(report._id), status: report.status } },
  });
});

export const getModerationLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { limit: 20, max: 50 });
  const [logs, total] = await Promise.all([
    ModerationLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'admin', select: 'name email' })
      .populate({ path: 'listing', select: 'title status' })
      .populate({ path: 'targetUser', select: 'name email status' })
      .lean(),
    ModerationLog.countDocuments(),
  ]);

  return res.json({
    success: true,
    data: { logs },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});
