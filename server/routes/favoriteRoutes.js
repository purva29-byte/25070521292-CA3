import { Router } from 'express';
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listingIdParamRule } from '../validators/index.js';

const router = Router();

router.use(authenticate);
router.get('/', getFavorites);
router.post('/:listingId', validate(listingIdParamRule), addFavorite);
router.delete('/:listingId', validate(listingIdParamRule), removeFavorite);

export default router;
