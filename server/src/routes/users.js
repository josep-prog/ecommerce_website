import express from 'express';
import { getAllClients } from '../controllers/usersController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Example users route
router.get('/', (req, res) => {
  res.send('Users route works!');
});

// Route to get all non-admin clients
router.get('/clients', authMiddleware, getAllClients);

export default router; 