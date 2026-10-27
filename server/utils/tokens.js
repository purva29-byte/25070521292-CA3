import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'unimarket_token';
export const CSRF_COOKIE = 'unimarket_csrf';

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      tv: user.tokenVersion || 0,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn, issuer: 'unimarket-api', audience: 'unimarket-web' }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret, {
    issuer: 'unimarket-api',
    audience: 'unimarket-web',
  });
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function csrfCookieOptions() {
  return {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: env.cookieSameSite,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
}

export function clearAuthCookie(res) {
  const { maxAge, ...options } = authCookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
}
