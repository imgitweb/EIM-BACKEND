const jwt = require("jsonwebtoken");
const StartupModel = require("../models/signup/StartupModel");

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );

      // Check if user exists
      const user = await StartupModel.findById(decoded.id).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res
          .status(401)
          .json({ success: false, message: "Email not verified" });
      }

      // Set user in request
      req.user = user;
      req.userId = user._id;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

// Admin middleware
exports.admin = async (req, res, next) => {
  try {
    // User should already be set by protect middleware
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this admin route",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Authorization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during admin authorization",
    });
  }
};
