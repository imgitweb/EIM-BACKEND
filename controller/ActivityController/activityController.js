const { activitiesData } = require("../../config/activity");
const { ActivityModel } = require("../../models/ActivityModel/activityModel");
const StartupModel = require("../../models/signup/StartupModel.js");
const { CallOpenAi } = require("../helper/helper");

const generateActivityAssignmentPrompt = ({ planName, activities }) => {
  return `
      You are a senior Incubation Manager, who will decide the set of activities startup needs to perform in this stage.

      Plan selected: "${planName}"
      This is the general definition of plan - 
      Alpha: Ideation-stage startups validating the problem and solution, with no MVP built yet.
      Beta: Early-stage startups with an MVP, testing the product, acquiring early users, and working towards Product–Market Fit (PMF).
      Gamma: PMF-stage startups with proven demand, focused on growth, market expansion, and fundraising.
      Sigma Growth-stage startups scaling operations, revenues, and teams, while raising capital for large-scale expansion.
      Optional (Sharper, slightly more aspirational tone)
    

      Rules:
      - You MUST include ALL activities from the input. Do not omit, summarize, add, or modify any activity_name or activity_path. The output "activities" array must have EXACTLY ${
        activities.length
      } items, reordered intelligently for this plan.
      - Reorder the full list of activities in a logical sequence for the selected plan (e.g., start with ideation, then validation, market analysis, etc.).
      - All activities must be listed in the output, even if locked .
      - Return ONLY valid JSON. No other text, markdown, or explanation.
      - Preserve exact activity_name and activity_path from input for each activity.

      Input activities (exactly ${
        activities.length
      } items - reorder all of them):
      ${JSON.stringify(activities, null, 2)}

      Required Output JSON format (activities array must match input length):
      {
        "activities": [
          {
            "activity_name": string,  // Exact from input

            "activity_path": string   // Exact from input (maps to activity_schema in DB)
            "prerequisite" : [] // in this analyse all routes and add 3 prerequisite,
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

    const inputNames = activitiesData.map((a) => a.activity_name).sort();
    const outputNames = aiResponse.activities
      .map((a) => a.activity_name)
      .sort();
    if (JSON.stringify(inputNames) !== JSON.stringify(outputNames)) {
      throw new Error("AI modified activity names - must preserve exactly");
    }

    const { activities } = aiResponse;

    const docs = activities.map((act, index) => ({
      startup_id,
      activity_name: act.activity_name,
      activity_schema: act.activity_path,
      order: index + 1,
      week: `Week ${Math.ceil((index + 1) / 3)}`,
      prerequisite: (act.prerequisite || []).map((p) => ({
        activity_schema: p,
        status: false, // default false
      })),
      is_completed: false,
      is_accessible: false,
      is_deleted: false,
    }));

    await ActivityModel.insertMany(docs);

    return {
      message: "Activities generated successfully",
      total: docs.length,
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

async function completeActivity(req, res) {
  try {
    const { activity_id } = req.body;

    const activity = await ActivityModel.findById(activity_id);
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    const incompletePrereq = activity.prerequisite.filter((p) => !p.status);

    if (incompletePrereq.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please complete prerequisite activities first",
        pendingPrerequisites: incompletePrereq.map((p) => p.activity_schema),
      });
    }

    activity.is_completed = true;
    await activity.save();
    await unlockNextActivities(activity.startup_id, activity.activity_schema);
    return res.status(200).json({
      success: true,
      message: "Activity completed successfully",
    });
  } catch (error) {
    console.error("completeActivity error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function unlockNextActivities(startup_id, completedSchema) {
  const activities = await ActivityModel.find({ startup_id });

  for (const act of activities) {
    let updated = false;

    act.prerequisite.forEach((p) => {
      if (p.activity_schema === completedSchema) {
        p.status = true;
        updated = true;
      }
    });

    // agar update hua, check all prerequisites
    if (updated) {
      const allDone = act.prerequisite.every((p) => p.status === true);
      if (allDone) {
        act.is_accessible = true;
      }
      await act.save();
    }
  }
}

module.exports = {
  allActivities: getAllActivities,
  generateActivities,
  unlockNextActivities,
  completeActivity,
};
