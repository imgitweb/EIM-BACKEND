require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const ComplianceMaster = require("../models/Complience/ComplianceMaster"); 

const complianceData = [
  {
    name: "Certificate of Incorporation",
    description: "Certificate issued by ROC upon company incorporation",
    type: "CORPORATE",
    category: "ROC_FILING",
    frequency: "ONE_TIME",
    applicableFor: {
      proprietorship: false,
      partnership: false,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "ALWAYS" },
    forms: ["COI"],
    legislation: "Companies Act 2013",
    penalty: { amount: 0, description: "" },
    active: true,
  },

  // ==================== CORPORATE - ANNUAL ====================
  {
    name: "Annual Return (MGT-7 / MGT-7A)",
    description: "Annual Return filing with ROC",
    type: "CORPORATE",
    category: "ROC_FILING",
    frequency: "ANNUAL",
    dueConfig: {
      dueMonth: 11,
      dueDay: 30,
      dueAfterFYEnd: true,
    },
    applicableFor: {
      proprietorship: false,
      partnership: false,
      llp: false,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "ALWAYS" },
    forms: ["MGT-7", "MGT-7A"],
    legislation: "Companies Act 2013",
    penalty: { amount: 100, description: "₹100 per day late fee" },
    active: true,
  },

  {
    name: "Financial Statements (AOC-4)",
    description: "Filing of Financial Statements with ROC",
    type: "CORPORATE",
    category: "ROC_FILING",
    frequency: "ANNUAL",
    dueConfig: {
      dueMonth: 10,
      dueDay: 30,
      dueAfterFYEnd: true,
    },
    applicableFor: {
      proprietorship: false,
      partnership: false,
      llp: false,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "ALWAYS" },
    forms: ["AOC-4", "AOC-4 XBRL"],
    legislation: "Companies Act 2013",
    penalty: { amount: 100, description: "₹100 per day late fee" },
    active: true,
  },

  {
    name: "DIR-3 KYC / WEB KYC",
    description: "Annual Director KYC filing",
    type: "CORPORATE",
    category: "ROC_FILING",
    frequency: "ANNUAL",
    dueConfig: {
      dueMonth: 9,
      dueDay: 30,
    },
    applicableFor: {
      proprietorship: false,
      partnership: false,
      llp: false,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "ALWAYS" },
    forms: ["DIR-3 KYC"],
    legislation: "Companies Act 2013",
    penalty: { amount: 5000, description: "₹5000 one-time penalty if not filed" },
    active: true,
  },

  // ==================== BOARD MEETINGS ====================
  {
    name: "Board Meeting",
    description: "Quarterly board meeting with minutes",
    type: "CORPORATE",
    category: "BOARD_MEETING",
    frequency: "QUARTERLY",
    dueConfig: {
      quarterDueDay: 30,
    },
    applicableFor: {
      proprietorship: false,
      partnership: false,
      llp: false,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "ALWAYS" },
    legislation: "Companies Act 2013 - Section 173",
    penalty: { amount: 25000, description: "Fine up to ₹25,000" },
    active: true,
  },

  // ==================== TAXATION ====================
  {
    name: "Income Tax Return (ITR)",
    description: "Annual Income Tax Return filing",
    type: "TAXATION",
    category: "INCOME_TAX",
    frequency: "ANNUAL",
    dueConfig: {
      dueMonth: 7,
      dueDay: 31,
    },
    applicableFor: {
      proprietorship: true,
      partnership: true,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "ALWAYS" },
    forms: ["ITR-1 to ITR-7"],
    legislation: "Income Tax Act 1961",
    penalty: { amount: 5000, description: "₹5,000 late fee (₹1,000 if income <5L)" },
    active: true,
  },

  {
    name: "TDS Return (24Q/26Q/27Q)",
    description: "Quarterly TDS Return filing",
    type: "TAXATION",
    category: "TDS_RETURN",
    frequency: "QUARTERLY",
    dueConfig: {
      quarterDueDay: 31,
    },
    applicableFor: {
      proprietorship: true,
      partnership: true,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "CUSTOM", value: "If TDS deducted during quarter" },
    forms: ["24Q", "26Q", "27Q"],
    legislation: "Income Tax Act 1961",
    penalty: { amount: 200, description: "₹200 per day late fee" },
    active: true,
  },

  {
    name: "Advance Tax Payment",
    description: "Quarterly advance tax installments",
    type: "TAXATION",
    category: "INCOME_TAX",
    frequency: "QUARTERLY",
    dueConfig: {
      quarterDueDay: 15,
    },
    applicableFor: {
      proprietorship: true,
      partnership: true,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "IF_TURNOVER_ABOVE", value: "1.5 Cr (for non-business)" },
    legislation: "Income Tax Act 1961",
    penalty: { amount: 0, description: "Interest u/s 234B & 234C" },
    active: true,
  },

  // ==================== GST ====================
  {
    name: "GSTR-1 (Outward Supplies)",
    description: "Monthly/Quarterly return for outward supplies",
    type: "GST",
    category: "GST_RETURN",
    frequency: "MONTHLY",
    dueConfig: { dueDay: 11 },
    applicableFor: {
      proprietorship: true,
      partnership: true,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "IF_GST_REGISTERED" },
    forms: ["GSTR-1"],
    legislation: "CGST Act 2017",
    penalty: { amount: 50, description: "₹50 per day late fee" },
    active: true,
  },

  {
    name: "GSTR-3B (Summary Return)",
    description: "Monthly summary of sales, ITC and tax liability",
    type: "GST",
    category: "GST_RETURN",
    frequency: "MONTHLY",
    dueConfig: { dueDay: 20 },
    applicableFor: {
      proprietorship: true,
      partnership: true,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "IF_GST_REGISTERED" },
    forms: ["GSTR-3B"],
    legislation: "CGST Act 2017",
    penalty: { amount: 50, description: "₹50 per day late fee" },
    active: true,
  },

  {
    name: "GSTR-9 (Annual Return)",
    description: "Annual GST reconciliation return",
    type: "GST",
    category: "GST_RETURN",
    frequency: "ANNUAL",
    dueConfig: {
      dueMonth: 12,
      dueDay: 31,
    },
    applicableFor: {
      proprietorship: true,
      partnership: true,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "IF_GST_REGISTERED" },
    forms: ["GSTR-9", "GSTR-9C (if turnover >5 Cr)"],
    legislation: "CGST Act 2017",
    penalty: { amount: 200, description: "₹200 per day (max 0.5% of turnover)" },
    active: true,
  },

  // ==================== LABOUR LAWS ====================
  {
    name: "PF (Provident Fund) Return & Payment",
    description: "Monthly ECR filing and PF contribution",
    type: "LABOUR",
    category: "PF_ESI",
    frequency: "MONTHLY",
    dueConfig: { dueDay: 15 },
    applicableFor: {
      proprietorship: true,
      partnership: true,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "IF_EMPLOYEES_ABOVE", value: "20" },
    legislation: "EPF Act 1952",
    penalty: { amount: 0, description: "Interest + Damages" },
    active: true,
  },

  {
    name: "ESI Return & Payment",
    description: "Monthly ESI contribution and return",
    type: "LABOUR",
    category: "PF_ESI",
    frequency: "MONTHLY",
    dueConfig: { dueDay: 15 },
    applicableFor: {
      proprietorship: true,
      partnership: true,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "IF_EMPLOYEES_ABOVE", value: "10" },
    legislation: "ESI Act 1948",
    penalty: { amount: 0, description: "Interest @12% p.a." },
    active: true,
  },

  {
    name: "Professional Tax Return",
    description: "Monthly/Annual state professional tax",
    type: "LABOUR",
    category: "PROFESSIONAL_TAX",
    frequency: "MONTHLY",
    dueConfig: { dueDay: 30 },
    applicableFor: {
      proprietorship: true,
      partnership: true,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "CUSTOM", value: "As per state laws" },
    legislation: "State Professional Tax Acts",
    penalty: { amount: 0, description: "Varies by state" },
    active: true,
  },

  // ==================== EVENT-BASED ====================
  {
    name: "Change in Directors",
    description: "Filing on appointment/resignation of director",
    type: "CORPORATE",
    category: "ROC_FILING",
    frequency: "EVENT_BASED",
    applicableFor: {
      proprietorship: false,
      partnership: false,
      llp: false,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "ALWAYS" },
    forms: ["DIR-12"],
    legislation: "Companies Act 2013",
    penalty: { amount: 50000, description: "Penalty if not filed within 30 days" },
    active: true,
  },

  {
    name: "Change of Registered Office",
    description: "Filing for change in registered address",
    type: "CORPORATE",
    category: "ROC_FILING",
    frequency: "EVENT_BASED",
    applicableFor: {
      proprietorship: false,
      partnership: false,
      llp: true,
      opc: true,
      privateLimited: true,
      publicLimited: true,
    },
    condition: { type: "ALWAYS" },
    forms: ["INC-22"],
    legislation: "Companies Act 2013",
    penalty: { amount: 0, description: "Penalty if not filed" },
    active: true,
  },
];

