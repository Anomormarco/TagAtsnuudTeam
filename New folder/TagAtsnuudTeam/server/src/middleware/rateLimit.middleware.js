let ipKeyGenerator = (ip) => ip;
let rateLimit;

try {
  const expressRateLimit = require("express-rate-limit");
  ipKeyGenerator = expressRateLimit.ipKeyGenerator;
  rateLimit = expressRateLimit.rateLimit;
} catch (error) {
  rateLimit = ({ windowMs, max, keyGenerator, message, skip }) => {
    const hits = new Map();

    return (req, res, next) => {
      if (skip?.(req)) {
        return next();
      }

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

const isLocalRequest = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || "";
  const host = req.hostname || "";

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip === "::ffff:127.0.0.1"
  );
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: isLocalRequest,
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
  skip: isLocalRequest,
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
  skip: isLocalRequest,
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
