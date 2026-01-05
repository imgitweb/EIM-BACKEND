const express = require("express");
const router = express.Router();
const complianceCalendarController = require("../controller/Compliance/complianceCalendarController");
const { validateStartupId } = require("../middleware/startupValidation");

router.post(
  "/:startupId/generate",
  validateStartupId,
  complianceCalendarController.generateCalendar
);

router.get(
  "/:startupId/health-score",
  validateStartupId,
  complianceCalendarController.getHealthScore
);

router.get(
  "/:startupId/all",
  validateStartupId,
  complianceCalendarController.getAllCompliances
);

router.get(
  "/:startupId/monthly",
  validateStartupId,
  complianceCalendarController.getMonthlyCompliances
);

router.get(
  "/:startupId/quarterly",
  validateStartupId,
  complianceCalendarController.getQuarterlyCompliances
);

router.get(
  "/:startupId/annual",
  validateStartupId,
  complianceCalendarController.getAnnualCompliances
);

router.get(
  "/:startupId/ad-hoc",
  validateStartupId,
  complianceCalendarController.getAdHocCompliances
);

router.patch(
  "/:calendarId/status",
  complianceCalendarController.updateComplianceStatus
);

router.post(
  "/:calendarId/upload",
  complianceCalendarController.uploadDocument
);

// ==================== TEST ROUTE (Keep for Testing - Remove in Production) ==================== //
router.get("/compliance-calendar", (req, res) => {
  let fy = req.query.fy || "2025-2026";
  const [startYear, endYear] = fy.split("-").map(Number);

  if (!startYear || !endYear || endYear !== startYear + 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid FY format. Use ?fy=2026-2027"
    });
  }

  const monthlyCompliances = [
    "GSTR-3B",
    "GSTR-1",
    "PF Return",
    "ESI Return",
    "Professional Tax"
  ];

  const complianceDescriptions = {
    "GSTR-3B": "Monthly GST summary return for outward and inward supplies",
    "GSTR-1": "Monthly GST return for outward supplies details",
    "PF Return": "Monthly Provident Fund contribution return",
    "ESI Return": "Monthly Employee State Insurance return",
    "Professional Tax": "Monthly professional tax payment and return"
  };

  const entries = [];

  for (let i = 0; i < 12; i++) {
    const monthIndex = (3 + i) % 12; // April = 3
    const year = monthIndex < 3 ? endYear : startYear;
    const monthNum = monthIndex + 1;

    monthlyCompliances.forEach(name => {
      let dueDay = 20;
      if (name === "GSTR-1") dueDay = 11;
      if (name.includes("PF") || name.includes("ESI")) dueDay = 15;
      if (name === "Professional Tax") dueDay = 30;

      let dueDate = new Date(year, monthIndex, dueDay);
      if (dueDate.getMonth() !== monthIndex) {
        dueDate = new Date(year, monthIndex + 1, 0);
      }

      entries.push({
        complianceName: name,
        description: complianceDescriptions[name], // ✅ added
        dueDate: dueDate.toISOString().split("T")[0],
        month: monthNum,
        year: year,
        frequency: "MONTHLY",
        status: "PENDING",
        financialYear: fy
      });
    });
  }

  res.json({
    success: true,
    message: `Compliance Calendar Generated for FY ${fy}`,
    financialYear: fy,
    totalMonthlyEntries: entries.length,
    proof: "60 entries = 5 monthly compliances × 12 months = FULL YEAR COVERAGE",
    sampleFirst5: entries.slice(0, 5),
    sampleLast5: entries.slice(-5),
    fullData: entries
  });
});

// ==================== ERROR HANDLER ====================
router.use((err, req, res, next) => {
  console.error("Compliance route error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An error occurred in compliance routes"
  });
});

module.exports = router;