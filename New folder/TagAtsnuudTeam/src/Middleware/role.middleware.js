/**
 * Role-Based Access Control (RBAC) Middleware
 * Day 3 - Auth Security
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user role from request (set by authMiddleware)
      const userRole = req.user.role;

      // Check if user role is allowed
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role check failed'
      });
    }
  };
};

module.exports = roleMiddleware;
