const { activitiesData } = require("../../config/activity");
const { ActivityModel } = require("../../models/ActivityModel/activityModel");
const StartupModel = require("../../models/signup/StartupModel.js");
const { CallOpenAi } = require("../helper/helper");

const generateActivityAssignmentPrompt = ({ planName, activities }) => {
  return `
      You are an expert startup accelerator.

      Plan selected: "${planName}"

      Rules:
      - All activities must be included
      - Reorder activities intelligently for this plan
      - Decide how many activities should be initially accessible
      - Alpha → 1 accessible
      - Beta → 3 accessible
      - Gamma → 5 accessible  // Fixed typo: "Gama" -> "Gamma"
      - Sigma → 10 accessible
      - Remaining activities must be locked
      - Return ONLY valid JSON
      - No markdown
      - No explanation

      Input activities:
      ${JSON.stringify(activities, null, 2)}

      Required Output JSON format:
      {
        "accessibleCount": number,
        "activities": [
          {
            "activity_name": string,
            "activity_path": string  // Note: Maps to activity_schema in DB
          }
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

    const prompt = generateActivityAssignmentPrompt({
      planName,
      activities: activitiesData,
    });

    const aiResponseRaw = await CallOpenAi(prompt);
    const aiResponse = JSON.parse(aiResponseRaw);

    if (
      !aiResponse ||
      !Array.isArray(aiResponse.activities) ||
      typeof aiResponse.accessibleCount !== "number" ||
      aiResponse.activities.length !== activitiesData.length
    ) {
      throw new Error("Invalid AI response structure");
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
    const { startup_id } = req.params;
    tatus(403).json({ error: "Unauthorized" });

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
