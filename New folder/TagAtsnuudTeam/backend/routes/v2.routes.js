const express = require('express');

const router = express.Router();

// Ирээдүйн breaking change-д зориулсан placeholder route.
router.use((req, res) => {
  res.status(501).json({
    success: false,
    message: 'API v2 is reserved for future breaking changes. Use /api/v1 for the current stable API.',
    version: 'v2',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
