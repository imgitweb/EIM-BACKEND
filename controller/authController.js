const User = require("../models/userModel");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
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
      usertype,
    } = req.body;

    // Validate required fields
    if (
      !startup_name ||
      !email_id ||
      !mobile_no ||
      !country_name ||
      !industry ||
      !stage ||
      !city_name ||
      !startup_idea ||
      !password ||
      !usertype
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate users
    const userExists = await User.findOne({
      $or: [{ email_id }, { mobile_no }, { startup_name }],
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with these details already exists" });
    }

    // Create a new user
    const newUser = new User({
      startup_name,
      email_id,
      mobile_no,
      country_name,
      industry,
      stage,
      city_name,
      startup_idea,
      usertype,
      password: md5(password), // Hash password with MD5
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login API
const login = async (req, res) => {
  try {
    console.log("Incoming Login Request:", req.body); // Log request for debugging

    const { email_id, password } = req.body;

    // Validate required fields
    if (!email_id || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Authenticate user
    const user = await User.findOne({ email_id, password: md5(password) });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email_id: user.email_id },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "24h" }
    );

    const { password: pwt, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token: token,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { signup, login };
