// routes/companyRegistrationRoutes.js
const express = require("express");
const CompanyRegistration = require("../models/CompanyRegistrationModel");

const router = express.Router();

// POST API
router.post("/api/company-registration", async (req, res) => {
  try {
    const newEntry = new CompanyRegistration(req.body);
    await newEntry.save();
    res.status(201).json({ message: "Data saved successfully", data: newEntry });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});

// ✅ CommonJS export
module.exports = router;
