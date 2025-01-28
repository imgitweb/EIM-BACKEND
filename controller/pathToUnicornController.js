// Your OpenAI API Key
const axios = require("axios");
const OPENAI_API_KEY =
  "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";

// Function to fetch AI-generated milestones
const getAIGeneratedMilestones = async (prompt) => {
  const url = "https://api.openai.com/v1/chat/completions";

  try {
    const response = await axios.post(
      url,
      {
        model: "gpt-3.5-turbo", // Choose between gpt-4 or gpt-3.5-turbo
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500, // Adjust token limit as needed
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
      I aim to grow this startup into a unicorn over the next 12 months. 
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
    `;

  try {
    // Fetch AI-generated milestones
    const milestones = await getAIGeneratedMilestones(prompt);

    // Respond with the milestones
    res.status(200).json({
      success: true,
      milestones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate milestones.",
      error: error.message,
    });
  }
};
module.exports = { getAIGeneratedMilestones, getMilestones };
