const express = require("express");
const router = express.Router();
const startupController = require("./../controller/startupController");

// Route to get users by industry
router.get(
  "/getStartup/industry/:industry",
  startupController.getUsersByIndustry
);

router.get("/getStartupInfo/:id", startupController.getStartupById);
router.get(
  "/cardexchange/:startupId1/:startupId2",
  startupController.sendStartupExchangeEmail
);

module.exports = router;
