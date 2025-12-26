const { CallOpenAi } = require("./helper/helper");
const Milestone = require("../models/milestone");
const axios = require("axios");
require("dotenv").config();

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

    console.log("Received request body for generating milestones:", reqBody);

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

    const prompt = `
          Generate a detailed 4-milestone roadmap for a startup to reach unicorn status. 
          Use the startup details provided and return ONLY a valid JSON object (no extra text).

          Startup Details:
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

          Output Format (JSON only, exactly 4 milestones: "1" to "4"):

          {
            "1": {
              "keyActivities": ["string"],
              "resources": {
                "books": ["string"],
                "tools": ["string"],
                "references": ["string"]
              },
              "financialProjections": {
                "usd": {
                  "revenue": number,
                  "investment": number,
                  "valuation": number
                },
                "inr": {
                  "revenue": number,
                  "investment": number,
                  "valuation": number
                }
              }
            },
            "2": {},
            "3": {},
            "4": {},
          }

          Rules:
          1. Provide exactly 4 milestones numbered "1" to "4".
          2. Each milestone builds on the previous one.
          3. Dates must progress sequentially from the start date.
          4. Financial projections must grow realistically for each milestone.
          5. All fields must be filled with relevant content.
          6. JSON must be valid and parseable — do not include explanations or extra text outside JSON.
          `;

    const milestones = await CallOpenAi(prompt);

    let existingMilestone = await Milestone.findOne({ startup_id });

    if (existingMilestone) {
      // ✅ Update only milestones field
      existingMilestone.milestones = milestones;
      existingMilestone.updatedAt = new Date();
      await existingMilestone.save();

      return res.status(200).json({
        success: true,
        message: "Milestones updated successfully.",
        data: existingMilestone,
      });
    }

    // ✅ Create new record
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

    res.status(201).json({
      success: true,
      message: "Milestones generated successfully.",
      data: milestoneDoc,
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

const getMilestoneByStartupId = async (req, res) => {
  try {
    const { startup_id } = req.params;

    if (!startup_id) {
      return res
        .status(400)
        .json({ success: false, message: "Startup ID is required." });
    }

    const milestone = await Milestone.findOne({ startup_id });

    console.dir(milestone, { depth: null });

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
