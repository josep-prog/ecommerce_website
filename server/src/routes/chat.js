import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getOrCreateSupportChannel } from '../controllers/chatController.js';

const router = express.Router();

router.get('/support-channel', authMiddleware, getOrCreateSupportChannel);

export default router; 