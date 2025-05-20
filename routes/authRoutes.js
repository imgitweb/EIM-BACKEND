const express = require("express");
const multer = require("multer");
const { googleLogin, login } = require("../controller/authController");

const router = express.Router();

// Multer setup for parsing form-data
const upload = multer(); // Default storage (used for form-data parsing)

// Routes for authentication
// Use `upload.none()` to handle form-data without files
router.post("/google-login", upload.none(), googleLogin);
router.post("/login", upload.none(), login);

module.exports = router;
