const express = require("express");
const multer = require("multer");
const { signup, login } = require("../controller/authController");

const router = express.Router();
const upload = multer(); // Initialize multer without storage for form-data parsing

// Use `upload.none()` for form-data parsing
router.post("/signup", upload.none(), signup);
router.post("/login", upload.none(), login);

module.exports = router;
