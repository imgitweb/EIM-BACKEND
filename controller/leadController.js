// controllers/leadController.js
const Lead = require("../models/LeadTracker");

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
    // Destructure all fields including new ones (priority, remarks)
    const { userId, name, email, phone, source, status, priority, remarks } =
      req.body;

    const newLead = new Lead({
      userId,
      name,
      email,
      phone,
      source,
      status,
      priority: priority || "Medium", // Default to Medium if missing
      remarks: remarks || "",
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

    // This will automatically handle remarks and priority if they are in req.body
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
    // Checks for capitalized keys (Excel) or lowercase keys
    const leadsToInsert = leads.map((lead) => ({
      userId,
      name: lead.Name || lead.name,
      email: lead.Email || lead.email,
      phone: lead.Phone || lead.phone,
      source: lead.Source || lead.source || "Imported",
      status: lead.Status || lead.status || "New Lead",
      priority: lead.Priority || lead.priority || "Medium",
      remarks: lead.Remarks || lead.remarks || "",
    }));

    const insertedLeads = await Lead.insertMany(leadsToInsert);

    // Return the newly added leads (reversed so newest show first if frontend appends)
    res.status(201).json(insertedLeads.reverse());
  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ message: "Error importing leads", error });
  }
};
