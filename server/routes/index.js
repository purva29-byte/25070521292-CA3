import { Router } from 'express';
import authRoutes from './authRoutes.js';
import listingRoutes from './listingRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import reportRoutes from './reportRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'unimarket-api' } });
});

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/conversations', conversationRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
