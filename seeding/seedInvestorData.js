const fs = require("fs");
const path = require("path");
const Investor = require("../models/InvestorModel"); // Assuming you have an Investor model

const seedInvestorData = async () => {
  try {
    // Load and parse JSON data
    const filePath = path.join(__dirname, "../json_data/invester.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Prepare and normalize investor data
    const investors = data.map((investor) => ({
      firmName: investor.firmName,
      investorType: investor.investorType.toLowerCase(), // e.g. vc, angel
      stage: investor.stage.toLowerCase(), // e.g. growth, seed
      industry: investor.industry ? investor.industry.replace(/,\s*$/, "") : "N/A", // remove trailing comma if any
      website: investor.website || "N/A",
      email: investor.email.toLowerCase(),
      location: investor.location || "N/A",
      pointOfContact: investor.pointOfContact || "N/A",
      linkedinProfile: investor.linkedinProfile || "N/A",
      contactNumber: investor.contactNumber || "0000000000",
      firmLogo: investor.firmLogo || "https://example.com/default-logo.png",
      skills:  investor.skills || ["N/A"]
    }));

    // Prevent duplicate insertions
    const existingInvestors = await Investor.countDocuments();
    if (existingInvestors > 0) {
      console.log("Investor data already exists. Skipping seeding.");
    } else {
      await Investor.insertMany(investors);
      console.log("Investor data seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding investor data:", error);
  }
};

module.exports = seedInvestorData;
