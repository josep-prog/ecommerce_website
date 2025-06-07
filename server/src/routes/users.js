import express from 'express';
const router = express.Router();

// Example users route
router.get('/', (req, res) => {
  res.send('Users route works!');
});

export default router; 