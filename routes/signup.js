const express = require("express");
const multer = require("multer");
const Startup = require("../models/Startup");
const router = express.Router();

// Set up multer for parsing `form-data`
const upload = multer(); // Use multer's memory storage or configure as needed

router.post("/", upload.none(), async (req, res) => {
  const {
    startup_name,
    email_id,
    mobile_no,
    country,
    industry,
    startup_stage,
    city_name,
    startup_idea,
    password,
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await Startup.findOne({ email_id });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Create and save new user
    const newStartup = new Startup({
      startup_name,
      email_id,
      mobile_no,
      country,
      industry,
      startup_stage,
      city_name,
      startup_idea,
      password: password,
    });

    await newStartup.save();
    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
