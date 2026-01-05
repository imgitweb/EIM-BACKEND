const calendarService = require("../../services/complianceCalendarService");
const Startup = require("../../models/signup/StartupModel");

exports.generateCalendar = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { financialYear = "2025-2026" } = req.body;

    const startup = await Startup.findById(companyId);

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found with this ID. Please check login.",
      });
    }

    console.log(
      `Generating compliance calendar for Startup: ${
        startup.startupName || startup.email
      } (ID: ${companyId})`
    );

    const result = await calendarService.generateComplianceCalendar(
      companyId,
      financialYear
    );

    res.status(200).json({
      success: true,
      message: `Compliance calendar generated successfully for FY ${financialYear}`,
      startupName: startup.startupName || "Unknown Startup",
      startupId: companyId,
      totalEntries: result.length || result.count || 0,
      data: result,
    });
  } catch (error) {
    console.error("Generate calendar error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate calendar",
    });
  }
};

/**
 * Get health score using startup ID
 */
exports.getHealthScore = async (req, res) => {
  try {
    const { companyId } = req.params;

    const startup = await Startup.findById(companyId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const healthScore = await calendarService.getComplianceHealthScore(
      companyId
    );

    res.status(200).json({
      success: true,
      startupName: startup.startupName,
      data: healthScore,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all compliances using startup ID
 */
exports.getAllCompliances = async (req, res) => {
  try {
    const { companyId } = req.params;

    const startup = await Startup.findById(companyId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const compliances = await calendarService.getAllCompliances(companyId);

    res.status(200).json({
      success: true,
      count: compliances.length,
      startupName: startup.startupName,
      data: compliances,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMonthlyCompliances = async (req, res) => {
  try {
    const { companyId } = req.params;

    let { month, year } = req.query;

    const today = new Date();
    month = month ? parseInt(month) : today.getMonth() + 1; // 1-12
    year = year ? parseInt(year) : today.getFullYear();

    const startup = await Startup.findById(companyId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const compliances = await calendarService.getMonthlyCompliances(
      // companyId,
      month,
      year
    );

    console.log("$compliances", compliances);

    res.status(200).json({
      success: true,
      month,
      year,
      count:
        compliances.pending?.length +
          compliances.actionRequired?.length +
          compliances.overdue?.length +
          compliances.compliant?.length || 0,
      data: compliances,
    });
  } catch (error) {
    console.error("Monthly compliance error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getQuarterlyCompliances = async (req, res) => {
  try {
    const { companyId } = req.params;

    let { quarter, year } = req.query;

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // ✅ FIX: auto-detect quarter if not provided
    if (!quarter) {
      if (currentMonth >= 4 && currentMonth <= 6) quarter = "Q1";
      else if (currentMonth >= 7 && currentMonth <= 9) quarter = "Q2";
      else if (currentMonth >= 10 && currentMonth <= 12) quarter = "Q3";
      else quarter = "Q4"; // Jan–Mar
    }

    // ✅ FIX: default year
    year = year ? parseInt(year) : currentYear;

    const startup = await Startup.findById(companyId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const compliances = await calendarService.getQuarterlyCompliances(
      companyId,
      quarter,
      year
    );

    res.status(200).json({
      success: true,
      quarter,
      year,
      count: compliances.length,
      data: compliances,
    });
  } catch (error) {
    console.error("Quarterly compliance error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAnnualCompliances = async (req, res) => {
  try {
    const { companyId } = req.params;

    let { year } = req.query;

    // ✅ FIX: default current year if not provided
    const currentYear = new Date().getFullYear();
    year = year ? parseInt(year) : currentYear;

    const startup = await Startup.findById(companyId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const compliances = await calendarService.getAnnualCompliances(
      companyId,
      year
    );

    res.status(200).json({
      success: true,
      year,
      count: compliances.length,
      data: compliances,
    });
  } catch (error) {
    console.error("Annual compliance error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAdHocCompliances = async (req, res) => {
  try {
    const { companyId } = req.params;

    const startup = await Startup.findById(companyId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const compliances = await calendarService.getAdHocCompliances(companyId);

    res.status(200).json({
      success: true,
      data: compliances,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update status & upload document remain same (no change needed)
 */
exports.updateComplianceStatus = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const { status, remarks } = req.body;
    const userId = req.user?._id;

    const result = await calendarService.updateComplianceStatus(
      calendarId,
      status,
      remarks,
      userId
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.calendar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const { documentName, fileUrl } = req.body;
    const userId = req.user?._id;

    const result = await calendarService.uploadComplianceDocument(
      calendarId,
      documentName,
      fileUrl,
      userId
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.calendar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
