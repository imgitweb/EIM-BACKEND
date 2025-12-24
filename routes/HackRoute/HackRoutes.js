const express = require("express");
const router = express.Router();

const Registration = require("../../models/Hackthon/RegistrationModel"); // ✅ Model import

router.post("/hackathon-register", async (req, res) => {
  try {
    const data = req.body;

    const newRegistration = new Registration(data);

    await newRegistration.save();

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      id: newRegistration._id,
    });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again.",
    });
  }
});

module.exports = router;
