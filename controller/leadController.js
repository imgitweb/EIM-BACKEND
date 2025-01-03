// controllers/leadController.js
const Lead = require("../models/leadModel");

// Create a new lead
const createLead = async (req, res) => {
  try {
    const { personName, email, mobileNumber, source, interestedForService } =
      req.body;

    // Validate fields
    if (
      !personName ||
      !email ||
      !mobileNumber ||
      !source ||
      !interestedForService
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newLead = new Lead({
      personName,
      email,
      mobileNumber,
      source,
      interestedForService,
    });

    await newLead.save();
    res
      .status(201)
      .json({ message: "Lead created successfully!", lead: newLead });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating lead.", error: error.message });
  }
};

// Get all leads
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving leads.", error: error.message });
  }
};

module.exports = { createLead, getLeads };
