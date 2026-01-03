const express = require("express");
const router = express.Router();
const complianceCalendarController = require("../controller/Compliance/complianceCalendarController");

router.post("/:companyId/generate", complianceCalendarController.generateCalendar);

router.get("/:companyId/health-score", complianceCalendarController.getHealthScore);

router.get("/:companyId/all", complianceCalendarController.getAllCompliances);

router.get("/:companyId/monthly", complianceCalendarController.getMonthlyCompliances);

router.get("/:companyId/quarterly", complianceCalendarController.getQuarterlyCompliances);

router.get("/:companyId/annual", complianceCalendarController.getAnnualCompliances);

router.get("/:companyId/ad-hoc", complianceCalendarController.getAdHocCompliances);

router.patch("/:calendarId/status", complianceCalendarController.updateComplianceStatus);

router.post("/:calendarId/upload", complianceCalendarController.uploadDocument);

router.use((err, req, res, next) => {
  console.error("Route error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An error occurred",
  });
});

module.exports = router;