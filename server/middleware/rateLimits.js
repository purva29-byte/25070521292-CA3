import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const skipTests = () => env.isTest;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: skipTests,
  message: {
    success: false,
    message: 'Too many attempts. Please wait a few minutes and try again.',
    code: 'RATE_LIMITED',
  },
});

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 250,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: skipTests,
  message: {
    success: false,
    message: 'You are moving too quickly. Please slow down and try again.',
    code: 'RATE_LIMITED',
  },
});
