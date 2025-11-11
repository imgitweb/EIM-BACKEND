const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ClientPersona = require("../../models/sales/clientPersona");
const StartupModel = require("../../models/signup/StartupModel");

router.post("/", async (req, res) => {
  console.log("req", req.body);
  try {
    const {
      startupId,
      profileName,
      productService,
      ageGroup,
      gender,
      country,
      state,
      preferredPlatform,
      techSavviness,
      contentPreference,
    } = req.body;

    // 1. Validate required fields
    if (
      !startupId ||
      !profileName ||
      !productService ||
      !ageGroup ||
      !gender ||
      !country ||
      !state ||
      !preferredPlatform ||
      !techSavviness ||
      !contentPreference
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // 2. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ error: "Invalid startupId format." });
    }

    // 3. Check if startup exists
    const startup = await StartupModel.findById(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found." });
    }

    // 4. Create and save persona
    const newPersona = new ClientPersona(req.body);
    const savedPersona = await newPersona.save();

    res.status(201).json({
      message: "Client Persona saved successfully!",
      data: savedPersona,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }
    console.error("Error saving persona:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// GET /api/client-personas?startupId=xxx - Get all personas for a startup
router.get("/", async (req, res) => {
  try {
    const { startupId } = req.query;

    if (!startupId) {
      return res
        .status(400)
        .json({ error: "startupId query parameter is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ error: "Invalid startupId." });
    }

    const personas = await ClientPersona.find({ startupId }).sort({
      createdAt: -1,
    });

    res.json({ data: personas });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
