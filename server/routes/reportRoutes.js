import { Router } from 'express';
import { submitReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reportRules } from '../validators/index.js';
import { writeLimiter } from '../middleware/rateLimits.js';

const router = Router();

router.post('/', authenticate, writeLimiter, validate(reportRules), submitReport);

export default router;
