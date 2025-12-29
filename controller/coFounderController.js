// coFounderController.js
const CoFounder = require("../models/CoFounder");

const User = require("./../models/signup/StartupModel");
const fs = require("fs");
const path = require("path");
const { startup } = require("pm2");

// Add a new co-founder
exports.addCoFounder = async (req, res) => {
  try {
    const {
      coFounderName,
      skills,
      location,
      typeOfCoFounder,
      industry,
      weeklyAvailability,
      startupStage,
    } = req.body;
    const profilePhoto = req.file ? req.file.path : null;

    if (!profilePhoto) {
      return res.status(400).json({ error: "Profile photo is required" });
    }

    const newCoFounder = new CoFounder({
      coFounderName,
      profilePhoto,
      skills,
      location,
      typeOfCoFounder,
      industry,
      weeklyAvailability,
      startupStage,
    });

    await newCoFounder.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Co-founder added successfully",
        data: newCoFounder,
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while adding the co-founder" });
  }
};



// Update cofounder
exports.updateCofounder = async (req, res) => {
  try {
    const cofounder = await CoFounder.findById(req.params.id);
    if (!cofounder) {
      return res.status(404).json({
        status: "error",
        message: "Cofounder not found",
      });
    }

    const updatedCofounder = await CoFounder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      status: "success",
      data: updatedCofounder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete cofounder
exports.deleteCofounder = async (req, res) => {
  try {
    const cofounder = await CoFounder.findById(req.params.id);
    if (!cofounder) {
      return res.status(404).json({
        status: "error",
        message: "Cofounder not found",
      });
    }

    // Soft delete by setting isDeleted to true
    const deletedCofounder = await CoFounder.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    res.json({
      status: "success",
      data: deletedCofounder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getCoFounderById = async (req, res) => {
  try {
    const cofounder = await CoFounder.find({startupId: req.params.id});
    if (!cofounder) {
      return res.status(404).json({
        status: "error",
        message: "Cofounder not found",
      });
    }

    console.log("Cofounder found:", cofounder);

    res.json({
      status: "success",
      data: cofounder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ✅ GET Co-Founders by Startup ID (Updated to use req.params.id)
exports.getCoFounders = async (req, res) => {
  try {
    const startupId = req.params.id;

    // Fetch only co-founders belonging to this startupId
    const coFounders = await CoFounder.find({ 
      startupId: startupId, 
      isDeleted: { $ne: true } 
    }).sort({ createdAt: 1 }); // Sort by creation (oldest first usually better for list)

    res.status(200).json({ success: true, data: coFounders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching co-founders" });
  }
};

// ✅ ADD or UPDATE Founders
exports.addOrUpdateFounders = async (req, res) => {
  try {
    const startupId = req.params.id;
    const { founders, foundersAgreementSigned } = req.body;

    // 1. Delete existing founders for this startup (Full Replace Strategy)
    // This ensures removed founders in UI are removed from DB
    await CoFounder.deleteMany({ startupId });

    // 2. Loop and Create new entries
    if (founders && Array.isArray(founders)) {
      for (const f of founders) {
        // Validation: Skip if mandatory fields are missing
        if (!f.name || !f.email) continue;

        await CoFounder.create({
          startupId,
          name: f.name,
          email: f.email,
          // ✅ Map new fields from Frontend
          country: f.country || "",
          phone: f.phone || "",
          expertise: f.expertise || "",
          linkedInProfile: f.linkedin || "", // Frontend sends 'linkedin', DB has 'linkedInProfile'
          bio: f.bio || "",
          equity: f.equity || 0,
        });
      }
    }

    // 3. Update the Agreement Signed Status in the Main Startup Model
    // Frontend sends boolean (true/false)
    await User.findByIdAndUpdate(startupId, {
      foundersAgreementSigned: foundersAgreementSigned,
    });

    res.json({ message: "Founders updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPLOAD Agreement PDF
exports.uploadFoundersAgreement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF required" });
    }

    await User.findByIdAndUpdate(req.params.id, {
      foundersAgreementPdf: `/uploads/${req.file.filename}`,
    });

    res.json({ message: "Agreement uploaded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};