const fs = require("fs");
const path = require("path");
const MVPTeam = require("../models/MVPTeamModel");
const mapCategory = require("../utils/mapCategory");



const SeedMVPTeam = async () => {
  try {
    const filePath = path.join(__dirname, "../json_data/mvp_companies.json"); 
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    for (const p of data) {
      const entry = {
        companyName: p.companyName?.trim(),
        services: p.services?.trim(),
        website: p.website?.trim() || null,
        contactPerson: p.contactPerson?.trim() || null,
        contactNo: p.contactNo?.toString() || null,
        location: p.location?.trim() || null,
        category: mapCategory(p.category),
        logo : p.logo?.trim(),
        discription: p.discription?.trim() || null,

      };

      await MVPTeam.findOneAndUpdate(
        { companyName: entry.companyName }, 
        { $set: entry },
        { upsert: true, new: true }
      );
    }

    console.log("✅ MVP Team data synced successfully!");
  } catch (error) {
    console.error("❌ Error seeding MVP Team:", error);
  }
};

module.exports = SeedMVPTeam;
