const {
  allActivities,
} = require("../../controller/ActivityController/activityController");

var route = require("express").Router();

route.post("/get-all", allActivities);

module.exports.ActivityRoute = route;
