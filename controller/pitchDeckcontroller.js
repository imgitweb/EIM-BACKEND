const { CallOpenAi } = require("./helper/helper"); // Path check kar lein apne folder ke hisaab se
const PitchDeck = require("../models/PitchDeck");

const generatePitchDeck = async (req, res) => {
  try {
    const { formData } = req.body;

    // 1. Basic Validation
    if (!formData || !formData.businessName) {
      return res.status(400).json({
        success: false,
        error: "Business details (formData) are required",
      });
    }

    const systemPrompt = "You are a professional startup consultant. You must respond ONLY with a valid JSON object.";

const prompt = `
Based on the business profile provided below, generate a professional startup pitch deck in JSON format. 

### BUSINESS PROFILE:
- Startup Name: ${formData.businessName}
- Business Type: ${formData.businessType}
- Services Offered: ${(formData.services || []).join(", ")}
- Target Market Location: ${formData.targetLocation}
- Bootstrap Fund: ₹${formData.bootstrapFund}
- Estimated Customer Base: ${formData.customerCount}
- Generated Revenue: ₹${formData.revenue}
- Contact Information:
    - Email: ${formData.email}
    - Mobile: ${formData.mobile}
    - Address: ${formData.address || "India"}

### OUTPUT INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. The JSON structure must EXACTLY match the keys provided below.
3. Be professional, creative, and persuasive in the content.
4. Use the "team" array to generate 4 logical founding members based on the industry.

### STRICT JSON STRUCTURE:
{
  "StartupName": "${formData.businessName}",
  "Who_We_are": "A concise and catchy 1-sentence summary of the startup.",
  "Problem": "A detailed description of the pain point being addressed.",
  "Solution0": "Direct solution feature 1",
  "Solution1": "Direct solution feature 2",
  "Solution2": "Direct solution feature 3",
  "Solution3": "Direct solution feature 4",
  "ProductOverview": {
    "isUnique": true,
    "isTested": true,
    "firstToMarket": true,
    "hasAdditionalFeatures": true
  },
  "Features": "A comprehensive list of product features and capabilities.",
  "Market": "Description of the target audience and market opportunity.",
  "CompetitionAnalysis": "How this startup stands out from existing competitors.",
  "GrowthStrategy": "3-step plan for scaling and acquiring customers.",
  "BusinessModel": "Detailed explanation of revenue streams and pricing strategy.",
  "founders": "Main founder names and roles (e.g., Member1 (CEO), Member2 (CTO))",
  "team": [
    { "name": "Name 1", "designation": "Founder & CEO", "image": "https://i.pravatar.cc/150?img=1" },
    { "name": "Name 2", "designation": "Co-founder & CTO", "image": "https://i.pravatar.cc/150?img=2" },
    { "name": "Name 3", "designation": "Lead Designer", "image": "https://i.pravatar.cc/150?img=3" },
    { "name": "Name 4", "designation": "Marketing Head", "image": "https://i.pravatar.cc/150?img=4" }
  ],
  "fundingRequest": "A professional funding request (e.g., We are seeking ₹${formData.bootstrapFund} for expansion).",
  "ContactInformation": {
    "Email": "${formData.email}",
    "Mobile": "${formData.mobile}",
    "Address": "${formData.address || 'India'}"
  }
}`;

    // 2. OpenAI Call (Using your helper)
    const pitchDeckJson = await CallOpenAi(prompt, systemPrompt, true);

    if (!pitchDeckJson || typeof pitchDeckJson !== 'object') {
      return res.status(500).json({
        success: false,
        error: "Something went wrong, please try again",
      });
    }

    // 3. Database Storage
    // Hum user ka input aur AI ka output dono save kar rahe hain
    const newPitchEntry = new PitchDeck({
      formData: formData, 
      pitchDeckData: pitchDeckJson,
      createdAt: new Date()
    });

    const savedData = await newPitchEntry.save();

    // 4. Final Success Response
    return res.status(200).json({
      success: true,
      message: "Pitch deck generated and saved successfully",
      dataId: savedData._id, // Database ID bhej rahe hain future use ke liye
      pitchDeck: pitchDeckJson,
    });

  } catch (error) {
    console.error("PitchDeck Controller Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong, please try again",
    });
  }
};

module.exports = { generatePitchDeck };