const seedComplianceMaster = async () => {
  try {
    console.log("\n🚀 Starting Compliance Master Seeding...\n");
    console.log(`📍 Loading .env from: ${require("path").resolve(__dirname, "../.env")}`);

    if (mongoose.connection.readyState === 0) {
      console.log("📡 Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected for seeding");
    } else {
      console.log("✅ Using existing MongoDB connection");
    }

    // Clear old data
    console.log("\n🗑️ Clearing old data...");
    const deleted = await ComplianceMaster.deleteMany({});
    console.log(`✅ Deleted ${deleted.deletedCount} old compliance masters`);

    // Insert new data
    console.log("\n📝 Inserting new compliance masters...");
    const inserted = await ComplianceMaster.insertMany(complianceData);
    console.log(`✅ Successfully seeded ${inserted.length} compliance masters`);

    const count = await ComplianceMaster.countDocuments();
    console.log(`\n📊 Total Compliance Masters in DB: ${count}`);

    console.log("\n📌 Sample Record:");
    console.log(JSON.stringify(inserted[0], null, 2));

    // Verify no startupId in ComplianceMaster
    const withStartupId = await ComplianceMaster.findOne({ startupId: { $exists: true } });
    if (withStartupId) {
      console.log("\n⚠️ WARNING: Found startupId in ComplianceMaster!");
    } else {
      console.log("\n✅ Verified: No startupId in ComplianceMaster (correct!)");
    }

    console.log("\n✅ Seeding completed successfully!\n");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    console.error(error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedComplianceMaster();