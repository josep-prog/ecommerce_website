import express from 'express';
const router = express.Router();

// Example orders route
router.get('/', (req, res) => {
  res.send('Orders route works!');
});

export default router; 