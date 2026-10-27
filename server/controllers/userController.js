import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { publicUser } from '../utils/serializers.js';

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, status: 'active' });
  if (!user) throw new ApiError(404, 'Seller profile not found.', { code: 'USER_NOT_FOUND' });

  const activeListings = await Listing.countDocuments({
    seller: user._id,
    status: 'approved',
  });

  return res.json({
    success: true,
    data: {
      user: {
        ...publicUser(user),
        activeListings,
        memberSince: user.createdAt,
      },
    },
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'college', 'department', 'year'];
  for (const field of allowed) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }
  await req.user.save();

  return res.json({
    success: true,
    message: 'Profile updated.',
    data: { user: publicUser(req.user, { isSelf: true }) },
  });
});
