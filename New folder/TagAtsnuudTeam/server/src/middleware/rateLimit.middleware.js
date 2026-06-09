let ipKeyGenerator = (ip) => ip;
let rateLimit;

try {
  const expressRateLimit = require("express-rate-limit");
  ipKeyGenerator = expressRateLimit.ipKeyGenerator;
  rateLimit = expressRateLimit.rateLimit;
} catch (error) {
  rateLimit = ({ windowMs, max, keyGenerator, message }) => {
    const hits = new Map();

    return (req, res, next) => {
      const key = keyGenerator ? keyGenerator(req) : req.ip;
      const now = Date.now();
      const current = hits.get(key);

      if (!current || now > current.resetAt) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return next();
      }

      current.count += 1;

      if (current.count > max) {
        return res.status(429).json(message);
      }

      return next();
    };
  };
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Хэт олон хүсэлт илгээлээ. 15 минутын дараа дахин оролдоно уу.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Нэвтрэх оролдлого хэт олон болсон. 15 минутын дараа оролдоно уу.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers["x-api-key"] || ipKeyGenerator(req.ip),
  message: {
    status: 429,
    error: "API хязгаарт хүрлээ. 1 минутын дараа дахин оролдоно уу.",
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
};
