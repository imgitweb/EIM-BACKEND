const Mrr = require("../models/matrix/mrrModel");

const createOrUpdateMrr = async (req, res) => {
  try {
    const { startup_id, year, month, no_customer, arpa } = req.body;

    // Find the existing MRR entry based on startup_id, year, and month
    const existingMrr = await Mrr.findOne({ startup_id, year, month });

    if (existingMrr) {
      // If the record exists, update it
      existingMrr.no_customer = no_customer;
      existingMrr.arpa = arpa;

      await existingMrr.save(); // Save the updated record

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
    const mrrData = await Mrr.find({ startup_id });

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

module.exports = {
  createOrUpdateMrr,
  getMRR,
};
