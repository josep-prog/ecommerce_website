import express from 'express';
import { register, login, getCurrentUser, generateChatToken } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.get('/chat-token', authMiddleware, generateChatToken);

export default router; 