const mongoose = require("mongoose");

const complianceSchema = new mongoose.Schema(
  {
    // Startup/Company Details
    startupName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationType: {
      type: String,
      enum: [
        "Proprietorship",
        "Partnership",
        "Limited Liability Partnership",
        "One Person Company",
        "Private Limited Company",
        "Public Limited Company",
      ],
      required: true,
    },
    gstNumber: {
      type: String,
      default: "Not Available",
      trim: true,
    },
    panNumber: {
      type: String,
      default: "Not Available",
      trim: true,
    },

    // Compliance Details
    complianceType: {
      type: String,
      required: true,
      enum: [
        "GST Return",
        "Income Tax",
        "TDS Payment",
        "Board Meeting",
        "Annual Return",
        "Audit Report",
        "PF/ESI",
        "Statutory Filing",
        "ROC Filing",
        "Professional Tax",
        "Other",
      ],
    },
    complianceFrequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Annually", "Ad-hoc"],
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    submissionDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "action-required", "overdue", "compliant"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },

    // Links to new calendar system
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // startup or company ID
      index: true,
    },
    calendarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyComplianceCalendar",
    },

    // Attachments
    attachments: [
      {
        fileName: String,
        filePath: String,
        fileSize: Number,
        mimeType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index for performance
complianceSchema.index({ companyId: 1, complianceType: 1 });
complianceSchema.index({ dueDate: 1 });
complianceSchema.index({ status: 1 });

module.exports = mongoose.model("Compliance", complianceSchema);