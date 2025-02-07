require("dotenv").config();
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error(
    "Missing OpenAI API Key. Set it in your .env file as OPENAI_API_KEY."
  );
}

const getAIGeneratedMilestones = async (prompt, maxTokens = 3500) => {
  const url = "https://api.openai.com/v1/chat/completions";

  try {
    const response = await axios.post(
      url,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a startup planning assistant. Generate exactly 12 milestones in a JSON format where each milestone (1-12) is its own separate top-level key. Each response must be properly formatted JSON that can be parsed.",
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

    // Parse the response to ensure it's valid JSON
    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error(
      "Error fetching data from OpenAI:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch milestones from OpenAI.");
  }
};

const getMilestones = async (req, res) => {
  const {
    startDate,
    initialDurationMonths,
    durationIncrement,
    industry,
    businessModel,
    targetAudience,
  } = req.body || {};

  if (
    !startDate ||
    !initialDurationMonths ||
    !durationIncrement ||
    !industry ||
    !businessModel ||
    !targetAudience
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters.",
    });
  }

  const prompt = `
    Create a detailed milestone based plan divided into 12 milestones which will dictate in detail how the startup with following parameters will become a unicorn. Also give us a date exactly when the starutp will become a unicorn. The milestone should be detailed and each milestone will have set of activities,
     targetted revenue, valuation, founders learning required, go to market strategy and expansion strategies,  key activities, suggested actions and resources should be in detailed,  startup roadmap with the following specifications:
    - Industry: "Automobiles"
    - Startup Elevator Pitch: "We are creating an aggregator platform for car repairing service"
    - Problem we are solving: "sdfsdfsdf"
    - Our proposed Solution: "sdfsdfsd"
    - Business Model: "B2C"
    - TAM of this startup: "4 Billion USD"
    - SOM of this startup: "1 billion USD"
    - Start Date: 06-02-2025
    - Founder1 Background: "Electric Engineer with 5 years of industry experience"
    - Fouders2 Background: "Marketing Expert with 3 years of experience" 
    - Startup Current operating country: "India"
    - Is this startup revenue generating yet: "Yes"
    - Last Year's revenue in USD: "100 USD"
    - Number of paid customers as of now: "2"
    

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
      "6": {},
      "7": {},
      "8": {},
      "9": {},
      "10": {},
      "11": {},
      "12": {}
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

  try {
    const maxTokens = 3500;
    const milestones = await getAIGeneratedMilestones(prompt, maxTokens);

    // Verify we have exactly 12 milestones
    const milestoneKeys = Object.keys(milestones);
    if (milestoneKeys.length !== 12) {
      throw new Error("Invalid number of milestones generated");
    }

    res.status(200).json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    console.error("Error generating milestones:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate milestones.",
      error: error.message,
    });
  }
};

module.exports = { getAIGeneratedMilestones, getMilestones };
