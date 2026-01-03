const mongoose = require("mongoose");

const ComplianceMasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, 
    },

    description: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["CORPORATE", "TAXATION", "GST", "LABOUR", "OTHER"], 
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    frequency: {
      type: String,
      enum: [
        "ONE_TIME",
        "ANNUAL",
        "QUARTERLY",
        "MONTHLY",
        "HALF_YEARLY",    
        "EVENT_BASED",
      ],
      required: true,
    },

    dueConfig: {
      dueDay: {
        type: Number,
        min: 1,
        max: 31,
      },

      quarterDueDay: {
        type: Number,
        min: 1,
        max: 31,
      },

      dueMonth: {
        type: Number,
        min: 1,
        max: 12,
      },

      dueAfterFYEnd: {
        type: Boolean,
        default: false,
      },

      fixedDueDate: {
        type: Date, 
      },
    },

    applicableMonths: {
      type: [Number], 
      validate: [
        {
          validator: arr => arr.every(m => m >= 1 && m <= 12),
          message: "Months must be between 1 and 12",
        },
      ],
    },

    applicableQuarters: {
      type: [String], 
      enum: { values: ["Q1", "Q2", "Q3", "Q4"], message: "Invalid quarter" },
    },

    applicableFor: {
      proprietorship: { type: Boolean, default: false },
      partnership: { type: Boolean, default: false },
      llp: { type: Boolean, default: false },
      opc: { type: Boolean, default: false },
      privateLimited: { type: Boolean, default: false },
      publicLimited: { type: Boolean, default: false },
    },

    condition: {
      type: {
        type: String,
        enum: [
          "ALWAYS",
          "IF_TURNOVER_ABOVE",   
          "IF_EMPLOYEES_ABOVE",
          "IF_GST_REGISTERED",
          "CUSTOM",
        ],
        default: "ALWAYS",
      },
      value: { type: String }, 
    },

    forms: {
      type: [String],
      default: [],
    },

    legislation: {
      type: String,
      trim: true,
    },

    penalty: {
      amount: { type: Number, default: 0 },
      description: { type: String, default: "" },
    },

    active: {
      type: Boolean,
      default: true,
      index: true, 
    },
  },
  {
    timestamps: true,
  }
);

ComplianceMasterSchema.index({ active: 1, type: 1, category: 1 });

module.exports = mongoose.model("ComplianceMaster", ComplianceMasterSchema);