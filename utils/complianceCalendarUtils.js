const ComplianceCalendar = require("../models/CompanyComplianceCalendar");

exports.getCalendarRange = (incDate, fy) => {
  const start = new Date(incDate);
  start.setDate(start.getDate() + 1);

  const fyEndYear = fy.split("-")[1];
  const end = new Date(`20${fyEndYear}-03-31`);

  return { start, end };
};

exports.addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

exports.addYears = (date, years) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
};

exports.setDay = (date, day) => {
  const d = new Date(date);
  d.setDate(day);
  return d;
};

exports.setMonth = (date, month) => {
  const d = new Date(date);
  d.setMonth(month - 1); 
  return d;
};

exports.generateMonthly = (rule, start, end) => {
  const result = [];
  let cursor = new Date(start);

  while (cursor <= end) {
    const due = exports.setDay(
      exports.addMonths(cursor, 1),
      rule.dueDay
    );

    if (due <= end) {
      result.push({
        complianceName: rule.name,
        complianceType: rule.type,
        category: rule.category,
        frequency: rule.frequency,
        dueDate: due,
        month: due.getMonth() + 1,
        quarter: getQuarter(due),
        year: due.getFullYear(),
      });
    }
    cursor = exports.addMonths(cursor, 1);
  }

  return result;
};

exports.generateQuarterly = (rule, start, end) => {
  const result = [];
  
  const quarterEndMonths = [
    { quarter: "Q1", endMonth: 6 },  
    { quarter: "Q2", endMonth: 9 },  
    { quarter: "Q3", endMonth: 12 }, 
    { quarter: "Q4", endMonth: 3 },  
  ];

  let cursor = new Date(start);

  while (cursor <= end) {
    const currentYear = cursor.getFullYear();
    const currentMonth = cursor.getMonth() + 1;

    let nextQuarter = null;
    for (const q of quarterEndMonths) {
      let dueMonth = q.endMonth;
      let dueYear = currentYear;

      if (dueMonth < currentMonth) {
        dueYear = currentYear + 1;
      }

      const due = new Date(dueYear, dueMonth - 1, rule.quarterDueDay || 31);

      if (due >= cursor && due <= end) {
        result.push({
          complianceName: rule.name,
          complianceType: rule.type,
          category: rule.category,
          frequency: rule.frequency,
          dueDate: due,
          quarter: q.quarter,
          month: dueMonth,
          year: dueYear,
        });
        break;
      }
    }

    cursor = exports.addMonths(cursor, 3);
  }

  return result;
};

exports.generateAnnual = (rule, start, end) => {
  const result = [];
  
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    const due = new Date(
      year,
      (rule.dueDayOfMonth || 1) - 1, 
      rule.dueDay || 31
    );

    if (due >= start && due <= end) {
      result.push({
        complianceName: rule.name,
        complianceType: rule.type,
        category: rule.category,
        frequency: rule.frequency,
        dueDate: due,
        month: due.getMonth() + 1,
        quarter: getQuarter(due),
        year: due.getFullYear(),
      });
    }
  }

  return result;
};

exports.generateOneTime = (rule, incDate) => {
  return [
    {
      complianceName: rule.name,
      complianceType: rule.type,
      category: rule.category,
      frequency: rule.frequency,
      dueDate: new Date(
        new Date(incDate).getTime() +
          (rule.daysFromIncorporation || 0) * 86400000 // Convert days to milliseconds
      ),
    },
  ];
};

exports.generateBiannual = (rule, start, end) => {
  const result = [];
  
  const biannualMonths = [
    { half: "H1", endMonth: 9 },   
    { half: "H2", endMonth: 3 },   
  ];

  let cursor = new Date(start);

  while (cursor <= end) {
    const currentYear = cursor.getFullYear();

    for (const half of biannualMonths) {
      let dueMonth = half.endMonth;
      let dueYear = currentYear;

      if (dueMonth < cursor.getMonth() + 1) {
        dueYear = currentYear + 1;
      }

      const due = new Date(dueYear, dueMonth - 1, rule.dueDay || 31);

      if (due >= start && due <= end) {
        result.push({
          complianceName: rule.name,
          complianceType: rule.type,
          category: rule.category,
          frequency: rule.frequency,
          dueDate: due,
          month: dueMonth,
          year: dueYear,
        });
      }
    }

    cursor = exports.addYears(cursor, 1);
  }

  return result;
};

function getQuarter(date) {
  const month = date.getMonth() + 1; 

  if (month >= 4 && month <= 6) return "Q1";
  if (month >= 7 && month <= 9) return "Q2";
  if (month >= 10 && month <= 12) return "Q3";
  return "Q4";
}

exports.getFinancialYear = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

exports.daysUntilDue = (dueDate) => {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

exports.determineStatus = (dueDate, completed) => {
  if (completed) return "COMPLIANT";

  const daysLeft = exports.daysUntilDue(dueDate);

  if (daysLeft < 0) return "OVERDUE";
  if (daysLeft <= 7) return "ACTION_REQUIRED";
  return "PENDING";
};

exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

exports.generateComplianceByFrequency = (rule, start, end) => {
  switch (rule.frequency) {
    case "MONTHLY":
      return exports.generateMonthly(rule, start, end);
    case "QUARTERLY":
      return exports.generateQuarterly(rule, start, end);
    case "ANNUAL":
      return exports.generateAnnual(rule, start, end);
    case "BIANNUAL":
      return exports.generateBiannual(rule, start, end);
    case "ONE_TIME":
      return exports.generateOneTime(rule, start);
    case "EVENT_BASED":
      return []; 
    default:
      return [];
  }
};

exports.bulkInsertCalendar = async (entries) => {
  try {
    if (entries.length === 0) return { inserted: 0 };

    const result = await ComplianceCalendar.insertMany(entries, {
      ordered: false,
    }).catch((error) => {
      if (error.code === 11000) {
        console.log(`${error.writeErrors.length} duplicate entries skipped`);
      } else {
        throw error;
      }
    });

    return {
      inserted: result ? result.length : 0,
    };
  } catch (error) {
    console.error("Bulk insert error:", error);
    throw error;
  }
};

exports.mapStatusToCalendar = (oldStatus) => {
  const map = {
    compliant: "COMPLIANT",
    "action-required": "ACTION_REQUIRED",
    overdue: "OVERDUE",
    pending: "PENDING",
  };
  return map[oldStatus] || "PENDING";
};

exports.mapStatusFromCalendar = (calendarStatus) => {
  const map = {
    COMPLIANT: "compliant",
    ACTION_REQUIRED: "action-required",
    OVERDUE: "overdue",
    PENDING: "pending",
    IN_PROGRESS: "action-required",
  };
  return map[calendarStatus] || "pending";
};