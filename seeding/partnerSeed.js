const fs = require("fs");
const path = require("path");

// सुनिश्चित करें कि मॉडल का पाथ सही है
const Partner = require("../models/partners/Partners"); 

const seedPartnerData = async () => {
  try {
    const filePath = path.join(__dirname, "../json_data/partner.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const partners = data.map((p) => ({
      name: p.name.trim(),
      designation: p.designation ? p.designation.trim() : null,
      companyName: p.companyName.trim(),
      contactNumber: p.contactNumber || "98424", // फ़ील्ड का नाम सही किया गया और String में बदला गया
      email: p.email.trim(),
      linkedinProfile: p.linkedinProfile || null,
      location: p.location ? p.location.trim() : null,
      partnerType: p.partnerType.trim(), 
      imageUrl: p.imageUrl || "https://example.com/default-avatar.png",
      industry: p.industry ? p.industry.trim() : null,
      websiteUrl: p.websiteUrl || null,
      description: p.description ? p.description.trim() : null,
    }));

    const existingCount = await Partner.countDocuments();
    if (existingCount > 0) {
      console.log("Partner data already exists. Skipping seeding.");
    } else {
      await Partner.insertMany(partners);
      console.log("Partner data seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding partner data: ❌", error);
  }
};

module.exports = seedPartnerData;
