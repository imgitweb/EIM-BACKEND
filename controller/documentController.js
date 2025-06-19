const Document = require("../models/documentModel");
const path = require("path");

const uploadFiles = async (req, res) => {
  try {
    const { startup_id } = req.body;

    if (!startup_id) {
      return res.status(400).json({ message: "startup_id is required" });
    }

    // Build the update object dynamically based on uploaded files
    const updateData = {};
    if (req.files["company_registration"]) {
      updateData.company_registration =
        req.files["company_registration"][0].path;
    }
    if (req.files["aadhar_card"]) {
      updateData.aadhar_card = req.files["aadhar_card"][0].path;
    }
    if (req.files["pan_card"]) {
      updateData.pan_card = req.files["pan_card"][0].path;
    }
    if (req.files["dpiit"]) {
      updateData.dpiit = req.files["dpiit"][0].path;
    }

    // Update or create the company record
    const updatedDocument = await Document.findOneAndUpdate(
      { startup_id },
      { $set: updateData },
      { new: true, upsert: true } // Upsert option: update if exists, create otherwise
    );

    res.status(200).json({
      message: "Files uploaded successfully",
      data: updatedDocument,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { startup_id } = req.params; // Get startup_id from URL parameters
    const documentDetails = await Document.findOne({ startup_id }); // Find by startup_id
    console.log(documentDetails);
  if (!documentDetails) {
      return res.status(404).json({ message: "Document not found" }); // 404 if not found
    }
    res.status(200).json(documentDetails); // Send team details
  } catch (error) {
    res.status(500).json({ errorMessage: error.message, stack: error.stack }); // 500 for server errors
  }
};

module.exports = { uploadFiles, getDocumentById };
