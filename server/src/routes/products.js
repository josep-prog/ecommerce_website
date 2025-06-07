import express from 'express';
const router = express.Router();

// Example products route
router.get('/', (req, res) => {
  res.send('Products route works!');
});

export default router; 