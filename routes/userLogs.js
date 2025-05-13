const express = require("express");
const router = express.Router();
const UserLog = require("../models/UserLog");

// ✅ Route to save user logs
router.post("/log", async (req, res) => {
  try {
    const { userId, ipAddress, event } = req.body;
    const newLog = new UserLog({ userId, ipAddress, event });
    await newLog.save();
    res.status(201).json({ message: "Log saved successfully" });
  } catch (error) {
    console.error("Error saving log:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Route to get all user logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await UserLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
