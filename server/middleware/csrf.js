import crypto from 'node:crypto';
import { ApiError } from '../utils/ApiError.js';
import { AUTH_COOKIE, CSRF_COOKIE, generateCsrfToken, csrfCookieOptions } from '../utils/tokens.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function ensureCsrfCookie(req, res, next) {
  let token = req.cookies?.[CSRF_COOKIE];
  if (!token) {
    token = generateCsrfToken();
    res.cookie(CSRF_COOKIE, token, csrfCookieOptions());
    if (req.cookies) req.cookies[CSRF_COOKIE] = token;
  }
  req.csrfToken = token;
  next();
}

export function csrfProtection(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');

  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length) {
    return next(new ApiError(403, 'Security token missing or expired. Refresh the page and try again.', { code: 'CSRF_INVALID' }));
  }

  const valid = crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
  if (!valid) {
    return next(new ApiError(403, 'Security token is invalid. Refresh the page and try again.', { code: 'CSRF_INVALID' }));
  }

  return next();
}

export function bearerTokenFrom(req) {
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return req.cookies?.[AUTH_COOKIE] || null;
}
