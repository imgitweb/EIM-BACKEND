const ShaktiSangam = require("../models/shaktiSangamModel");
const sendEmail = require("../utils/sendEmails");

// Controller to save Shakti Sangam registration data and send confirmation email
const registerShaktiSangam = async (req, res) => {
  try {
    const { name, email, mobile, district, occupation, reason } = req.body;

    // Create a new Shakti Sangam registration object
    const newRegistration = new ShaktiSangam({
      name,
      email,
      mobile,
      district,
      occupation,
      reason,
    });

    // Save registration to the database
    await newRegistration.save();

    // Send confirmation email
    await sendEmail(email, name);

    // Send success response
    res.status(201).json({
      message: "Registration successful! A confirmation email has been sent.",
      user: newRegistration,
    });
  } catch (error) {
    console.error("Error saving registration:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllShaktiSangam = async (req, res) => {
  try {
    const data = await ShaktiSangam.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};
module.exports = { registerShaktiSangam, getAllShaktiSangam };
