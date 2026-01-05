const ComplianceMaster = require("../models/Complience/ComplianceMaster");
const CompanyComplianceCalendar = require("../models/Complience/CompanyComplianceCalendar");
const Startup = require("../models/signup/StartupModel");

const isApplicable = (compliance, company) => {
  const entityType = company.entityType;

  const entityMap = {
    proprietorship: compliance.applicableFor.proprietorship,
    partnership: compliance.applicableFor.partnership,
    llp: compliance.applicableFor.llp,
    opc: compliance.applicableFor.opc,
    "private limited": compliance.applicableFor.privateLimited,
    "public limited": compliance.applicableFor.publicLimited,
  };

  if (!entityMap[entityType]) return false;

  if (compliance.condition.type === "ALWAYS") {
    return true;
  }

  if (compliance.condition.type === "IF_GST_REGISTERED") {
    return company.gstRegistered === true;
  }

  if (compliance.condition.type === "IF_TURNOVER_ABOVE") {
    const threshold = parseFloat(compliance.condition.value);
    return company.annualTurnover >= threshold;
  }

  if (compliance.condition.type === "IF_EMPLOYEES") {
    const threshold = parseInt(compliance.condition.value);
    return (company.employeeCount || 0) >= threshold;
  }

  if (compliance.condition.type === "IF_FOREIGN_INVESTMENT") {
    return company.hasForeignInvestment === true;
  }

  return true;
};

const calculateDueDate = (compliance, month, year) => {
  switch (compliance.frequency) {
    case "MONTHLY":
      // For monthly: due date is on specified day of the month
      const monthlyDueDay = compliance.dueDay || 15;
      const monthlyDueDate = new Date(year, month - 1, monthlyDueDay);
      return monthlyDueDate;

    case "QUARTERLY":
      // Q1: Jan-Mar (due in June), Q2: Apr-Jun (due in Sep), Q3: Jul-Sep (due in Dec), Q4: Oct-Dec (due in Mar)
      const quarterEndMonths = {
        1: 6, // Jan -> June
        2: 6, // Feb -> June
        3: 6, // Mar -> June
        4: 9, // Apr -> Sept
        5: 9, // May -> Sept
        6: 9, // Jun -> Sept
        7: 12, // Jul -> Dec
        8: 12, // Aug -> Dec
        9: 12, // Sep -> Dec
        10: 3, // Oct -> Mar (next year)
        11: 3, // Nov -> Mar (next year)
        12: 3, // Dec -> Mar (next year)
      };

      let quarterDueMonth = quarterEndMonths[month];
      let quarterDueYear = year;

      // If due month is less than current month, it's next year (for Q4)
      if (quarterDueMonth < month) {
        quarterDueYear = year + 1;
      }

      const quarterlyDueDay = compliance.quarterDueDay || 15;
      const quarterlyDueDate = new Date(
        quarterDueYear,
        quarterDueMonth - 1,
        quarterlyDueDay
      );
      return quarterlyDueDate;

    case "ANNUAL":
      // Annual: use dueDayOfMonth (1-12) for month and dueDay for day
      const annualMonth = (compliance.dueDayOfMonth || 10) - 1; // Convert to 0-indexed
      const annualDay = compliance.dueDay || 31;
      const annualDueDate = new Date(year, annualMonth, annualDay);
      return annualDueDate;

    case "HALF_YEARLY":
    case "BIANNUAL":
      // H1: Jan-Jun (due in Sept), H2: Jul-Dec (due in Mar next year)
      const isFirstHalf = month <= 6;
      const biannualDueMonth = isFirstHalf ? 8 : 2; // Sept or Mar
      const biannualDueYear = isFirstHalf ? year : year + 1;
      const biannualDueDay = compliance.dueDay || 15;
      const biannualDueDate = new Date(
        biannualDueYear,
        biannualDueMonth,
        biannualDueDay
      );
      return biannualDueDate;

    case "ONE_TIME":
      // One-time compliances - skip for calendar
      return null;

    case "EVENT_BASED":
      // Event-based - skip for calendar
      return null;

    default:
      return null;
  }
};

const getQuarter = (month) => {
  if (month >= 1 && month <= 3) return "Q4"; // Jan-Mar is Q4 of prev FY
  if (month >= 4 && month <= 6) return "Q1";
  if (month >= 7 && month <= 9) return "Q2";
  if (month >= 10 && month <= 12) return "Q3";
};

