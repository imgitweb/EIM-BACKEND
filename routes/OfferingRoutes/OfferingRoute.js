const express = require("express");
const router = express.Router();
const Offering = require("../../models/OfferingModel/StartupOffering");
const Profile = require("../../models/OfferingModel/CustomerProfile");
router.get("/startup-offerings/:id", async (req, res) => {
  try {
    const startupId = req.params.id;
    const data = await Offering.find({ startupId: startupId }).sort({
      createdAt: -1,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/startup-offerings", async (req, res) => {
  try {
    const newOffering = new Offering(req.body);
    const saved = await newOffering.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.post("/customer-profiles", async (req, res) => {
  try {
    const newOffering = new Profile(req.body);
    const saved = await newOffering.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.get("/customer-profiles/:id", async (req, res) => {
  try {
    const startupId = req.params.id;
    const data = await Profile.find({ startupId: startupId }).sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
