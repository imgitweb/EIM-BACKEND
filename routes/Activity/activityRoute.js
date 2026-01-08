const {
  getAllActivities,
  completeActivity,
  generateActivities,
} = require("../../controller/ActivityController/activityController");

var route = require("express").Router();

route.post("/get-all", getAllActivities);
route.post("/activity/complete", completeActivity);
route.post("/activity/generate", generateActivities);

module.exports.ActivityRoute = route;
