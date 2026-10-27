import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { publicSeller } from '../utils/serializers.js';

function serializeFavorite(listing) {
  const source = listing.toObject ? listing.toObject() : listing;
  return {
    ...source,
    seller: source.seller?._id ? publicSeller(source.seller) : null,
  };
}

async function loadFavorites(userId) {
  const user = await User.findById(userId)
    .populate({
      path: 'favorites',
      match: { status: { $in: ['approved', 'sold'] } },
      populate: { path: 'seller', select: 'name college department year createdAt' },
    })
    .lean();

  if (!user) throw new ApiError(404, 'User not found.', { code: 'USER_NOT_FOUND' });

  const visible = (user.favorites || []).filter(Boolean).filter((listing) => listing.seller);
  return {
    listings: visible.map(serializeFavorite),
    favoriteIds: visible.map((listing) => String(listing._id)),
  };
}

export const getFavorites = asyncHandler(async (req, res) => {
  const data = await loadFavorites(req.user._id);
  return res.json({ success: true, data });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const listing = await Listing.findOne({
    _id: req.params.listingId,
    status: { $in: ['approved', 'sold'] },
  });
  if (!listing) throw new ApiError(404, 'Listing not found.', { code: 'LISTING_NOT_FOUND' });

  await User.updateOne({ _id: req.user._id }, { $addToSet: { favorites: listing._id } });
  const data = await loadFavorites(req.user._id);

  return res.json({
    success: true,
    message: 'Saved to favourites.',
    data,
  });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { favorites: req.params.listingId } });
  const data = await loadFavorites(req.user._id);

  return res.json({
    success: true,
    message: 'Removed from favourites.',
    data,
  });
});
