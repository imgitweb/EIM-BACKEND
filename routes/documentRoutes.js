const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadFiles,
  getDocumentById,
} = require("../controller/documentController");

const router = express.Router();

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`); // Replace spaces with underscores
  },
});

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Middleware for error handling during file upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle multer-specific errors
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // Handle custom errors or other issues
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Serve static files from 'uploads' directory
router.use("/uploads", express.static(uploadsDir));

// Route for file upload
router.post(
  "/upload",
  upload.fields([
    { name: "company_registration", maxCount: 1 },
    { name: "aadhar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "dpiit", maxCount: 1 },
  ]),
  handleUploadError, // Add error handling middleware
  uploadFiles
);

// Route to get document by startup_id
router.get("/get_document/:startup_id", getDocumentById);

module.exports = router;
