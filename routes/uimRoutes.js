const express = require("express");
const router = express.Router();
const UimRegister = require("../models/UimRegister");

router.post("/register", async (req, res) => {
  try {
    const newUser = new UimRegister(req.body);
    await newUser.save();
    res.status(201).json({ message: "Registration saved to DB" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving registration", error });
  }
});

module.exports = router