const { ActivityModel } = require("../../models/ActivityModel/activityModel");
const StartupModel = require("../../models/signup/StartupModel");
const {
  activitiesData,
  stagedefaltfalseActivityMap,
} = require("../../config/activity");

const STAGE_FLOW = ["alpha", "beta", "gamma", "sigma"];

/* ============================== HELPERS ============================== */

// Stage-based HARD access control
function isAccessibleByStage(stage, path) {
  if (!stagedefaltfalseActivityMap[stage]) return true;
  return !stagedefaltfalseActivityMap[stage].includes(path);
}

/* ========================= GENERATE ACTIVITIES ======================= */

exports.generateActivities = async ({ startup_id, planName }) => {
  const startup = await StartupModel.findById(startup_id);
  if (!startup) throw new Error("Startup not found");

  const docs = activitiesData.map((act, index) => ({
    startup_id,
    activity_name: act.activity_name,
    activity_schema: act.activity_path,
    order: index + 1,

    prerequisite: activitiesData
      .slice(Math.max(0, index - 3), index)
      .map((p) => ({
        activity_schema: p.activity_path,
        status: false,
      })),

    is_accessible: isAccessibleByStage(planName, act.activity_path),

    is_completed: false,
    is_deleted: false,
  }));

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: {
        startup_id: doc.startup_id,
        activity_schema: doc.activity_schema,
      },
      update: { $setOnInsert: doc },
      upsert: true,
    },
  }));

  await ActivityModel.bulkWrite(ops, { ordered: false });

  return { success: true };
};

/* =========================== GET ALL ACTIVITIES ====================== */

exports.getAllActivities = async (req, res) => {
  const { startup_id } = req.body;
  console.log("Startup ID:", startup_id);

  const activities = await ActivityModel.find({
    startup_id,
    is_deleted: false,
  })
    .sort({ order: 1 })
    .lean();

  const data = activities.map((act) => {
    const blocked = act.prerequisite.filter((p) => !p.status);

    return {
      activity_name: act.activity_name,
      activity_path: act.activity_schema,
      is_accessible: act.is_accessible,
      is_completed: act.is_completed,
      can_proceed: act.is_accessible && blocked.length === 0,
      prerequisites: act.prerequisite,
      blocked_by_prerequisite: blocked.map((b) => b.activity_schema),
    };
  });

  res.json({
    success: true,
    activityCount: data.length,
    data,
  });
};

/* =========================== COMPLETE ACTIVITY ======================== */

exports.completeActivity = async (req, res) => {
  const { activity_id } = req.body;

  const activity = await ActivityModel.findById(activity_id);
  if (!activity)
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });

  // HARD STAGE CHECK
  if (!activity.is_accessible)
    return res.status(403).json({
      success: false,
      message: "Activity locked by stage",
    });

  const blocked = activity.prerequisite.filter((p) => !p.status);
  if (blocked.length)
    return res.status(400).json({
      success: false,
      blocked_by_prerequisite: blocked.map((b) => b.activity_schema),
    });

  activity.is_completed = true;
  await activity.save();

  // Mark this activity as completed in future prerequisites
  await ActivityModel.updateMany(
    {
      startup_id: activity.startup_id,
      "prerequisite.activity_schema": activity.activity_schema,
    },
    { $set: { "prerequisite.$.status": true } }
  );

  res.json({ success: true });
};

/* ============================ UPGRADE STAGE =========================== */

exports.upgradeStage = async (req, res) => {
  const { startup_id, newStage } = req.body;

  if (!STAGE_FLOW.includes(newStage))
    return res.status(400).json({
      success: false,
      message: "Invalid stage",
    });

  const lockedPaths = stagedefaltfalseActivityMap[newStage] || [];

  // Lock stage-blocked activities
  await ActivityModel.updateMany(
    {
      startup_id,
      activity_schema: { $in: lockedPaths },
    },
    { $set: { is_accessible: false } }
  );

  // Unlock remaining activities
  await ActivityModel.updateMany(
    {
      startup_id,
      activity_schema: { $nin: lockedPaths },
    },
    { $set: { is_accessible: true } }
  );

  res.json({ success: true });
};
