// Comprehensive Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  // Log the error for server-side tracking
  console.error("Error Middleware Caught:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate field value: ${field}. Please use another value`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token has expired",
    });
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB",
    });
  }

  // Multer file type error
  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Database connection errors
  if (err.name === "MongoNetworkError") {
    return res.status(500).json({
      success: false,
      message: "Database connection error. Please try again later.",
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message: err.message || "Unexpected server error occurred",
    // Optional: include error trace in development
    ...(process.env.NODE_ENV === "development" && {
      errorTrace: err.stack,
    }),
  });
};

module.exports = errorHandler;
