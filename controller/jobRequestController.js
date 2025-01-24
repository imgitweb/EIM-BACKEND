// controllers/jobRequestController.js
const JobRequest = require("../models/jobRequestModel");

// Create a new job request
const createJobRequest = async (req, res) => {
  try {
    const { jobTitle, experienceRequired, skills, jobLocation, salary } =
      req.body;

    // Validate input
    if (
      !jobTitle ||
      !experienceRequired ||
      !skills ||
      !jobLocation ||
      !salary
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (experienceRequired < 1) {
      return res
        .status(400)
        .json({ message: "Experience must be at least 1 year." });
    }

    const newJobRequest = new JobRequest({
      jobTitle,
      experienceRequired,
      skills,
      jobLocation,
      salary,
    });

    await newJobRequest.save();
    res.status(201).json({
      message: "Job request created successfully!",
      jobRequest: newJobRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating job request.", error: error.message });
  }
};

// Get all job requests
const getJobRequests = async (req, res) => {
  try {
    const jobRequests = await JobRequest.find();
    res.status(200).json(jobRequests);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving job requests.",
      error: error.message,
    });
  }
};

module.exports = { createJobRequest, getJobRequests };
