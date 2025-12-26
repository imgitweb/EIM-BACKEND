// routes/startupHireTeamRoutes.js
const express = require("express");
const router = express.Router();
const {createStartupHireTeam} = require("../controller/startupHireTeamController")

// Public route (no auth) — allow anonymous job submissions
router.post("/", createStartupHireTeam);

module.exports = router;