const getFinancialYear = (month, year) => {
  // In India, FY is Apr-Mar
  if (month >= 4) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

const calculateDaysUntilDue = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const timeDiff = dueDate - today;
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const determineStatus = (dueDate, completed) => {
  if (completed) return "COMPLIANT";

  const today = new Date();
  const daysUntilDue = calculateDaysUntilDue(dueDate);

  if (daysUntilDue < 0) return "OVERDUE";
  if (daysUntilDue <= 7) return "ACTION_REQUIRED";
  return "PENDING";
};

/**
 * Generate 12-month compliance calendar for a company
 */
const generateComplianceCalendar = async (companyId) => {
  try {
    const company = await Startup.findById(companyId);
    if (!company) {
      throw new Error("Startup not found");
    }

    // Fetch all active compliance masters
    const compliances = await ComplianceMaster.find({ active: true });
    if (compliances.length === 0) {
      throw new Error(
        "No active compliance masters found. Please seed the database."
      );
    }

    // Delete existing calendar entries for this company to avoid duplicates
    await CompanyComplianceCalendar.deleteMany({ companyId });

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();

    const calendarEntries = [];
    const processedDates = new Set(); // To avoid duplicate entries

    // Generate calendar for next 12 months
    for (let i = 0; i < 12; i++) {
      const monthOffset = i;
      let targetMonth = currentMonth + monthOffset;
      let targetYear = currentYear;

      // Handle year rollover
      if (targetMonth > 12) {
        targetMonth = targetMonth - 12;
        targetYear = targetYear + 1;
      }

      const fy = getFinancialYear(targetMonth, targetYear);
      const quarter = getQuarter(targetMonth);

      // Process each compliance master
      for (const compliance of compliances) {
        // Check if this compliance is applicable to the company
        if (!isApplicable(compliance, company)) {
          continue;
        }

        // Calculate due date for this compliance
        const dueDate = calculateDueDate(compliance, targetMonth, targetYear);

        if (!dueDate) {
          // Skip one-time and event-based compliances
          continue;
        }

        // Create a unique key to avoid duplicates
        const dateKey = `${compliance._id}-${dueDate.getTime()}`;

        if (processedDates.has(dateKey)) {
          continue;
        }
        processedDates.add(dateKey);

        const daysUntilDue = calculateDaysUntilDue(dueDate);
        const status = determineStatus(dueDate, false);

        calendarEntries.push({
          companyId,
          complianceMasterId: compliance._id,
          complianceName: compliance.name,
          complianceType: compliance.type,
          category: compliance.category,
          frequency: compliance.frequency,
          financialYear: fy,
          dueDate,
          month: targetMonth,
          quarter,
          year: targetYear,
          status,
          applicable: true,
          applicabilityReason: getApplicabilityReason(compliance, company),
          daysUntilDue,
          remarks: "",
          statusHistory: [
            {
              status: "PENDING",
              changedAt: new Date(),
              remarks: "Created from calendar generation",
            },
          ],
        });
      }
    }

    // Bulk insert all entries
    if (calendarEntries.length > 0) {
      try {
        await CompanyComplianceCalendar.insertMany(calendarEntries, {
          ordered: false,
        });
      } catch (insertError) {
        // If duplicate errors occur, continue (this is expected for existing records)
        if (insertError.code !== 11000) {
          throw insertError;
        }
        console.log("Some duplicate entries were skipped");
      }
    }

    // Fetch the created entries for return
    const createdEntries = await CompanyComplianceCalendar.find({
      companyId,
    })
      .populate(
        "complianceMasterId",
        "name description type category frequency"
      )
      .sort({ dueDate: 1 })
      .lean();

    // Group by month for better visualization
    const groupedByMonth = {};
    createdEntries.forEach((entry) => {
      const monthKey = `${entry.year}-${String(entry.month).padStart(2, "0")}`;
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = [];
      }
      groupedByMonth[monthKey].push(entry);
    });

    return {
      success: true,
      message: `Calendar generated successfully for 12 months`,
      companyId,
      totalEntries: createdEntries.length,
      entriesByMonth: groupedByMonth,
      summary: {
        total: createdEntries.length,
        pending: createdEntries.filter((e) => e.status === "PENDING").length,
        actionRequired: createdEntries.filter(
          (e) => e.status === "ACTION_REQUIRED"
        ).length,
        overdue: createdEntries.filter((e) => e.status === "OVERDUE").length,
        compliant: createdEntries.filter((e) => e.status === "COMPLIANT")
          .length,
      },
    };
  } catch (error) {
    console.error("Calendar generation error:", error);
    throw error;
  }
};

const getComplianceHealthScore = async (companyId) => {
  try {
    const today = new Date();

    const totalCompliances = await CompanyComplianceCalendar.countDocuments({
      companyId,
      applicable: true,
    });

    const compliantCount = await CompanyComplianceCalendar.countDocuments({
      companyId,
      applicable: true,
      status: "COMPLIANT",
    });

    const overdueCount = await CompanyComplianceCalendar.countDocuments({
      companyId,
      applicable: true,
      status: "OVERDUE",
    });

    const actionRequiredCount = await CompanyComplianceCalendar.countDocuments({
      companyId,
      applicable: true,
      status: "ACTION_REQUIRED",
    });

    const pendingCount = await CompanyComplianceCalendar.countDocuments({
      companyId,
      applicable: true,
      status: "PENDING",
    });

    const healthPercentage =
      totalCompliances > 0
        ? Math.round((compliantCount / totalCompliances) * 100)
        : 0;

    let healthStatus = "GREEN";
    if (overdueCount > 0) healthStatus = "RED";
    else if (actionRequiredCount > 0) healthStatus = "AMBER";

    return {
      healthPercentage,
      healthStatus,
      totalCompliances,
      compliantCount,
      actionRequiredCount,
      overdueCount,
      pendingCount,
    };
  } catch (error) {
    console.error("Health score error:", error);
    throw error;
  }
};

