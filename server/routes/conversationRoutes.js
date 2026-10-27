import { Router } from 'express';
import {
  createConversation,
  getConversations,
  getMessages,
  markConversationRead,
  sendMessage,
} from '../controllers/conversationController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { conversationRules, idParamRule, messageRules } from '../validators/index.js';
import { writeLimiter } from '../middleware/rateLimits.js';

const router = Router();

router.use(authenticate);
router.get('/', getConversations);
router.post('/', writeLimiter, validate(conversationRules), createConversation);
router.get('/:id/messages', validate(idParamRule), getMessages);
router.post('/:id/messages', writeLimiter, validate([...idParamRule, ...messageRules]), sendMessage);
router.patch('/:id/read', writeLimiter, validate(idParamRule), markConversationRead);

export default router;
