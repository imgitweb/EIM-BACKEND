const express = require("express");
const router = express.Router();
// Ensure this path matches where you saved the Model above
const TeamRegistration = require("../../models/Hackthon/RegistrationModel");
const sendMail = require("../../utils/hackMail");
const fs = require("fs");
const path = require("path");

// --- HELPER: Save Base64 File ---
const saveBase64File = (base64String) => {
  try {
    if (!base64String) return null;

    // Check if it's a raw base64 string or data URI
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    // If no matches, it might be just the base64 string without prefix,
    // but the frontend sends dataURI. If frontend sends raw, handle accordingly.
    if (!matches || matches.length !== 3) return null;

    const type = matches[1];
    const data = Buffer.from(matches[2], "base64");

    let extension = "bin";
    if (type.includes("pdf")) extension = "pdf";
    else if (type.includes("word")) extension = "docx";
    else if (type.includes("msword")) extension = "doc";
    else if (type.includes("image")) extension = "png"; // Fallback for images

    // Ensure directory exists
    const uploadDir = path.join(__dirname, "../../startupidea/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `pitch-${Date.now()}.${extension}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, data);

    return `startupidea/uploads/${filename}`;
  } catch (error) {
    console.error("File Save Error:", error);
    return null;
  }
};

// =========================================================
// 1. REGISTER API
// =========================================================
router.post("/hackathon-register", async (req, res) => {
  try {
    const data = req.body;

    // Enhanced Validation
    if (
      !data.leader?.email ||
      !data.leader?.phone ||
      !data.leader?.aboutStartup ||
      !data.teamConfig?.track // Added validation for Track
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Mandatory details missing" });
    }

    const existing = await TeamRegistration.findOne({
      "leader.email": data.leader.email,
    });

    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "This email is already registered" });
    }

    // Handle File Upload
    if (data.leader.pitchFile) {
      const savedPath = saveBase64File(data.leader.pitchFile);
      // Only replace if save was successful, otherwise keep null or empty
      if (savedPath) data.leader.pitchFile = savedPath;
      else data.leader.pitchFile = ""; // Clear invalid base64 if save failed
    }

    const registration = new TeamRegistration(data);
    await registration.save();

    // Send Mail (Non-blocking)
    try {
      await sendMail(
        data.leader.email,
        `${data.leader.firstName} ${data.leader.lastName}`,
        data.teamConfig.size,
        data.teamConfig.track
      );
    } catch (mailError) {
      console.warn("Mail Error (Non-fatal):", mailError.message);
    }

    res
      .status(201)
      .json({ success: true, message: "Team registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================================================
// 2. GET ALL TEAMS (FOR ADMIN DASHBOARD)
// =========================================================
router.get("/get-all-teams", async (req, res) => {
  try {
    // Fetch all records, sorted by Newest First
    const teams = await TeamRegistration.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    console.error("Fetch API Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch teams" });
  }
});

// =========================================================
// 3. UPDATE TEAM DETAILS (FOR ADMIN EDIT MODAL)
// =========================================================
router.put("/update-team/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Extract fields to allow updates
    const { firstName, lastName, email, phone, status } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "ID is required" });

    const updatedTeam = await TeamRegistration.findByIdAndUpdate(
      id,
      {
        $set: {
          "leader.firstName": firstName,
          "leader.lastName": lastName,
          "leader.email": email,
          "leader.phone": phone,
          // Update Status (matches the new Schema field)
          status: status,
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedTeam) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Update API Error:", error);
    res.status(500).json({ success: false, message: "Failed to update team" });
  }
});

module.exports = router;
