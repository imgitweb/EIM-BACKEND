// routes/jobRequestRoutes.js
const express = require("express");
const {
  createJobRequest,
  getJobRequests,
} = require("../controller/jobRequestController");

const router = express.Router();

// POST - Create a new job request
router.post("/", createJobRequest);

// GET - Retrieve all job requests
router.get("/", getJobRequests);

module.exports = router;
