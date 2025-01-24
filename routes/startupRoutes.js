const express = require("express");
const router = express.Router();
const startupController = require("./../controller/startupController");

// Route to get users by industry
router.get(
  "/getStartup/industry/:industry",
  startupController.getUsersByIndustry
);

module.exports = router;
