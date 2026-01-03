const mongoose = require("mongoose");
const CompanyComplianceCalendar = require("../../models/Complience/CompanyComplianceCalendar");
const ComplianceMaster = require("../../models/Complience/ComplianceMaster");
const Startup = require("../../models/signup/StartupModel");

// ==================== GENERATE CALENDAR ====================
exports.generateCalendar = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { companyId } = req.params;
    const { financialYear = "2025-2026" } = req.body;

    if (!financialYear.match(/^\d{4}-\d{4}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid financialYear format. Use YYYY-YYYY",
      });
    }

    // Step 1: Check if it's a real company
    let entity = await Company.findById(companyId).session(session);

    // Step 2: If not found, treat as startup ID (main magic here!)
    if (!entity) {
      entity = await Startup.findById(companyId).session(session);
      if (!entity) {
        return res.status(404).json({
          success: false,
          message: "No company or startup found with this ID",
        });
      }
      console.log(`Using Startup ID as Company ID: ${companyId}`);
    } else {
      console.log(`Using Company ID: ${companyId}`);
    }

    // Fetch active masters
    const masters = await ComplianceMaster.find({ active: true }).session(session);

    const entries = [];
    const [fyStart, fyEnd] = financialYear.split("-").map(Number);

    for (const master of masters) {
      const entityType = (entity.entityType || entity.registrationType || "privateLimited").toLowerCase().replace(" ", "");
      if (master.applicableFor && master.applicableFor[entityType] === false) continue;

      let dates = [];

      if (master.frequency === "MONTHLY") {
        for (let m = 4; m <= 15; m++) { // Apr to Mar
          const year = m > 12 ? fyEnd : fyStart;
          const month = m > 12 ? m - 12 : m;
          const dueDay = master.dueConfig?.dueDay || 20;

          let dueDate = new Date(year, month - 1, dueDay);
          if (dueDate.getMonth() + 1 !== month) {
            dueDate = new Date(year, month, 0); // last day
          }

          dates.push({ dueDate, month });
        }
      } else if (master.frequency === "QUARTERLY") {
        const quarters = [
          { month: 7, day: 31 },  // Q1 Jul
          { month: 10, day: 31 }, // Q2 Oct
          { month: 1, day: 31, year: fyEnd },  // Q3 Jan
          { month: 5, day: 31, year: fyEnd },  // Q4 May
        ];
        quarters.forEach(q => {
          const y = q.year || fyStart;
          dates.push({ dueDate: new Date(y, q.month - 1, q.day) });
        });
      } else if (master.frequency === "ANNUAL") {
        const dueMonth = master.dueConfig?.dueMonth || 3; // March
        const dueYear = master.dueConfig?.dueAfterFYEnd ? fyEnd : fyStart;
        const dueDay = master.dueConfig?.dueDay || 31;
        dates.push({ dueDate: new Date(dueYear, dueMonth, dueDay) });
      }
      // Add ONE_TIME, EVENT_BASED later if needed

      dates.forEach(d => {
        entries.push({
          companyId, // same ID (startup or company)
          complianceMasterId: master._id,
          complianceName: master.name,
          complianceType: master.type,
          category: master.category,
          frequency: master.frequency,
          financialYear,
          dueDate: d.dueDate,
          month: d.month || null,
          quarter: d.quarter || null,
          year: d.dueDate.getFullYear(),
          status: "PENDING",
          applicable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    }

    // Delete old calendar for this entity + FY
    await CompanyComplianceCalendar.deleteMany({
      companyId,
      financialYear,
    }).session(session);

    // Insert new entries
    if (entries.length > 0) {
      await CompanyComplianceCalendar.insertMany(entries, { session });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: `Compliance calendar generated for FY ${financialYear}`,
      entityType: entity.entityType || "Startup",
      totalEntries: entries.length,
      monthlyEntries: entries.filter(e => e.frequency === "MONTHLY").length,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ==================== GET MONTHLY ====================
exports.getMonthlyCompliances = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const data = await CompanyComplianceCalendar.find({
      companyId,
      frequency: "MONTHLY",
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL ====================
exports.getAllCompliances = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const data = await CompanyComplianceCalendar.find({ companyId }).sort({ dueDate: 1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== HEALTH SCORE ====================
exports.getHealthScore = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const stats = await CompanyComplianceCalendar.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          compliant: { $sum: { $cond: [{ $eq: ["$status", "COMPLIANT"] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ["$status", "OVERDUE"] }, 1, 0] } },
          dueSoon: { $sum: { $cond: [{ $eq: ["$status", "ACTION_REQUIRED"] }, 1, 0] } },
        },
      },
    ]);

    const result = stats[0] || { total: 0, compliant: 0, overdue: 0, dueSoon: 0 };
    result.healthPercentage = result.total ? Math.round((result.compliant / result.total) * 100) : 0;

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
