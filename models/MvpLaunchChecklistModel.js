const mongoose = require("mongoose");

const MvpLaunchChecklistSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
      unique: true,
    },

    checks: {
      buildComplete: { type: Boolean, default: false },
      hostingConfigured: { type: Boolean, default: false },
      paymentSetup: { type: Boolean, default: false },
      analyticsIntegrated: { type: Boolean, default: false },
      performanceTested: { type: Boolean, default: false },

      coreFeatures: { type: Boolean, default: false },
      bugsResolved: { type: Boolean, default: false },
      uiFinalized: { type: Boolean, default: false },
      testUsers: { type: Boolean, default: false },
      feedbackReady: { type: Boolean, default: false },
      legalDone: { type: Boolean, default: false },

      targetDefined: { type: Boolean, default: false },
      channelFinalized: { type: Boolean, default: false },
      geographyDecided: { type: Boolean, default: false },
    },

    completedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 14 },

    isReadyToLaunch: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MvpLaunchChecklist",
  MvpLaunchChecklistSchema
);
