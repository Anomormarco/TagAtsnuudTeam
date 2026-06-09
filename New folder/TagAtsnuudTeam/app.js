const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const { initializeDB } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./Middleware/error.middleware');
const { rateLimitMiddleware, cleanupRateLimit } = require('./Middleware/rateLimit.middleware');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting on auth endpoints (Day 3)
const authRateLimit = rateLimitMiddleware(50, 15 * 60 * 1000); // 50 requests per 15 minutes

// Routes - API v1
const authRoutes = require('./Routhes/AuthRouther');
app.use('/api/v1/auth', authRateLimit, authRoutes);

// Placeholder for API v2 (future use - Day 3)
// const authRoutesV2 = require('./Routhes/AuthRouther.v2');
// app.use('/api/v2/auth', authRoutesV2);

// Placeholder for API v3 (future use)
// const authRoutesV3 = require('./Routhes/AuthRouther.v3');
// app.use('/api/v3/auth', authRoutesV3);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await initializeDB();

    // Start cleanup for rate limiting
    cleanupRateLimit();

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Rate limiting: 50 requests per 15 minutes on auth endpoints`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
