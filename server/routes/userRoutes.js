import { Router } from 'express';
import { getPublicProfile, updateMyProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParamRule, profileRules } from '../validators/index.js';

const router = Router();

router.patch('/me', authenticate, validate(profileRules), updateMyProfile);
router.get('/:id', validate(idParamRule), getPublicProfile);

export default router;
