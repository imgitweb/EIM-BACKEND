exports.csrfProtection = (req, res, next) => {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    console.log("=== CSRF PROTECTION ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Session CSRF object:", req.session?.csrf);
    console.log("Request CSRF token:", req.headers["x-csrf-token"]);

    if (!req.session) {
      return res.status(400).json({
        success: false,
        error: "Session not initialized",
      });
    }

    const requestToken = req.headers["x-csrf-token"];

    if (!requestToken) {
      return res.status(403).json({
        success: false,
        error: "CSRF token not provided in request headers",
      });
    }

    // Check CSRF token using same structure as OTP
    if (!req.session.csrf) {
      return res.status(403).json({
        success: false,
        error: "CSRF token not found in session. Please refresh the page.",
      });
    }

    const storedCsrf = req.session.csrf;

    // Check if token has expired
    if (storedCsrf.expires <= Date.now()) {
      req.session.csrf = null;
      return res.status(403).json({
        success: false,
        error: "CSRF token has expired. Please refresh the page.",
      });
    }

    // Validate token
    if (storedCsrf.token !== requestToken) {
      return res.status(403).json({
        success: false,
        error: "Invalid CSRF token. Please refresh the page.",
      });
    }

    console.log("CSRF Protection - Token validation successful");
  }

  next();
};
