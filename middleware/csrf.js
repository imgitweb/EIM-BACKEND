// CSRF Protection Middleware
exports.csrfProtection = (req, res, next) => {
  // Only apply CSRF protection to state-changing methods
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    // Check if session exists
    if (!req.session) {
      return res.status(400).json({
        success: false,
        error: "Session not initialized",
      });
    }

    // Get CSRF token from session and request headers
    const sessionToken = req.session.csrfToken;
    const requestToken = req.headers["x-csrf-token"];

    // Validate CSRF token
    if (!sessionToken || !requestToken || sessionToken !== requestToken) {
      return res.status(403).json({
        success: false,
        error: "Invalid CSRF token",
      });
    }

    // Optional: Clear the token after successful validation to prevent replay attacks
    // req.session.csrfToken = null;
  }

  next();
};
