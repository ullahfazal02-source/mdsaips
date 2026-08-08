/**
 * Role-Based Access Control (RBAC) Middleware Generator
 * 
 * Enforces role authorization rules against req.user.role.
 * Returns 403 Forbidden if user's role is not included in allowed roles.
 * 
 * @param {...string} roles Allowed user roles (e.g. 'admin', 'vendor', 'customer')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication context missing. Please log in.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] roles. Your role is '${req.user.role}'`,
      });
    }

    next();
  };
};

export default authorizeRoles;
