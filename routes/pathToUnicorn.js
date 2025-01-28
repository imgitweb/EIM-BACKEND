const express = require("express");
const router = express.Router();
const pathToUnicornController = require("./../controller/pathToUnicornController");

// Route to get users by industry
router.post("/generate-milestones", pathToUnicornController.getMilestones);

module.exports = router;
