const express = require("express");
const router = express.Router();
const TeamRegistration = require("../../models/Hackthon/RegistrationModel");
const sendMail = require("../../utils/hackMail");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// =================================================
// 📂 MULTER CONFIGURATION (Updated for Photos)
// =================================================
const uploadDir = path.join(__dirname, "../../startupidea/uploads");
const photoDir = path.join(__dirname, "../../startupidea/photos"); //

// Ensure both directories exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 🧠 Logic: If it's a photo input, save to 'photos', else 'uploads'
    if (file.fieldname.includes("Photo")) {
      cb(null, photoDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Prefix filename with fieldname for clarity (e.g., leaderPhoto-12345.jpg)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

// =================================================
// HELPER: SAVE BASE64 FILE (Keep Existing)
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

    return `startupidea/uploads/${filename}`;
  } catch (err) {
    console.error("File Save Error:", err);
    return null;
  }
};

// =================================================
// 1️⃣ REGISTER TEAM (Existing - Closed Logic)
// =================================================
router.post("/hackathon-register", async (req, res) => {
  try {
    return res.status(403).json({
      success: false,
      message: "Registrations are closed now. Thank you for your interest!",
    });
  } catch (error) {
    console.error("Registration Closed Route Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =================================================
// 🆕 2️⃣ VERIFY LEADER (For Photo Upload Page)
// =================================================
router.post("/verify-leader", async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Phone are required" });
    }

    // Find team where leader matches email AND phone
    const team = await TeamRegistration.findOne({
      "leader.email": email,
      "leader.phone": phone,
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "No registration found with these details.",
      });
    }

    // Return minimal data needed for the frontend to generate inputs
    res.status(200).json({
      success: true,
      data: {
        _id: team._id,
        leader: {
          firstName: team.leader.firstName,
          lastName: team.leader.lastName,
        },
        members: team.members.map((m) => ({ name: m.name })),
      },
    });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =================================================
// 🆕 3️⃣ UPLOAD TEAM PHOTOS (Dynamic)
// =================================================
router.post("/upload-team-photos", upload.any(), async (req, res) => {
  try {
    const { teamId } = req.body;

    if (!teamId) {
      return res
        .status(400)
        .json({ success: false, message: "Team ID is missing" });
    }

    const team = await TeamRegistration.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const fieldName = file.fieldname;
        // Save relative path (adjust folder name if serving statically differently)
        const relativePath = `startupidea/photos/${file.filename}`;

        // Case A: Leader Photo
        if (fieldName === "leaderPhoto") {
          team.leader.photo = relativePath;
        }

        // Case B: Member Photo (e.g., memberPhoto_0)
        else if (fieldName.startsWith("memberPhoto_")) {
          const index = parseInt(fieldName.split("_")[1]); // Extract index

          if (team.members[index]) {
            team.members[index].photo = relativePath;
          }
        }
      });

      await team.save();

      return res.status(200).json({
        success: true,
        message: "Photos uploaded successfully",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No files received" });
    }
  } catch (error) {
    console.error("Photo Upload Error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// =================================================
// 4️⃣ GET ALL TEAMS (Existing)
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
// 5️⃣ UPDATE TEAM (Existing - Admin Edit)
// =================================================
router.put("/update-team/:id", upload.single("pitchFile"), async (req, res) => {
  try {
    const { id } = req.params;
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

    // Check if a new pitch file was uploaded
    if (req.file) {
      // Delete old file if exists
      if (team.leader.pitchFile) {
        const oldPath = path.join(__dirname, "../../", team.leader.pitchFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
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
// 6️⃣ DOWNLOAD FILE (Updated to support Photos)
// =================================================
router.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;

    if (filename.includes(".."))
      return res.status(400).json({ message: "Invalid filename" });

    // 1. Try Uploads Folder
    let filePath = path.join(uploadDir, filename);

    // 2. If not found, Try Photos Folder
    if (!fs.existsSync(filePath)) {
      filePath = path.join(photoDir, filename);
    }

    // 3. Final Check
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
