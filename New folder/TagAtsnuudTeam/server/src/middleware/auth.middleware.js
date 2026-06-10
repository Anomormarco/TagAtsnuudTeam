const authService = require("../services/auth.service");
const userRepository = require("../repositories/user.repository");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token not provided",
      });
    }




    const token = authHeader.slice(7);
    const decoded = authService.verifyAccessToken(token);
    const tokenRole = String(decoded.role || "").toUpperCase();

    if (!tokenRole) {
      return res.status(401).json({
        success: false,
        message: "Role not found in token. Please login again.",
      });
    }

    const user = await userRepository.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    if (String(user.role || "").toUpperCase() !== tokenRole) {
      return res.status(401).json({
        success: false,
        message: "Token role is no longer valid. Please login again.",
      });
    }

    req.user = {
      userId: decoded.userId,
      id: decoded.userId,
      role: tokenRole,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;

