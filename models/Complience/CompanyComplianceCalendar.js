const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true,
  },

  complianceMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ComplianceMaster",
    required: true,
  },

  complianceName: {
    type: String,
    required: true,
    index: true,
  },

  complianceType: {
    type: String,
    enum: ["CORPORATE", "TAXATION", "GST", "LABOUR", "OTHER"],
    required: true,
  },

  category: String,

  frequency: {
    type: String,
    enum: ["MONTHLY", "QUARTERLY", "ANNUAL", "BIANNUAL", "ONE_TIME", "EVENT_BASED"],
    required: true,
  },

  financialYear: String, 

  dueDate: {
    type: Date,
    required: true,
    index: true,
  },

  month: Number, 
  quarter: String, 
  year: Number,

  status: {
    type: String,
    enum: ["PENDING", "COMPLIANT", "OVERDUE", "IN_PROGRESS", "ACTION_REQUIRED"],
    default: "PENDING",
    index: true,
  },

  statusHistory: [
    {
      status: String,
      changedAt: {
        type: Date,
        default: Date.now,
      },
      changedBy: mongoose.Schema.Types.ObjectId,
      remarks: String,
    },
  ],

  applicable: {
    type: Boolean,
    default: true,
  },

  applicabilityReason: String, 

  remarks: String,
  uploadedDocuments: [
    {
      documentName: String,
      uploadedAt: Date,
      uploadedBy: mongoose.Schema.Types.ObjectId,
      fileUrl: String,
    },
  ],

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  completionDate: Date,

  penalty: {
    amount: Number,
    description: String,
    status: {
      type: String,
      enum: ["DUE", "PAID", "WAIVED"],
    },
  },

  // Important Dates
  daysUntilDue: Number,
  reminderSentAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

calendarSchema.index(
  { companyId: 1, complianceName: 1, dueDate: 1 },
  { unique: true }
);


module.exports = mongoose.model("CompanyComplianceCalendar", calendarSchema);