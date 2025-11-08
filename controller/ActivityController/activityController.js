const { ActivityModel } = require("../../models/ActivityModel/activityModel");

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
module.exports.allActivities = getAllActivities;
