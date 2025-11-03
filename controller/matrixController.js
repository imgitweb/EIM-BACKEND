// --- matrixController.js ---

const Mrr = require("../models/matrix/mrrModel");
// 🔥 Naya GR Model Import Karein (Apne path ke hisaab se badal lijiye)
const Gr = require("../models/matrix/grModel"); 

// ===================================
// --- MRR Functions (No Change) ---
// ===================================

const createOrUpdateMrr = async (req, res) => {
  try {
    const { startup_id, year, month, no_customer, arpa } = req.body;

    // Find the existing MRR entry based on startup_id, year, and month
    const existingMrr = await Mrr.findOne({ startup_id, year, month });

    if (existingMrr) {
      // If the record exists, update it
      existingMrr.no_customer = no_customer;
      existingMrr.arpa = arpa;

      await existingMrr.save();
      return res
        .status(200)
        .json({ message: "MRR data updated successfully", data: existingMrr });
    } else {
      // If the record doesn't exist, create a new one
      const newMrr = new Mrr({
        startup_id,
        year,
        month,
        no_customer,
        arpa,
      });

      await newMrr.save();
      return res
        .status(201)
        .json({ message: "MRR data saved successfully", data: newMrr });
    }
  } catch (error) {
    console.error("Error saving or updating MRR data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getMRR = async (req, res) => {
  try {
    const { startup_id } = req.params;
    // Data ko latest month/year ke hisaab se sort karna behtar hai
    const mrrData = await Mrr.find({ startup_id }).sort({ year: -1, month: -1 });

    if (!mrrData.length) {
      return res
        .status(404)
        .json({ message: "No MRR data found for this startup ID" });
    }

    return res.status(200).json(mrrData);
  } catch (error) {
    console.error("Error fetching MRR data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


// ==================================================
// 🔥 --- NEW: Gross Revenue (GR) Functions --- 🔥
// ==================================================

const createOrUpdateGr = async (req, res) => {
  try {
    // Expected fields for Gross Revenue
    const { startup_id, year, month, gross_revenue } = req.body; 

    // Find the existing GR entry based on startup_id, year, and month
    const existingGr = await Gr.findOne({ startup_id, year, month });

    if (existingGr) {
      // If the record exists, update it
      existingGr.gross_revenue = gross_revenue;

      await existingGr.save(); 

      return res
        .status(200)
        .json({ message: "Gross Revenue data updated successfully", data: existingGr });
    } else {
      // If the record doesn't exist, create a new one
      const newGr = new Gr({ 
        startup_id,
        year,
        month,
        gross_revenue,
      });

      await newGr.save();
      return res
        .status(201)
        .json({ message: "Gross Revenue data saved successfully", data: newGr });
    }
  } catch (error) {
    console.error("Error saving or updating Gross Revenue data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getGR = async (req, res) => {
  try {
    const { startup_id } = req.params;
    // Data ko latest month/year ke hisaab se sort karein
    const grData = await Gr.find({ startup_id }).sort({ year: -1, month: -1 });

    if (!grData.length) {
      return res
        .status(404)
        .json({ message: "No Gross Revenue data found for this startup ID" });
    }

    return res.status(200).json(grData);
  } catch (error) {
    console.error("Error fetching Gross Revenue data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


// ===================================
// --- Module Exports (Updated) ---
// ===================================

module.exports = {
  createOrUpdateMrr,
  getMRR,
  // 🔥 New GR functions export kiye
  createOrUpdateGr, 
  getGR,
};