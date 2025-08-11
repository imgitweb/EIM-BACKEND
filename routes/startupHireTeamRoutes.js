// routes/startupHireTeamRoutes.js
const express = require("express");
const router = express.Router();
const {createStartupHireTeam} = require("../controller/startupHireTeamController")

// POST route to save form data
router.post("/", createStartupHireTeam);

module.exports = router;
