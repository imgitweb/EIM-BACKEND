const StartupModel = require("../models/signup/StartupModel");
const { ActivityModel } = require("../models/ActivityModel/activityModel");
const { activitiesData } = require("../config/activity");
const { planOrderMap } = require("../config/planOrder");

module.exports.seedActivities = async () => {
  try {
    const startups = await StartupModel.find();

    for (const startup of startups) {
      const exists = await ActivityModel.findOne({
        startup_id: startup._id,
      });
      if (exists) continue;

      const plan = startup.plan || "alpha";

      const priorityNames = planOrderMap[plan] || [];

      // 🔁 reorder activities
      const orderedActivities = [
        ...activitiesData.filter((a) => priorityNames.includes(a.name)),
        ...activitiesData.filter((a) => !priorityNames.includes(a.name)),
      ];

      const activities = orderedActivities.map((act, index) => ({
        startup_id: startup._id,
        activity_name: act.name,
        activity_schema: act.route,
        order: index + 1,
        week: `Week ${Math.ceil((index + 1) / 3)}`,
        is_completed: false,
        is_accessable: index === 0, // ✅ only first unlocked
        is_deleted: false,
      }));

      await ActivityModel.insertMany(activities);

      console.log(
        `✅ ${startup.startupName} (${plan}) → ${activities.length} activities`
      );
    }

    console.log("🎉 Activity seeding complete");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
};
