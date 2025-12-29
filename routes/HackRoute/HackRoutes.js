const express = require("express");
const router = express.Router();
const TeamRegistration = require("../../models/Hackthon/RegistrationModel");
const sendMail = require("../../utils/hackMail");
router.post("/hackathon-register", async (req, res) => {
  try {
    const data = req.body;

    if (!data.leader?.email || !data.leader?.phone) {
      return res.status(400).json({
        success: false,
        message: "Leader details missing",
      });
    }

    const existing = await TeamRegistration.findOne({
      "leader.email": data.leader.email,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const registration = new TeamRegistration(data);
    await registration.save();

    // 📧 SEND EMAIL TO TEAM LEADER
    await sendMail(
      data.leader.email,
      `${data.leader.firstName} ${data.leader.lastName}`,
      data.teamConfig.size,
      data.teamConfig.track
    );

    res.status(201).json({
      success: true,
      message: "Team registered successfully & email sent",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
