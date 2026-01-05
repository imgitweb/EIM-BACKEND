const mongoose = require("mongoose");
const ComplianceMaster = require("../../models/Complience/ComplianceMaster");
const CompanyComplianceCalendar = require("../../models/Complience/CompanyComplianceCalendar");
const Startup = require("../../models/signup/StartupModel");

const parseFinancialYear = (fyString) => {
  const [startYear, endYear] = fyString.split("-").map(Number);
  const fyStartDate = new Date(startYear, 3, 1); 
  const fyEndDate = new Date(endYear, 2, 31); 
  return { fyStartDate, fyEndDate, startYear, endYear };
};

const calculateDueDate = (master, month, year) => {
  const { frequency, dueConfig } = master;

  switch (frequency) {
    case "MONTHLY": {
      const dueDay = dueConfig?.dueDay || 15;
      const dueDate = new Date(year, month, Math.min(dueDay, 28));
      return dueDate;
    }

    case "QUARTERLY": {
      const quarterDueDay = dueConfig?.quarterDueDay || 30;
      const quarterEndMonths = [5, 8, 11, 2];
      const quarterEndMonth = quarterEndMonths[Math.floor(month / 3)];
      const quarterEndDate = new Date(
        month > 2 ? year : year + 1,
        quarterEndMonth,
        1
      );
      quarterEndDate.setDate(quarterEndDate.getDate() + quarterDueDay);
      return quarterEndDate;
    }

    case "ANNUAL": {
      const dueMonth = dueConfig?.dueMonth || 3;
      const dueDay = dueConfig?.dueDay || 31;
      const dueAfterFYEnd = dueConfig?.dueAfterFYEnd || false;

      if (dueAfterFYEnd) {
        const dueDate = new Date(year + 1, dueMonth, dueDay);
        return dueDate;
      } else {
        const dueDate = new Date(year, dueMonth, dueDay);
        return dueDate;
      }
    }

    case "ONE_TIME":
      return new Date(year, 0, 1);

    case "EVENT_BASED":
      return null;

    default:
      return new Date(year, month, 15);
  }
};

const isApplicable = (master, startup) => {
  if (!master.applicableFor) return true;

  const businessTypeKey = startup.businessType?.toLowerCase().replace(/ /g, "");
  const applicable = master.applicableFor[businessTypeKey];
  return applicable === true;
};

const checkCondition = (master, startup) => {
  const { condition } = master;

  if (!condition) return true;

  switch (condition.type) {
    case "ALWAYS":
      return true;

    case "IF_GST_REGISTERED":
      return startup.gstNumber && startup.gstNumber.trim().length > 0;

    case "IF_EMPLOYEES_ABOVE":
      const minEmployees = parseInt(condition.value) || 0;
      return (startup.employeeCount || 0) >= minEmployees;

    case "IF_TURNOVER_ABOVE":
      const minTurnover = parseFloat(condition.value) || 0;
      return (startup.annualRevenue || 0) >= minTurnover;

    case "CUSTOM":
      return true;

    default:
      return true;
  }
};

