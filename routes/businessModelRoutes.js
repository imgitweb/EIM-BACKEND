const express = require("express");
const router = express.Router();
const {
  generateLeanCanvas,
  getLatestModels,
} = require("../controller/businessModelController");

// Post Route
router.post("/generate-lean-canvas", generateLeanCanvas);
// GET: Get History (make sure to pass userId in URL)
router.get("/history/:userId", getLatestModels);

module.exports = router; // Ya module.exports = router; (aapke setup ke hisab se)
