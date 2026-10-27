import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/ApiError.js';
import { verifyAuthToken } from '../utils/tokens.js';
import { bearerTokenFrom } from './csrf.js';

async function userFromRequest(req) {
  const token = bearerTokenFrom(req);
  if (!token) return null;

  let decoded;
  try {
    decoded = verifyAuthToken(token);
  } catch {
    return null;
  }

  const user = await User.findById(decoded.sub).select('+tokenVersion');
  if (!user) return null;
  if (user.status !== 'active') return null;
  if ((user.tokenVersion || 0) !== (decoded.tv || 0)) return null;
  return user;
}

export const authenticate = asyncHandler(async (req, _res, next) => {
  const user = await userFromRequest(req);
  if (!user) {
    throw new ApiError(401, 'Please sign in to continue.', { code: 'AUTH_REQUIRED' });
  }
  req.user = user;
  next();
});

export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  req.user = await userFromRequest(req);
  next();
});

export function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Administrator access is required.', { code: 'ADMIN_REQUIRED' }));
  }
  return next();
}
