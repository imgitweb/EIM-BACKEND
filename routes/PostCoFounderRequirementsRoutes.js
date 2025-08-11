const express = require("express");
const router = express.Router();
const {
  createRequirement,
  getAllRequirements,
  getRequirementById,
} = require("../controller/PostCoFounderRequirementsController");

// POST - Create a new co-founder requirement
router.post("/", createRequirement);

// GET - Fetch all co-founder requirements
router.get("/", getAllRequirements);

// GET - Fetch a single requirement by ID
router.get("/:id", getRequirementById);

module.exports = router;
