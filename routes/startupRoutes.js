const express = require("express");
const router = express.Router();
const startupController = require("./../controller/startupController");
const { upload } = require("../middleware/multer");

router.get(
  "/getStartup/industry/:industry",
  startupController.getUsersByIndustry
);
router.get("/getStartupInfo/:id", startupController.getStartupById);
router.get(
  "/cardexchange/:startupId1/:startupId2",
  startupController.sendStartupExchangeEmail
);
router.put("/update_startup/:id", 
  upload.single("logo"),
  startupController.updateStartupDetails);
router.post("/validate_startup/:id", startupController.validateStartup);
router.post("/risk_feedback/:id", startupController.analyzeRisks);
router.post("/market_case_studies/:startupId", startupController.generateMarketCaseStudies);
module.exports = router;
