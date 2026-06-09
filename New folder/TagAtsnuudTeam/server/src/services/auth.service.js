const crypto = require("node:crypto");
const userRepository = require("../repositories/user.repository");
const ApiError = require("../utils/apiError");

let jwt = null;

try {
  jwt = require("jsonwebtoken");
} catch (error) {
  jwt = null;
}

const parseExpirySeconds = (value, fallbackSeconds) => {
  if (!value) {
    return fallbackSeconds;
  }

  const match = String(value).match(/^(\d+)([smhd])?$/);
  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2] || "s";
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };

  return amount * multipliers[unit];
};

const base64Url = (value) => Buffer.from(value).toString("base64url");

const signFallbackToken = (payload, secret, expiresIn) => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + parseExpirySeconds(expiresIn, 3600),
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(body))}`;
  const signature = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");

  return `${unsigned}.${signature}`;
};

const verifyFallbackToken = (token, secret) => {
  const [header, payload, signature] = String(token).split(".");
  if (!header || !payload || !signature) {
    throw new Error("Malformed token");
  }

  const unsigned = `${header}.${payload}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    throw new Error("Invalid signature");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return decoded;
};

class AuthService {
  generateAccessToken(userId) {
    const payload = { userId, type: "access" };
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const expiresIn = process.env.JWT_EXPIRY || "1h";

    return jwt ? jwt.sign(payload, secret, { expiresIn }) : signFallbackToken(payload, secret, expiresIn);
  }

  generateRefreshToken(userId) {
    const payload = { userId, type: "refresh" };
    const secret = process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key";
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRY || "7d";

    return jwt ? jwt.sign(payload, secret, { expiresIn }) : signFallbackToken(payload, secret, expiresIn);
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt
        ? jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
        : verifyFallbackToken(token, process.env.JWT_SECRET || "your-secret-key");

      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      throw new ApiError(401, "Invalid or expired access token");
    }
  }

  verifyRefreshToken(token) {
    try {
      const decoded = jwt
        ? jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key")
        : verifyFallbackToken(token, process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key");

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  }

  generateTokenPair(userId) {
    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  validateEmail(email) {
    return /.+@.+\..+/.test(email);
  }

  validatePassword(password) {
    if (!password || password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }
    return true;
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }
}

module.exports = new AuthService();
