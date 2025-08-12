// controllers/startupHireTeamController.js
const StartupHireTeam = require("../models/StartupHireTeamModel");

// Create new Hire Team entry
exports.createStartupHireTeam = async (req, res) => {
  try {
    const newEntry = new StartupHireTeam(req.body);
    const savedEntry = await newEntry.save();
    res.status(201).json({ success: true, data: savedEntry });
  } catch (error) {
    console.error("Error creating Startup Hire Team:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save data",
      error: error.message,
    });
  }
};