const getMonthlyCompliances = async (month, year) => {
  try {
    const compliances = await CompanyComplianceCalendar.find({
      // companyId,
      month,
      year,
    })
      .populate("complianceMasterId", "name category description")
      .sort({ dueDate: 1 });

    console.log("$compliances", compliances);

    const grouped = {
      overdue: compliances.filter((c) => c.status === "OVERDUE"),
      actionRequired: compliances.filter((c) => c.status === "ACTION_REQUIRED"),
      pending: compliances.filter((c) => c.status === "PENDING"),
      compliant: compliances.filter((c) => c.status === "COMPLIANT"),
    };

    return grouped;
  } catch (error) {
    console.error("Monthly compliance error:", error);
    throw error;
  }
};

const getQuarterlyCompliances = async (companyId, quarter, year) => {
  try {
    const quarterMonths = {
      Q1: [4, 5, 6],
      Q2: [7, 8, 9],
      Q3: [10, 11, 12],
      Q4: [1, 2, 3],
    };

    const months = quarterMonths[quarter];
    if (!months) {
      throw new Error("Invalid quarter");
    }

    let query = {
      companyId,
      month: { $in: months },
    };

    // Handle year for Q4 (Jan-Mar is Q4 of previous year)
    if (quarter === "Q4") {
      query.$or = [{ year: year }, { year: year + 1 }];
    } else {
      query.year = year;
    }

    const compliances = await CompanyComplianceCalendar.find(query)
      .populate("complianceMasterId", "name category description")
      .sort({ dueDate: 1 });

    return compliances;
  } catch (error) {
    console.error("Quarterly compliance error:", error);
    throw error;
  }
};

const getAnnualCompliances = async (companyId, year) => {
  try {
    const compliances = await CompanyComplianceCalendar.find({
      companyId,
      year,
    })
      .populate("complianceMasterId", "name category description")
      .sort({ dueDate: 1 });

    return compliances;
  } catch (error) {
    console.error("Annual compliance error:", error);
    throw error;
  }
};

const getAdHocCompliances = async (companyId) => {
  try {
    const compliances = await CompanyComplianceCalendar.find({
      companyId,
      frequency: "EVENT_BASED",
    })
      .populate("complianceMasterId", "name category description")
      .sort({ createdAt: -1 });

    return compliances;
  } catch (error) {
    console.error("Ad-hoc compliance error:", error);
    throw error;
  }
};

const updateComplianceStatus = async (
  calendarId,
  newStatus,
  remarks,
  userId
) => {
  try {
    const calendar = await CompanyComplianceCalendar.findById(calendarId);
    if (!calendar) {
      throw new Error("Compliance record not found");
    }

    const oldStatus = calendar.status;

    calendar.status = newStatus;
    calendar.remarks = remarks || "";
    calendar.updatedAt = new Date();

    calendar.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      changedBy: userId,
      remarks: remarks || "",
    });

    if (newStatus === "COMPLIANT") {
      calendar.completionDate = new Date();
    }

    await calendar.save();

    return {
      success: true,
      message: `Status updated from ${oldStatus} to ${newStatus}`,
      calendar,
    };
  } catch (error) {
    console.error("Status update error:", error);
    throw error;
  }
};

const uploadComplianceDocument = async (
  calendarId,
  documentName,
  fileUrl,
  userId
) => {
  try {
    const calendar = await CompanyComplianceCalendar.findById(calendarId);
    if (!calendar) {
      throw new Error("Compliance record not found");
    }

    calendar.uploadedDocuments.push({
      documentName,
      uploadedAt: new Date(),
      uploadedBy: userId,
      fileUrl,
    });

    calendar.status = "COMPLIANT";
    calendar.completionDate = new Date();

    await calendar.save();

    return {
      success: true,
      message: "Document uploaded successfully",
      calendar,
    };
  } catch (error) {
    console.error("Document upload error:", error);
    throw error;
  }
};

const getApplicabilityReason = (compliance, company) => {
  if (compliance.condition.type === "IF_GST_REGISTERED") {
    return company.gstRegistered ? "GST Registered" : "";
  }
  if (compliance.condition.type === "IF_TURNOVER_ABOVE") {
    return `Turnover > ${compliance.condition.value}`;
  }
  if (compliance.condition.type === "IF_EMPLOYEES") {
    return `Employees >= ${compliance.condition.value}`;
  }
  if (compliance.condition.type === "IF_FOREIGN_INVESTMENT") {
    return company.hasForeignInvestment ? "Foreign Investment Present" : "";
  }
  return company.entityType || "All entities";
};

module.exports = {
  generateComplianceCalendar,
  getComplianceHealthScore,
  getMonthlyCompliances,
  getQuarterlyCompliances,
  getAnnualCompliances,
  getAdHocCompliances,
  updateComplianceStatus,
  uploadComplianceDocument,
  calculateDueDate,
  determineStatus,
};
