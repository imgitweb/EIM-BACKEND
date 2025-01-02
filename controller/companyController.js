const Company = require("../models/companyModel");

const createOrUpdate = async (req, res) => {
  try {
    const { startup_id, company_name } = req.body;

    // Check for required fields
    if (!startup_id || !company_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("Checking if company exists with reg_no:", startup_id);

    // Use findOneAndUpdate to either update or create a new document
    const updatedCompany = await Company.findOneAndUpdate(
      { startup_id }, // Query: Find company by registration number
      { $set: req.body }, // Update: Set the fields from request body
      { new: true, upsert: true } // Options: Return the updated document and create one if it doesn't exist
    );

    console.log(
      "Company information has been saved or updated:",
      updatedCompany
    );

    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error("Error during company creation or update:", error);
    res.status(500).json({ errorMessage: error.message, stack: error.stack });
  }
};

const getCompanyInfoById = async (req, res) => {
  try {
    const { startup_id } = req.params; // Get startup_id from URL parameters

    const companyDetails = await Company.find({ startup_id }); // Find by startup_id

    if (!companyDetails || companyDetails.length === 0) {
      return res.status(404).json({ message: "Company Details Not Found" }); // 404 for not found
    }

    res.status(200).json(companyDetails); // Send team details
  } catch (error) {
    res.status(500).json({ errorMessage: error.message, stack: error.stack }); // 500 for server errors
  }
};

module.exports = { createOrUpdate, getCompanyInfoById };
