const { getMileStoneData } = require("../../controller/milistoneController");
var route = require("express").Router();

route.post("/startup", getMileStoneData);

module.exports.milestoneRoutes = route;
