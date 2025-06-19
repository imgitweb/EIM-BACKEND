const express = require("express");
const multer = require("multer");
const {
  googleLogin,
  login,
  googleSignup,
  getPlans,
} = require("../controller/authController");

const router = express.Router();

// Multer setup for parsing form-data
const upload = multer(); // Default storage (used for form-data parsing)

// Use `upload.none()` to handle form-data without files

router.post("/google-login", upload.none(), googleLogin);
router.post("/login", upload.none(), login);
router.get("/plan", getPlans);

module.exports = router;
