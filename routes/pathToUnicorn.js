const express = require("express");
const {
  getMilestoneByStartupId,
  getMilestones,
} = require("../controller/pathToUnicornController");

const router = express.Router();

// Get milestone by startup_id
router.get("/:startup_id", getMilestoneByStartupId);

// Generate milestones (existing API)
router.post("/generate-milestones", getMilestones);

module.exports = router;
