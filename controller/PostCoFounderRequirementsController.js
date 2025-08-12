const PostCoFounderRequirement = require("../models/PostCoFounderRequirementModel");

// Create new co-founder requirement
exports.createRequirement = async (req, res) => {
  try {
    const newRequirement = new PostCoFounderRequirement(req.body);
    const savedRequirement = await newRequirement.save();
    res.status(201).json(savedRequirement);
  } catch (error) {
    console.error("Error saving requirement:", error);
    res.status(500).json({ error: "Failed to save co-founder requirement" });
  }
};

// Get all requirements
exports.getAllRequirements = async (req, res) => {
  try {
    const requirements = await PostCoFounderRequirement.find().sort({ createdAt: -1 });
    res.json(requirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    res.status(500).json({ error: "Failed to fetch requirements" });
  }
};

// Get single requirement by ID
exports.getRequirementById = async (req, res) => {
  try {
    const requirement = await PostCoFounderRequirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ error: "Requirement not found" });
    }
    res.json(requirement);
  } catch (error) {
    console.error("Error fetching requirement:", error);
    res.status(500).json({ error: "Failed to fetch requirement" });
  }
};
