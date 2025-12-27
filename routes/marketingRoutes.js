const express = require("express");
const router = express.Router();
const marketingController = require("../controller/marketingController");

// POST: Generate Plan
router.post("/generate-plan", marketingController.generateMarketingPlan);

// GET: Fetch Latest Plan
router.get("/latest-plan/:userId", marketingController.getLatestPlan);

module.exports = router;