const generateCalendarEntries = async (startupId, financialYear) => {
  try {
    if (!startupId || !financialYear) {
      throw new Error("StartupId and financialYear are required");
    }

    const startup = await Startup.findById(startupId);
    if (!startup) {
      throw new Error(`Startup with ID ${startupId} not found`);
    }

    console.log(`\n Generating calendar for ${startup.companyName}...`);

    const { fyStartDate, fyEndDate, startYear, endYear } =
      parseFinancialYear(financialYear);

    console.log(`   FY: ${financialYear}`);
    console.log(`   Business Type: ${startup.businessType}`);
    console.log(`   GST: ${startup.gstNumber ? "Yes" : "No"}`);
    console.log(`   Employees: ${startup.employeeCount || 0}\n`);

    const complianceMasters = await ComplianceMaster.find({ active: true });

    if (complianceMasters.length === 0) {
      throw new Error("No compliance masters found. Please seed the database.");
    }

    console.log(`   Found ${complianceMasters.length} rules\n`);

    const calendarEntries = [];
    const entriesByMonth = {};

    for (const master of complianceMasters) {
      if (!isApplicable(master, startup)) {
        continue;
      }
      if (!checkCondition(master, startup)) {
        continue;
      }
      const frequency = master.frequency;

      switch (frequency) {
        case "MONTHLY": {
          for (let month = 3; month <= 14; month++) {
            const year = month <= 11 ? startYear : endYear;
            const actualMonth = month <= 11 ? month : month - 12;

            const dueDate = calculateDueDate(master, actualMonth, year);

            if (dueDate >= fyStartDate && dueDate <= fyEndDate) {
              const monthKey = dueDate.toISOString().split("T")[0].slice(0, 7);

              calendarEntries.push({
                startupId: new mongoose.Types.ObjectId(startupId),
                complianceMasterId: master._id,
                complianceName: master.name,
                description: master.description,
                type: master.type,
                category: master.category,
                frequency: master.frequency,
                forms: master.forms,
                legislation: master.legislation,
                penalty: master.penalty,
                dueDate,
                status: "Pending",
                submittedDate: null,
                remarks: null,
                documentUrl: null,
                documentName: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              });

              if (!entriesByMonth[monthKey]) {
                entriesByMonth[monthKey] = 0;
              }
              entriesByMonth[monthKey]++;
            }
          }
          break;
        }

        case "QUARTERLY": {
          const quarters = [
            { month: 5, name: "Q1" },
            { month: 8, name: "Q2" },
            { month: 11, name: "Q3" },
            { month: 2, name: "Q4" },
          ];

          quarters.forEach((quarter) => {
            const year = quarter.month <= 2 ? endYear : startYear;
            const dueDate = calculateDueDate(master, quarter.month, year);

            if (dueDate >= fyStartDate && dueDate <= fyEndDate) {
              const monthKey = dueDate.toISOString().split("T")[0].slice(0, 7);

              calendarEntries.push({
                startupId: new mongoose.Types.ObjectId(startupId),
                complianceMasterId: master._id,
                complianceName: master.name,
                description: master.description,
                type: master.type,
                category: master.category,
                frequency: master.frequency,
                forms: master.forms,
                legislation: master.legislation,
                penalty: master.penalty,
                dueDate,
                status: "Pending",
                submittedDate: null,
                remarks: null,
                documentUrl: null,
                documentName: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              });

              if (!entriesByMonth[monthKey]) {
                entriesByMonth[monthKey] = 0;
              }
              entriesByMonth[monthKey]++;
            }
          });
          break;
        }

        case "ANNUAL": {
          const dueDate = calculateDueDate(master, 0, startYear);

          if (dueDate >= fyStartDate && dueDate <= fyEndDate) {
            const monthKey = dueDate.toISOString().split("T")[0].slice(0, 7);

            calendarEntries.push({
              startupId: new mongoose.Types.ObjectId(startupId),
              complianceMasterId: master._id,
              complianceName: master.name,
              description: master.description,
              type: master.type,
              category: master.category,
              frequency: master.frequency,
              forms: master.forms,
              legislation: master.legislation,
              penalty: master.penalty,
              dueDate,
              status: "Pending",
              submittedDate: null,
              remarks: null,
              documentUrl: null,
              documentName: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            if (!entriesByMonth[monthKey]) {
              entriesByMonth[monthKey] = 0;
            }
            entriesByMonth[monthKey]++;
          }
          break;
        }

        case "ONE_TIME": {
          const dueDate = calculateDueDate(master, 0, startYear);

          if (dueDate >= fyStartDate && dueDate <= fyEndDate) {
            const monthKey = dueDate.toISOString().split("T")[0].slice(0, 7);

            calendarEntries.push({
              startupId: new mongoose.Types.ObjectId(startupId),
              complianceMasterId: master._id,
              complianceName: master.name,
              description: master.description,
              type: master.type,
              category: master.category,
              frequency: master.frequency,
              forms: master.forms,
              legislation: master.legislation,
              penalty: master.penalty,
              dueDate,
              status: "Pending",
              submittedDate: null,
              remarks: null,
              documentUrl: null,
              documentName: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            if (!entriesByMonth[monthKey]) {
              entriesByMonth[monthKey] = 0;
            }
            entriesByMonth[monthKey]++;
          }
          break;
        }

        case "EVENT_BASED":
          break;

        default:
          break;
      }
    }

    console.log(`✅ Generated ${calendarEntries.length} entries\n`);

    await CompanyComplianceCalendar.deleteMany({ startupId });

    if (calendarEntries.length > 0) {
      await CompanyComplianceCalendar.insertMany(calendarEntries);
    }

    return {
      totalEntries: calendarEntries.length,
      entriesByMonth,
      entries: calendarEntries,
    };
  } catch (error) {
    console.error("❌ Error generating calendar:", error.message);
    throw error;
  }
};

/**
 * Calculate health score
 */
const calculateHealthScore = async (startupId) => {
  try {
    const entries = await CompanyComplianceCalendar.find({ startupId });

    if (entries.length === 0) {
      return {
        total: 0,
        pending: 0,
        actionRequired: 0,
        overdue: 0,
        compliant: 0,
        healthPercentage: 0,
      };
    }

    const today = new Date();
    let pending = 0;
    let actionRequired = 0;
    let overdue = 0;
    let compliant = 0;

    entries.forEach((entry) => {
      if (entry.status === "Completed") {
        compliant++;
      } else if (entry.dueDate < today) {
        overdue++;
        actionRequired++;
      } else {
        pending++;
      }
    });

    const healthPercentage = Math.round(
      ((compliant + pending) / entries.length) * 100
    );

    return {
      total: entries.length,
      pending,
      actionRequired,
      overdue,
      compliant,
      healthPercentage,
    };
  } catch (error) {
    console.error("Error calculating health score:", error);
    throw error;
  }
};

// ==================== ROUTE HANDLERS ====================

/**
 * POST /:startupId/generate
 * Generate compliance calendar
 */
const generateCalendar = async (req, res) => {
  try {
    const { startupId } = req.params;
    const { financialYear } = req.body;

    if (!startupId) {
      return res.status(400).json({ 
        success: false,
        error: "StartupId is required" 
      });
    }

    if (!financialYear) {
      return res.status(400).json({ 
        success: false,
        error: "Financial year is required (e.g., 2025-2026)" 
      });
    }

    const result = await generateCalendarEntries(startupId, financialYear);
    const healthScore = await calculateHealthScore(startupId);
    const startup = await Startup.findById(startupId);

    return res.status(200).json({
      success: true,
      message: `Calendar generated successfully for FY ${financialYear}`,
      startupId,
      startupName: startup?.companyName,
      businessType: startup?.businessType,
      financialYear,
      totalEntries: result.totalEntries,
      entriesByMonth: result.entriesByMonth,
      summary: healthScore,
    });
  } catch (error) {
    console.error("❌ generateCalendar error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /:startupId/health-score
 * Get health score
 */
const getHealthScore = async (req, res) => {
  try {
    const { startupId } = req.params;

    const healthScore = await calculateHealthScore(startupId);
    const startup = await Startup.findById(startupId);

    return res.status(200).json({
      success: true,
      startupId,
      startupName: startup?.companyName,
      healthScore,
    });
  } catch (error) {
    console.error("❌ getHealthScore error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /:startupId/all
 * Get all compliances
 */
const getAllCompliances = async (req, res) => {
  try {
    const { startupId } = req.params;

    const entries = await CompanyComplianceCalendar.find({ startupId }).sort({
      dueDate: 1,
    });

    const healthScore = await calculateHealthScore(startupId);
    const startup = await Startup.findById(startupId);

    return res.status(200).json({
      success: true,
      startupId,
      startupName: startup?.companyName,
      total: entries.length,
      entries,
      summary: healthScore,
    });
  } catch (error) {
    console.error("❌ getAllCompliances error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /:startupId/monthly
 * Get monthly compliances
 */
const getMonthlyCompliances = async (req, res) => {
  try {
    const { startupId } = req.params;
    const { month, year } = req.query;

    if (!month) {
      return res.status(400).json({ 
        success: false,
        error: "month query param required (e.g., 04 for April)" 
      });
    }

    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, parseInt(month) - 1, 1);
    const endDate = new Date(targetYear, parseInt(month), 1);

    const entries = await CompanyComplianceCalendar.find({
      startupId,
      dueDate: {
        $gte: startDate,
        $lt: endDate,
      },
    }).sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      startupId,
      month: `${targetYear}-${String(month).padStart(2, "0")}`,
      total: entries.length,
      entries,
    });
  } catch (error) {
    console.error("❌ getMonthlyCompliances error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /:startupId/quarterly
 * Get quarterly compliances
 */
const getQuarterlyCompliances = async (req, res) => {
  try {
    const { startupId } = req.params;
    const { quarter, year } = req.query;

    if (!quarter || ![1, 2, 3, 4].includes(parseInt(quarter))) {
      return res.status(400).json({ 
        success: false,
        error: "quarter query param required (1-4)" 
      });
    }

    const targetYear = year || new Date().getFullYear();
    const quarterMonths = {
      1: [0, 3],
      2: [3, 6],
      3: [6, 9],
      4: [9, 12],
    };

    const [startMonth, endMonth] = quarterMonths[parseInt(quarter)];
    const startDate = new Date(targetYear, startMonth, 1);
    const endDate = new Date(targetYear, endMonth, 1);

    const entries = await CompanyComplianceCalendar.find({
      startupId,
      dueDate: {
        $gte: startDate,
        $lt: endDate,
      },
    }).sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      startupId,
      quarter: `Q${quarter}-${targetYear}`,
      total: entries.length,
      entries,
    });
  } catch (error) {
    console.error("❌ getQuarterlyCompliances error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /:startupId/annual
 * Get annual compliances
 */
const getAnnualCompliances = async (req, res) => {
  try {
    const { startupId } = req.params;
    const { year } = req.query;

    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);

    const entries = await CompanyComplianceCalendar.find({
      startupId,
      frequency: "ANNUAL",
      dueDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      startupId,
      year: targetYear,
      total: entries.length,
      entries,
    });
  } catch (error) {
    console.error("❌ getAnnualCompliances error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /:startupId/ad-hoc
 * Get event-based compliances
 */
const getAdHocCompliances = async (req, res) => {
  try {
    const { startupId } = req.params;

    const entries = await CompanyComplianceCalendar.find({
      startupId,
      frequency: "EVENT_BASED",
    }).sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      startupId,
      total: entries.length,
      entries,
    });
  } catch (error) {
    console.error("❌ getAdHocCompliances error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * PATCH /:calendarId/status
 * Update compliance status
 */
const updateComplianceStatus = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const { status, remarks, submittedDate } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: "status is required" 
      });
    }

    const updated = await CompanyComplianceCalendar.findByIdAndUpdate(
      calendarId,
      {
        status,
        remarks,
        submittedDate: submittedDate || new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        success: false,
        error: "Calendar entry not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      entry: updated,
    });
  } catch (error) {
    console.error("❌ updateComplianceStatus error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /:calendarId/upload
 * Upload document for compliance
 */
const uploadDocument = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const { documentUrl, documentName } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ 
        success: false,
        error: "documentUrl is required" 
      });
    }

    const updated = await CompanyComplianceCalendar.findByIdAndUpdate(
      calendarId,
      {
        documentUrl,
        documentName,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        success: false,
        error: "Calendar entry not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      entry: updated,
    });
  } catch (error) {
    console.error("❌ uploadDocument error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  generateCalendar,
  getHealthScore,
  getAllCompliances,
  getMonthlyCompliances,
  getQuarterlyCompliances,
  getAnnualCompliances,
  getAdHocCompliances,
  updateComplianceStatus,
  uploadDocument,
};