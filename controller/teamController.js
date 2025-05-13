const Team = require("../models/teamModel");

const create = async (req, res) => {
  try {
    const {
      email,
      member_name,
      mobile,
      designation,
      job_type,
      joining_date,
      salary,
      startup_id,
    } = req.body;

    // Validate required fields
    if (
      !email ||
      !member_name ||
      !mobile ||
      !designation ||
      !job_type ||
      !joining_date ||
      !salary ||
      !startup_id
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate mobile number format
    const isValidMobile = /^\d{10}$/.test(mobile);
    if (!isValidMobile) {
      return res.status(400).json({
        message: "Invalid mobile number format. Must be a 10-digit number.",
      });
    }

    // Check if a team member already exists with the given email
    console.log("Checking if team exists with email:", email);
    const teamExist = await Team.findOne({ email });
    if (teamExist) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Create a new team member
    const newTeam = new Team({
      member_name,
      email,
      mobile,
      designation,
      job_type,
      joining_date,
      salary,
      startup_id,
    });

    console.log("Saving new team data:", newTeam);

    // Save to the database
    const saveData = await newTeam.save();
    res
      .status(201)
      .json({ message: "Team member created successfully!", data: saveData });
  } catch (error) {
    console.error("Error during team creation:", error);
    res.status(500).json({
      message: "An error occurred while creating the team member.",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getAllTeamById = async (req, res) => {
  try {
    const { startup_id } = req.params; // Get startup_id from URL parameters
    const teamDetails = await Team.find({ startup_id }); // Find by startup_id

    if (!teamDetails || teamDetails.length === 0) {
      return res.status(404).json({ message: "Team Details Not Found" }); // 404 for not found
    }

    res.status(200).json(teamDetails); // Send team details
  } catch (error) {
    res.status(500).json({ errorMessage: error.message, stack: error.stack }); // 500 for server errors
  }
};

const getAllTeamByTeamId = async (req, res) => {
  try {
    const { id } = req.params; // Extract `id` from URL parameters

    // Use findById with the correct format (a string, not an object)
    const teamDetails = await Team.findById(id);

    // Check if the document exists
    if (!teamDetails) {
      return res.status(404).json({ message: "Team Details Not Found" });
    }

    // Return the team details
    res.status(200).json(teamDetails);
  } catch (error) {
    console.error("Error fetching team details by ID:", error); // Log for debugging
    res.status(500).json({ errorMessage: error.message, stack: error.stack });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params; // Get the `id` from URL parameters

    // Validate if `id` is provided
    if (!id) {
      return res.status(400).json({ message: "Team member ID is required" });
    }

    // Validate request body (you can add more specific validations if needed)
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Update data is required" });
    }

    // Check if the team member exists
    const teamDetails = await Team.findById(id); // Use `findById` for efficiency
    if (!teamDetails) {
      return res.status(404).json({ message: "Team member not found" }); // 404 if not found
    }

    // Update the team member and return the updated document
    const updatedTeamMember = await Team.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate the updated fields against the schema
    });

    // Respond with the updated team member details
    res.status(200).json({
      message: "Team member updated successfully",
      data: updatedTeamMember,
    });
  } catch (error) {
    console.error("Error updating team member:", error); // Log error for debugging
    res
      .status(500)
      .json({ errorMessage: "Internal server error", details: error.message });
  }
};

module.exports = { create, getAllTeamById, updateTeam, getAllTeamByTeamId };
