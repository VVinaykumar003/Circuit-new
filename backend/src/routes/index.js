const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');

// Public Routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Circuit Backend' });
});

// --- PROTECTED ROUTES ---
// Example: Get Current User Profile
router.get('/api/me', auth, (req, res) => {
  res.json({
    user: req.user,
    organizationId: req.user.organization
  });
});

module.exports = router;