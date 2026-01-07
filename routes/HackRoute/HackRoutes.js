const express = require("express");
const router = express.Router();
const TeamRegistration = require("../../models/Hackthon/RegistrationModel");
const sendMail = require("../../utils/hackMail");
const fs = require("fs");
const path = require("path");
const multer = require("multer"); // 1. Import Multer

// =================================================
// MULTER CONFIGURATION (For File Uploads)
// =================================================
const uploadDir = path.join(__dirname, "../../startupidea/uploads");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: pitch-TIMESTAMP.extension
    const ext = path.extname(file.originalname);
    cb(null, `pitch-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

// =================================================
// HELPER: SAVE BASE64 FILE (For Initial Register)
// =================================================
const saveBase64File = (base64String) => {
  try {
    if (!base64String) return null;

    const matches = base64String.match(/^data:([A-Za-z0-9-+/.]+);base64,(.+)$/);
    if (!matches) return null;

    const mimeType = matches[1];
    const data = Buffer.from(matches[2], "base64");

    let extension = "bin";
    if (mimeType === "application/pdf") extension = "pdf";
    else if (mimeType === "application/msword") extension = "doc";
    else if (mimeType.includes("wordprocessingml")) extension = "docx";

    const filename = `pitch-${Date.now()}.${extension}`;
    fs.writeFileSync(path.join(uploadDir, filename), data);

    // Return relative path for DB
    return `startupidea/uploads/${filename}`;
  } catch (err) {
    console.error("File Save Error:", err);
    return null;
  }
};

// =================================================
// 1️⃣ REGISTER TEAM (Base64 Logic)
// =================================================
router.post("/hackathon-register", async (req, res) => {
  try {
    const data = req.body;

    if (!data?.leader?.email || !data?.teamConfig?.track) {
      return res
        .status(400)
        .json({ success: false, message: "Missing details" });
    }

    const existing = await TeamRegistration.findOne({
      "leader.email": data.leader.email,
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    // Save File if exists
    if (data.leader.pitchFile) {
      const savedPath = saveBase64File(data.leader.pitchFile);
      data.leader.pitchFile = savedPath || "";
    }

    const registration = new TeamRegistration(data);
    await registration.save();

    // Send Mail
    sendMail(
      data.leader.email,
      `${data.leader.firstName} ${data.leader.lastName}`,
      data.teamConfig.size,
      data.teamConfig.track
    ).catch(() => {});

    res
      .status(201)
      .json({ success: true, message: "Team registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =================================================
// 2️⃣ GET ALL TEAMS
// =================================================
router.get("/get-all-teams", async (req, res) => {
  try {
    const teams = await TeamRegistration.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
});

// =================================================
// 3️⃣ UPDATE TEAM (With File Upload)
// =================================================
router.put("/update-team/:id", upload.single("pitchFile"), async (req, res) => {
  try {
    const { id } = req.params;

    // Frontend sends flat data, but DB has nested structure.
    // We map req.body manually.
    const { firstName, lastName, email, phone, status } = req.body;

    const team = await TeamRegistration.findById(id);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Update Text Fields
    if (firstName) team.leader.firstName = firstName;
    if (lastName) team.leader.lastName = lastName;
    if (email) team.leader.email = email;
    if (phone) team.leader.phone = phone;
    if (status) team.status = status;

    // Check if a new file was uploaded via Multer
    if (req.file) {
      // Optional: Delete old file to save space
      if (team.leader.pitchFile) {
        const oldPath = path.join(__dirname, "../../", team.leader.pitchFile);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Save new path relative to what your download route expects
      // req.file.filename is generated by Multer above
      team.leader.pitchFile = `startupidea/uploads/${req.file.filename}`;
    }

    await team.save();

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: team,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// =================================================
// 4️⃣ DOWNLOAD FILE
// =================================================
router.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;

    if (filename.includes(".."))
      return res.status(400).json({ message: "Invalid filename" });

    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.download(filePath);
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ message: "Download failed" });
  }
});

module.exports = router;
