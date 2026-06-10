const rbacMiddleware = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());
  const userRole = String(req.user.role || "").toUpperCase();

  if (!normalizedAllowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
    });
  }

  next();
};

module.exports = rbacMiddleware;



