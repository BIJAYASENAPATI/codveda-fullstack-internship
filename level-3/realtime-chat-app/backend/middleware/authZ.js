const authZ = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // authN must run before authZ
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userRole = req.user.role;

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "User role not found",
        });
      }

      // Check whether role is allowed
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission",
        });
      }

      next();
    } catch (error) {
      console.error("AUTHORIZATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};

module.exports = authZ;