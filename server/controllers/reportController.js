import { Report } from '../models/Report.js';
import { Listing } from '../models/Listing.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';

export const submitReport = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.body.listingId);
  if (!listing || !['approved', 'sold'].includes(listing.status)) {
    throw new ApiError(404, 'Listing not found.', { code: 'LISTING_NOT_FOUND' });
  }
  if (String(listing.seller) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot report your own listing.', { code: 'CANNOT_REPORT_SELF' });
  }

  const existing = await Report.findOne({
    listing: listing._id,
    reportedBy: req.user._id,
    status: 'open',
  });
  if (existing) {
    throw new ApiError(409, 'You already have an open report for this listing.', {
      code: 'REPORT_EXISTS',
    });
  }

  const report = await Report.create({
    listing: listing._id,
    reportedBy: req.user._id,
    reason: req.body.reason,
    description: req.body.description || '',
  });

  await Listing.updateOne({ _id: listing._id }, { $inc: { reportCount: 1 } });

  return res.status(201).json({
    success: true,
    message: 'Report submitted. The moderation team will review it.',
    data: { reportId: String(report._id) },
  });
});
