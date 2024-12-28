const User = require("../models/userModel");
const md5 = require("md5");

// Signup API
const signup = async (req, res) => {
  try {
    const {
      startup_name,
      email_id,
      mobile_no,
      country_name,
      industry,
      stage,
      city_name,
      startup_idea,
      password,
    } = req.body;

    // Check for required fields
    if (
      !startup_name ||
      !email_id ||
      !mobile_no ||
      !country_name ||
      !industry ||
      !stage ||
      !city_name ||
      !startup_idea ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicates
    const userExists = await User.findOne({
      $or: [{ email_id }, { mobile_no }, { startup_name }],
    });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with these details already exists" });
    }

    // Save user
    const newUser = new User({
      startup_name,
      email_id,
      mobile_no,
      country_name,
      industry,
      stage,
      city_name,
      startup_idea,
      password: md5(password), // Encrypt password
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login API
const login = async (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body); // Debugging request body

    const { email_id, password } = req.body;

    // Check for required fields
    if (!email_id || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Validate user
    const user = await User.findOne({ email_id, password: md5(password) });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res
      .status(200)
      .json({ message: "Login successful", token: "fake-jwt-token" }); // Simulated token for demo
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { signup, login };
