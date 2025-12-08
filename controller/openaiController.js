const { CallOpenAi } = require("./helper/helper");
require("dotenv").config();
const axios = require("axios");

exports.getChecklist = async (req, res) => {
  try {
    const { startupIdea } = req.body;

    if (!startupIdea) {
      return res
        .status(400)
        .json({ error: "Startup idea is too short or missing." });
    }
    const prompt = `I have a startup idea. Please analyze it legally as per Indian laws and return the following output in strictly valid JSON format only (no extra text or explanation outside JSON).
  
    Output format:
    {
      "legalStatus": "Legal / Restricted / Illegal",
      "startupCategory": "Tech / Non-Tech / Food / Finance / Health / Education / Manufacturing / E-commerce / Others",
      "applicableLaws": ["string"],
      "requiredLicenses": ["string"],
      "requiredDocuments": ["string"],
      "complianceRisks": ["string"],
      "advisoryNote": "string"
    }
    
    Startup Idea:
    ${startupIdea}
    `;
    const checklist = await CallOpenAi(prompt);
    res.json({ success: true, checklist });
    console.log(checklist);
  } catch (error) {
    console.error("Error in getChecklist:", error.message);
    res.status(500).json({ error: "Failed to generate legal checklist." });
  }
};
