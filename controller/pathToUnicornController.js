require("dotenv").config();
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Use environment variable for API Key

if (!OPENAI_API_KEY) {
  throw new Error(
    "Missing OpenAI API Key. Set it in your .env file as OPENAI_API_KEY."
  );
}

// Function to fetch AI-generated milestones
const getAIGeneratedMilestones = async (prompt, maxTokens = 1500) => {
  const url = "https://api.openai.com/v1/chat/completions";

  try {
    const response = await axios.post(
      url,
      {
        model: "gpt-3.5-turbo", // Choose between gpt-4 or gpt-3.5-turbo
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens, // Adjust token limit as needed
        temperature: 0.7, // Creativity level
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content; // Return AI-generated content
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
    totalMilestones,
    initialDurationMonths,
    durationIncrement,
    industry,
    businessModel,
    targetAudience,
  } = req.body || {};

  // Check if required fields are present
  if (
    !startDate ||
    !totalMilestones ||
    !initialDurationMonths ||
    !durationIncrement ||
    !industry ||
    !businessModel ||
    !targetAudience
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required parameters: startDate, totalMilestones, initialDurationMonths, durationIncrement, industry, businessModel, or targetAudience.",
    });
  }

  // Create the AI prompt dynamically
  const prompt = `
    I am the founder of a startup in the ${industry} industry, focusing on a ${businessModel} business model, and targeting ${targetAudience}.
    I aim to grow this startup into a unicorn over the next ${totalMilestones} months.
    Create a roadmap with milestones that help me achieve this goal. 
    Each milestone should include:
    - A specific goal to achieve
    - Key activities to accomplish the goal
    - Suggested actions, resources, or strategies to help achieve the goal
    - Books, tools, or references that could be useful
    - Metrics or key performance indicators (KPIs) to measure progress
    The first milestone should start from ${startDate}, with an initial duration of ${initialDurationMonths} months for the first milestone, and the duration should increase by ${durationIncrement} months for each subsequent milestone.
    Provide timelines in both months and specific dates, and include financial growth projections in USD and INR at each milestone.
    Ensure the roadmap is suitable for a startup that aims to scale quickly, considering the unique challenges of the ${industry} sector.
    Generate each milestone in separate React variables in JSON format.
  `;

  try {
    // Fetch AI-generated milestones
    const maxTokens = 3000; // Set higher max tokens to accommodate detailed responses
    const milestones = await getAIGeneratedMilestones(prompt, maxTokens);

    // Respond with the milestones
    res.status(200).json({
      success: true,
      milestones,
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
