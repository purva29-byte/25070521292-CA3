import { Router } from 'express';
import {
  csrf,
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordRules,
  loginRules,
  registerRules,
  resetPasswordRules,
} from '../validators/index.js';
import { authLimiter } from '../middleware/rateLimits.js';

const router = Router();

router.get('/csrf', csrf);
router.post('/register', authLimiter, validate(registerRules), register);
router.post('/login', authLimiter, validate(loginRules), login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordRules), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordRules), resetPassword);

export default router;
