const BusinessModel = require("../models/OfferingModel/BusinessModel"); // Ensure this path matches your file structure
require("dotenv").config();
const { CallOpenAi } = require("./helper/helper.js");

// --- 1. GENERATE AND SAVE LEAN CANVAS ---
exports.generateLeanCanvas = async (req, res) => {
  try {
    const {
      userId, // Added: specific user ID
      serviceIds, // Added: array of service IDs
      profileIds, // Added: array of customer profile IDs
      businessName,
      businessType,
      services,
      targetLocation,
      bootstrapFund,
    } = req.body;

    // 1. Validation
    if (!businessName || !businessType) {
      return res.status(400).json({
        success: false,
        message: "Business Name and Type are required",
      });
    }

    // 2. Prompt Engineering
    const prompt = `
      Act as an expert Startup Consultant. Create a "Lean Canvas Business Model" for a startup with the following details:
      
      - Name: ${businessName}
      - Industry/Type: ${businessType}
      - Key Services/Products: ${services}
      - Target Location: ${targetLocation}
      - Initial Funding: ${bootstrapFund}

      Output must be a valid JSON object with the following specific keys. Keep descriptions concise (2-3 sentences max per key).
      
      JSON Structure:
      {
        "Problem": "Top 3 problems the user faces",
        "Solution": "Top 3 features that solve the problems",
        "Unique Value Proposition": "Single, clear, compelling message that turns an unaware visitor into an interested prospect",
        "Customer Segments": "Target customers",
        "Key Metrics": "Key activities you measure",
        "Channels": "Path to customers",
        "Cost Structure": "Customer Acquisition costs, Distribution costs, Hosting, People, etc.",
        "Revenue Streams": "Revenue Model, Life Time Value, Revenue, Gross Margin"
      }
    `;

    // 3. Call AI
    const parsedData = await CallOpenAi(prompt);

    // 4. Save to Database
    let savedModel = null;
    if (userId && parsedData) {
      const newEntry = new BusinessModel({
        userId,
        serviceIds: serviceIds || [], // Save linked Service IDs
        profileIds: profileIds || [], // Save linked Profile IDs
        businessName,
        businessType,
        generatedCanvas: parsedData,
      });

      savedModel = await newEntry.save();
    }

    // 5. Send Response
    return res.status(200).json({
      success: true,
      data: parsedData,
      savedId: savedModel ? savedModel._id : null,
      message: "Business Model generated and saved successfully.",
    });
  } catch (error) {
    console.error("Error generating business model:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate business model. Please try again.",
      error: error.message,
    });
  }
};

// --- 2. GET LATEST 3 MODELS (History) ---
exports.getLatestModels = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch last 3 created documents for this user, sorted by newest
    const history = await BusinessModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching model history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch history.",
      error: error.message,
    });
  }
};
