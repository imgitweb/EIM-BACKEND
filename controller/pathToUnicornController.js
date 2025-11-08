const Milestone = require("../models/milestone");
const axios = require("axios");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error(
    "Missing OpenAI API Key. Set it in your .env file as OPENAI_API_KEY."
  );
}

const pathToUnicornController = async (prompt, maxTokens = 4000) => {
  const url = "https://api.openai.com/v1/chat/completions";
  try {
    const response = await axios.post(
      url,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a startup planning assistant. 
            Generate exactly 12 milestones in **strictly valid JSON** format. 
            Ensure the output is a complete and properly formatted JSON object.  Do not include any explanatory text outside the JSON object.  The entire response should be parsable JSON.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = response.data.choices[0].message.content.trim();

    // 1. Check for empty response
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    // 2. Remove any backticks or code fences that LLMs sometimes add
    content = content.replace(/^`*|`*$/g, ""); //Removes backticks from start and end
    content = content.replace(/^json\n|json$/g, ""); //Removes "json" identifier if present

    // 3. Remove any leading/trailing whitespace again (just in case)
    content = content.trim();

    // 4. Robust JSON parsing with error handling:
    try {
      const parsedData = JSON.parse(content);
      return parsedData;
    } catch (jsonError) {
      console.error("Invalid JSON received:", content); // Log the raw content for debugging
      console.error("JSON parsing error:", jsonError); // Log the specific JSON parsing error
      throw new Error(
        "OpenAI returned invalid JSON format: " + jsonError.message
      ); // More informative error
    }
  } catch (error) {
    console.error(
      "Error fetching data from OpenAI:",
      error.response?.data || error.message || error // Log all error details
    );
    throw new Error("Failed to fetch milestones from OpenAI: " + error.message); // Include original error message
  }
};

const getMilestones = async (req, res) => {
  try {
    const reqBody = req.body || {};
    const {
      industry,
      businessModel,
      tam,
      som,
      startDate,
      revenue,
      customers,
      pitch,
      problem,
      solution,
      founder1,
      founder2,
      country,
      revenueStatus,
      startup_id,
    } = reqBody;

    const requiredParams = [
      industry,
      businessModel,
      tam,
      som,
      startDate,
      revenue,
      customers,
      pitch,
      problem,
      solution,
      founder1,
      founder2,
      country,
      revenueStatus,
      startup_id,
    ];

    if (requiredParams.some((param) => param === undefined)) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required parameters." });
    }

    // Check if milestones already exist for this startup
    const existingMilestone = await Milestone.findOne({ startup_id });
    if (existingMilestone) {
      return res.status(200).json({ success: true, data: existingMilestone });
    }

    const prompt = `
      Create a detailed milestone-based plan divided into 12 milestones to help the startup reach unicorn status. 
      Include details such as activities, revenue, valuation, founders' learning, go-to-market strategy, expansion strategy, key actions, and resources.
      - Industry: ${industry}
      - Startup Elevator Pitch: ${pitch}
      - Problem: ${problem}
      - Solution: ${solution}
      - Business Model: ${businessModel}
      - TAM: ${tam}
      - SOM: ${som}
      - Start Date: ${startDate}
      - Founder1: ${founder1}
      - Founder2: ${founder2}
      - Country: ${country}
      - Revenue Status: ${revenueStatus}
      - Revenue: ${revenue}
      - Customers: ${customers}
      
      Return exactly 12 milestones in this specific JSON format:
    {
      "1": {
        "timeline": {
          "startDate": "DD-MM-YYYY",
          "endDate": "DD-MM-YYYY",
          "durationMonths": number
        },
        
        "goal": "string",
        "keyActivities": ["string"],
        "suggestedActions": ["string"],
        "resources": {
          "books": ["string"],
          "tools": ["string"],
          "references": ["string"]
        },        
        "kpis": ["string"],
        "financialProjections": {
          "usd": {
            "revenue": number,
            "investment": number,
            "valuation" : number
          },
          "inr": {
            "revenue": number,
            "investment": number,
             "valuation" : number
          }
        },          
      "2": {
        // Same structure as milestone 1
      },
      "3": {},
      "4": {},
      "5": {},
      "6": {}
    }

    Ensure:
    1. Each milestone has a number key from 1 to 12
    2. Exactly 12 milestones are included
    3. Financial projections increase realistically
    4. Each milestone builds upon previous ones
    5. All dates are properly calculated from the start date
    6. All fields are filled with relevant content
    7. The response is valid JSON that can be parsed
    `;

    const maxTokens = 3500;
    const milestones = await pathToUnicornController(prompt, maxTokens);

    // Save to MongoDB
    const milestoneDoc = new Milestone({
      startup_id,
      industry,
      businessModel,
      tam,
      som,
      startDate,
      revenue,
      customers,
      pitch,
      problem,
      solution,
      founder1,
      founder2,
      country,
      revenueStatus,
      milestones,
    });

    await milestoneDoc.save();

    res.status(201).json({ success: true, data: milestoneDoc });
  } catch (error) {
    console.error("Error generating milestones:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate milestones.",
      error: error.message,
    });
  }
};
const getMilestoneByStartupId = async (req, res) => {
  try {
    const { startup_id } = req.params;

    if (!startup_id) {
      return res
        .status(400)
        .json({ success: false, message: "Startup ID is required." });
    }

    const milestone = await Milestone.findOne({ startup_id });

    console.log("Milestone fetched for startup_id:", startup_id, milestone);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestones not found for this startup.",
      });
    }

    res.status(200).json({ success: true, data: milestone });
  } catch (error) {
    console.error("Error fetching milestones:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch milestones.",
      error: error.message,
    });
  }
};

module.exports = { getMilestones, getMilestoneByStartupId };
