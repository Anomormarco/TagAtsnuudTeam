/**
 * Rate Limiting Middleware
 * Day 3 - Security
 */
const rateLimit = {};

const rateLimitMiddleware = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();

    // Initialize or update request count
    if (!rateLimit[key]) {
      rateLimit[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      next();
    } else if (now < rateLimit[key].resetTime) {
      rateLimit[key].count++;

      // Check if limit exceeded
      if (rateLimit[key].count > maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((rateLimit[key].resetTime - now) / 1000)
        });
      }

      next();
    } else {
      // Reset window
      rateLimit[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      next();
    }
  };
};

/**
 * Cleanup old entries (run periodically)
 */
const cleanupRateLimit = () => {
  setInterval(() => {
    const now = Date.now();
    Object.keys(rateLimit).forEach(key => {
      if (rateLimit[key].resetTime < now) {
        delete rateLimit[key];
      }
    });
  }, 10 * 60 * 1000); // Clean up every 10 minutes
};

module.exports = {
  rateLimitMiddleware,
  cleanupRateLimit
};
