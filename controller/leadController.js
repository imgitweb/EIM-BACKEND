// controllers/leadController.js
const Lead = require("../models/LeadTracker");

// Create a new lead
// const createLead = async (req, res) => {
//   try {
//     const { personName, email, mobileNumber, source, interestedForService } =
//       req.body;

//     // Validate fields
//     if (
//       !personName ||
//       !email ||
//       !mobileNumber ||
//       !source ||
//       !interestedForService
//     ) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     const newLead = new Lead({
//       personName,
//       email,
//       mobileNumber,
//       source,
//       interestedForService,
//     });

//     await newLead.save();
//     res
//       .status(201)
//       .json({ message: "Lead created successfully!", lead: newLead });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error creating lead.", error: error.message });
//   }
// };

// Get all leads
// const getLeads = async (req, res) => {
//   try {
//     const leads = await Lead.find();
//     res.status(200).json(leads);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error retrieving leads.", error: error.message });
//   }
// };

// --- 1. GET ALL LEADS FOR A USER ---
exports.getLeads = async (req, res) => {
  try {
    const { userId } = req.params;
    // Sort by newest first (-1 means descending)
    const leads = await Lead.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leads", error });
  }
};

// --- 2. ADD A SINGLE LEAD ---
exports.addLead = async (req, res) => {
  try {
    const { userId, name, email, phone, source, status } = req.body;

    const newLead = new Lead({
      userId,
      name,
      email,
      phone,
      source,
      status,
    });

    const savedLead = await newLead.save();
    res.status(201).json(savedLead);
  } catch (error) {
    res.status(500).json({ message: "Error adding lead", error });
  }
};

// --- 3. UPDATE LEAD ---
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedLead = await Lead.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
    });

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: "Error updating lead", error });
  }
};

// --- 4. BULK IMPORT (Excel Data) ---
exports.importLeads = async (req, res) => {
  try {
    const { userId, leads } = req.body; // 'leads' is the array from Excel

    if (!leads || leads.length === 0) {
      return res.status(400).json({ message: "No data provided" });
    }

    // Map Excel data to Mongoose Schema format
    const leadsToInsert = leads.map((lead) => ({
      userId,
      name: lead.Name || lead.name, // Handle case sensitivity from Excel
      email: lead.Email || lead.email,
      phone: lead.Phone || lead.phone,
      source: lead.Source || lead.source || "Imported",
      status: lead.Status || lead.status || "New",
    }));

    const insertedLeads = await Lead.insertMany(leadsToInsert);

    // Return the newly added leads (reversed so newest show first if frontend appends)
    res.status(201).json(insertedLeads.reverse());
  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ message: "Error importing leads", error });
  }
};

// module.exports = { createLead, getLeads };
