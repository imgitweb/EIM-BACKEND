const OpenAI = require("openai");
require("dotenv").config();
const { CallOpenAi } = require("./helper/helper.js");

exports.generateLeanCanvas = async (req, res) => {
  try {
    const {
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

    // 2. Prompt Engineering (AI ko batana ki kya karna hai)
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

    const parsedData = await CallOpenAi(prompt);
    // console.log("parsedData", parsedData);
    // 4. Send Response
    return res.status(200).json({
      success: true,
      data: parsedData,
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
