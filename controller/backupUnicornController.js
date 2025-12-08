require("dotenv").config();
const axios = require("axios");
const { CallOpenAi } = require("./helper/helper");

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
    const milestones = await CallOpenAi(prompt);

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
