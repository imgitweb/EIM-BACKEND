const express = require("express");
const jwt = require("jsonwebtoken");
const Startup = require("./../models/Startup");

const router = express.Router();
const JWT_SECRET = "W-Y?32GTL@P6+MA>B]re;b"; // Replace with a secure key

// Login Route
router.post("/", async (req, res) => {
  const { email_id, password } = req.body;

  try {
    // Find the user by email
    const user = await Startup.findOne({ email_id });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare the plaintext password
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Send response with token
    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
