const { activitiesData } = require("../../config/activity");
const { ActivityModel } = require("../../models/ActivityModel/activityModel");
const StartupModel = require("../../models/signup/StartupModel.js");
const { CallOpenAi } = require("../helper/helper");

const generateActivityAssignmentPrompt = ({ planName, activities }) => {
  return `
      You are an expert startup accelerator.

      Plan selected: "${planName}"

      Rules:
      - You MUST include ALL activities from the input. Do not omit, summarize, add, or modify any activity_name or activity_path. The output "activities" array must have EXACTLY ${
        activities.length
      } items, reordered intelligently for this plan.
      - Reorder the full list of activities in a logical sequence for the selected plan (e.g., start with ideation, then validation, market analysis, etc.).
      - Decide accessibleCount based ONLY on the plan: Alpha=1, Beta=3, Gamma=5, Sigma=10. This is the number of INITIAL activities to unlock (first N in your reordered list).
      - All activities must be listed in the output, even if locked (beyond accessibleCount).
      - Return ONLY valid JSON. No other text, markdown, or explanation.
      - Preserve exact activity_name and activity_path from input for each activity.

      Input activities (exactly ${
        activities.length
      } items - reorder all of them):
      ${JSON.stringify(activities, null, 2)}

      Required Output JSON format (activities array must match input length):
      {
        "accessibleCount": number,  // 1 for Alpha, 3 for Beta, 5 for Gamma, 10 for Sigma
        "activities": [
          {
            "activity_name": string,  // Exact from input
            "activity_path": string   // Exact from input (maps to activity_schema in DB)
          }
          // ... exactly ${activities.length} items, reordered
        ]
      }
      `;
};

const generateActivities = async ({ startup_id, planName }) => {
  try {
    const startup = await StartupModel.findById(startup_id);
    if (!startup) throw new Error("Startup not found");

    const exists = await ActivityModel.findOne({ startup_id });
    if (exists) return { message: "Activities already generated" };

    // Validate input data upfront
    if (!Array.isArray(activitiesData) || activitiesData.length === 0) {
      throw new Error("activitiesData is invalid or empty");
    }
    console.log(
      `Generating for ${activitiesData.length} activities with plan: ${planName}`
    );

    const prompt = generateActivityAssignmentPrompt({
      planName,
      activities: activitiesData,
    });

    const aiResponseRaw = await CallOpenAi(prompt);
    console.log("AI response raw:", aiResponseRaw);

    // Assuming CallOpenAi returns a parsed object; if it's a string, add JSON.parse here as fallback
    let aiResponse;
    if (typeof aiResponseRaw === "string") {
      try {
        const cleaned = aiResponseRaw.trim().replace(/```json\n?|\n?```/g, "");
        aiResponse = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
        throw new Error(
          `AI response not valid JSON: ${aiResponseRaw.substring(0, 200)}...`
        );
      }
    } else {
      aiResponse = aiResponseRaw;
    }

    // Enhanced validation with detailed logging
    if (
      !aiResponse ||
      typeof aiResponse !== "object" ||
      !Array.isArray(aiResponse.activities) ||
      typeof aiResponse.accessibleCount !== "number" ||
      aiResponse.activities.length !== activitiesData.length ||
      aiResponse.accessibleCount < 1 ||
      aiResponse.accessibleCount > 10 // Cap based on plans
    ) {
      console.error("Invalid AI response details:");
      console.error("- Expected activities length:", activitiesData.length);
      console.error(
        "- Received activities length:",
        aiResponse?.activities?.length || 0
      );
      console.error("- Received accessibleCount:", aiResponse?.accessibleCount);
      console.error(
        "- Full received response:",
        JSON.stringify(aiResponse, null, 2)
      );
      throw new Error(
        `Invalid AI response: length mismatch (expected ${
          activitiesData.length
        }, got ${aiResponse?.activities?.length || 0}) or other structure issue`
      );
    }

    // Double-check all input activities are present (exact match on names/paths to prevent AI hallucination)
    const inputNames = activitiesData.map((a) => a.activity_name).sort();
    const outputNames = aiResponse.activities
      .map((a) => a.activity_name)
      .sort();
    if (JSON.stringify(inputNames) !== JSON.stringify(outputNames)) {
      throw new Error("AI modified activity names - must preserve exactly");
    }

    const { activities, accessibleCount } = aiResponse;

    const docs = activities.map((act, index) => ({
      startup_id,
      activity_name: act.activity_name,
      activity_schema: act.activity_path,
      order: index + 1,
      week: `Week ${Math.ceil((index + 1) / 3)}`,
      is_completed: false,
      is_accessible: index < accessibleCount,
      is_deleted: false,
    }));

    await ActivityModel.insertMany(docs);

    return {
      message: "Activities generated successfully",
      total: docs.length,
      initiallyAccessible: accessibleCount,
    };
  } catch (error) {
    console.error("❌ generateActivities error:", error);
    throw error;
  }
};

async function getAllActivities(req, res) {
  try {
    const { startup_id } = req.body;

    const activity = await ActivityModel.find({
      startup_id: startup_id,
      is_deleted: false,
    }).lean();
    if (!activity.length) {
      console.log(`No activities found for startup_id: ${startup_id}`);
      return res.status(404).json({
        message: `No activities found for startup_id: ${startup_id}`,
        success: false,
      });
    }
    return res.status(200).json({
      message: "Activities found for startup",
      success: true,
      data: activity,
      activityCount: activity.length,
    });
  } catch (error) {
    console.error("Something went wrong while fetching activities: ", error);
    return res.status(500).json({
      message: "Something went wrong while fetching activities",
      success: false,
    });
  }
}

module.exports = {
  allActivities: getAllActivities,
  generateActivities,
};
