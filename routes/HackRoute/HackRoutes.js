const express = require("express");
const router = express.Router();
const TeamRegistration = require("../../models/Hackthon/RegistrationModel");
const sendMail = require("../../utils/hackMail");
const fs = require("fs");
const path = require("path");

// =================================================
// HELPER: SAVE BASE64 FILE (PDF / DOC / DOCX)
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
    else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      extension = "docx";

    const uploadDir = path.join(__dirname, "../../startupidea/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `pitch-${Date.now()}.${extension}`;
    fs.writeFileSync(path.join(uploadDir, filename), data);

    // DB me relative path save hoga
    return `startupidea/uploads/${filename}`;
  } catch (err) {
    console.error("File Save Error:", err);
    return null;
  }
};

// =================================================
// 1️⃣ REGISTER TEAM
// =================================================
router.post("/hackathon-register", async (req, res) => {
  try {
    const data = req.body;

    if (
      !data?.leader?.email ||
      !data?.leader?.phone ||
      !data?.leader?.aboutStartup ||
      !data?.teamConfig?.track
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Mandatory details missing" });
    }

    const existing = await TeamRegistration.findOne({
      "leader.email": data.leader.email,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }

    // SAVE FILE
    if (data.leader.pitchFile) {
      const savedPath = saveBase64File(data.leader.pitchFile);
      data.leader.pitchFile = savedPath || "";
    }

    const registration = new TeamRegistration(data);
    await registration.save();

    // SEND MAIL (NON-BLOCKING)
    sendMail(
      data.leader.email,
      `${data.leader.firstName} ${data.leader.lastName}`,
      data.teamConfig.size,
      data.teamConfig.track
    ).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Team registered successfully",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =================================================
// 2️⃣ GET ALL TEAMS (ADMIN)
// =================================================
router.get("/get-all-teams", async (req, res) => {
  try {
    const teams = await TeamRegistration.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (err) {
    console.error("Fetch Teams Error:", err);
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
});

// =================================================
// 3️⃣ DOWNLOAD FILE (FINAL & SAFE)
// =================================================
router.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;

    // Security: prevent path traversal
    if (filename.includes("..")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const filePath = path.join(
      __dirname,
      "../../startupidea/uploads",
      filename
    );

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
