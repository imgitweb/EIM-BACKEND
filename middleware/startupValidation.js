const Startup = require("../models/signup/StartupModel");

const validateStartupId = async (req, res, next) => {
  try {
    const { startupId } = req.params;

    if (!startupId) {
      return res.status(400).json({
        success: false,
        message: "StartupID is required in URL parameters"
      });
    }

    if (!startupId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid StartupID format. Must be a valid MongoDB ObjectId."
      });
    }

    const startup = await Startup.findById(startupId).select(
      "_id startupName email entityType"
    );

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: `Startup not found with ID: ${startupId}. Please check your login.`
      });
    }

    req.startup = startup;
    req.startupId = startupId;

    console.log(`✅ Validated StartupID: ${startup.startupName} (${startupId})`);

    next();
  } catch (error) {
    console.error("StartupID validation error:", error);
    res.status(500).json({
      success: false,
      message: "Startup validation failed"
    });
  }
};

module.exports = { validateStartupId };