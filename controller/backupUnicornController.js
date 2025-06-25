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

  const prompt = `You are an expert in entrepreneurship curriculum design.

I am creating a 4-week startup program. Each week is a milestone and should include:

1. A milestone title  
2. A timeline (start date, end date, duration in months)  
3. Four fixed categories:
   - Core Skills
   - Soft Skills
   - Digital Fluency
   - Networking

Each category should contain 3 to 5 short, practical learning tasks tailored for early-stage entrepreneurs.

Please generate JSON data for all 4 weeks in the following format:

{
  "milestone": {
    "title": "Milestone Title",
    "timeline": {
      "startDate": "DD-MM-YYYY",
      "endDate": "DD-MM-YYYY",
      "durationMonths": number
    },
    "categories": {
      "coreSkills": [...],
      "softSkills": [...],
      "digitalFluency": [...],
      "networking": [...]
    }
  }
}`;

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
