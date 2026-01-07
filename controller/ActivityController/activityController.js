const { ActivityModel } = require("../../models/ActivityModel/activityModel");
const StartupModel = require("../../models/signup/StartupModel");
const { activitiesData, stageActivityMap } = require("../../config/activity");

/* ---------------------------------------------------
   CONSTANTS
--------------------------------------------------- */

const STAGE_FLOW = ["Alpha", "Beta", "Gamma", "Sigma"];

function getUnlockedStages(currentStage) {
  const index = STAGE_FLOW.indexOf(currentStage);
  return index >= 0 ? STAGE_FLOW.slice(0, index + 1) : [];
}

function getStageByPath(path) {
  return Object.keys(stageActivityMap).find((stage) =>
    stageActivityMap[stage].includes(path)
  );
}

exports.generateActivities = async ({ startup_id, planName }) => {
  try {
    const startup = await StartupModel.findById(startup_id);
    if (!startup) return "Startup not found";

    const exists = await ActivityModel.findOne({ startup_id });
    if (exists) return "Activities already generated";

    const unlockedStages = getUnlockedStages(planName);
    const unlockedPaths = unlockedStages.flatMap(
      (stage) => stageActivityMap[stage]
    );

    const docs = activitiesData.map((act, index) => {
      const prerequisite =
        index >= 3
          ? activitiesData.slice(index - 3, index).map((a) => ({
              activity_schema: a.activity_path,
              status: false,
            }))
          : [];

      const week = `Week ${Math.floor(index / 5) + 1}`;

      return {
        startup_id,
        activity_name: act.activity_name,
        activity_schema: act.activity_path,
        stage: getStageByPath(act.activity_path) || null,
        order: index + 1,
        prerequisite,
        week,
        is_completed: false,
        is_accessible: unlockedPaths.includes(act.activity_path),
        is_deleted: false,
      };
    });

    console.log("logs", docs);
    await ActivityModel.insertMany(docs);

    return total;
  } catch (error) {
    console.error("generateActivities error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------------
   GET ALL ACTIVITIES (STARTUP)
--------------------------------------------------- */

exports.getAllActivities = async (req, res) => {
  try {
    const { startup_id } = req.body;

    const activities = await ActivityModel.find({
      startup_id,
      is_deleted: false,
    })
      .sort({ order: 1 })
      .lean();

    if (!activities.length)
      return res
        .status(404)
        .json({ success: false, message: "No activities found" });

    return res.json({
      success: true,
      activityCount: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("getAllActivities error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------------
   COMPLETE ACTIVITY
--------------------------------------------------- */

exports.completeActivity = async (req, res) => {
  try {
    const { activity_id } = req.body;

    const activity = await ActivityModel.findById(activity_id);
    if (!activity)
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });

    if (!activity.is_accessible)
      return res
        .status(403)
        .json({ success: false, message: "Activity is locked" });

    const pendingPrereq = activity.prerequisite.filter((p) => !p.status);
    if (pendingPrereq.length)
      return res.status(400).json({
        success: false,
        message: "Complete prerequisite activities first",
        pending: pendingPrereq.map((p) => p.activity_schema),
      });

    activity.is_completed = true;
    await activity.save();

    await unlockNextActivities(activity.startup_id, activity.activity_schema);

    return res.json({
      success: true,
      message: "Activity completed successfully",
    });
  } catch (error) {
    console.error("completeActivity error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------------
   UNLOCK NEXT ACTIVITIES
--------------------------------------------------- */

async function unlockNextActivities(startup_id, completedSchema) {
  const activities = await ActivityModel.find({ startup_id });

  for (const act of activities) {
    let changed = false;

    act.prerequisite.forEach((p) => {
      if (p.activity_schema === completedSchema) {
        p.status = true;
        changed = true;
      }
    });

    if (changed) {
      const allDone = act.prerequisite.every((p) => p.status);
      if (allDone && !act.is_accessible) act.is_accessible = true;
      await act.save();
    }
  }
}

/* ---------------------------------------------------
   UPGRADE STAGE (ADMIN / SYSTEM)
--------------------------------------------------- */

exports.upgradeStage = async (req, res) => {
  try {
    const { startup_id, newStage } = req.body;

    if (!STAGE_FLOW.includes(newStage))
      return res.status(400).json({ success: false, message: "Invalid stage" });

    const unlockPaths = stageActivityMap[newStage];

    await ActivityModel.updateMany(
      { startup_id, activity_schema: { $in: unlockPaths } },
      { $set: { is_accessible: true } }
    );

    return res.json({
      success: true,
      message: `Startup upgraded to ${newStage}`,
    });
  } catch (error) {
    console.error("upgradeStage error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
