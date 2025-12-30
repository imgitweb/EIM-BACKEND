const express = require("express");
const router = express.Router();
const { generateLeanCanvas } = require("../controller/businessModelController");

// Post Route
router.post("/generate-lean-canvas", generateLeanCanvas);

module.exports = router; // Ya module.exports = router; (aapke setup ke hisab se)
