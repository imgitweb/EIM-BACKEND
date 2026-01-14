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
Based on the business profile provided below, generate a professional startup pitch deck.

Business Profile:
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
    - Address: ${formData.address || "Not provided"}

Strict Output JSON Structure:
{
  "StartupName": "${formData.businessName}",
  "Who_We_are": "A brief summary of the startup",
  "Problem": "The core problem being solved",
  "Solution0": "Key solution point 1",
  "Solution1": "Key solution point 2",
  "Solution2": "Key solution point 3",
  "Solution3": "Key solution point 4",
  "firstToMarketText": "Explanation of market timing",
  "Market": "Market size and opportunity description",
  "Features": "Detailed list of unique features",
  "ProductOverview": {
    "isUnique": true,
    "isTested": true,
    "firstToMarket": true,
    "hasAdditionalFeatures": true
  },
  "BusinessModel": "How the startup makes money",
  "CompetitionAnalysis": "Brief overview of competitors",
  "GrowthStrategy": "Plan for scaling the business",
  "FundingRequest": "Capital needed and its use",
  "ContactInformation": {
    "Email": "${formData.email}",
    "Mobile": "${formData.mobile}",
    "Address": "${formData.address || 'Not provided'}"
  },
  "team": [
    { "name": "Founding Member 1", "designation": "CEO", "image": "https://via.placeholder.com/150" },
    { "name": "Founding Member 2", "designation": "CTO", "image": "https://via.placeholder.com/150" }
  ]
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