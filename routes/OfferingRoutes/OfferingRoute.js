const express = require("express");
const router = express.Router();

const Offering = require("../../models/OfferingModel/StartupOffering");
const Profile = require("../../models/OfferingModel/CustomerProfile");

// --- ROUTES ---

// 1. Get All Offerings for a specific Startup
router.get("/startup-offerings/:id", async (req, res) => {
  try {
    const startupId = req.params.id;

    // CHANGE: findById hata kar find() use karein filter ke sath
    // NOTE: Check karein ki aapke Model me field ka naam 'startupId' hai ya 'userId'
    const data = await Offering.find({ startupId: startupId }).sort({
      createdAt: -1,
    });

    // Note: Agar array empty hai to bhi 200 OK bhejna chahiye (empty list)
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Create New Offering
router.post("/startup-offerings", async (req, res) => {
  try {
    // Make sure req.body me 'startupId' aa raha ho frontend se
    const newOffering = new Offering(req.body);
    const saved = await newOffering.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Get All Profiles for a specific Startup
router.get("/customer-profiles/:id", async (req, res) => {
  try {
    const startupId = req.params.id;

    // CHANGE: findById hata kar find() use karein
    const data = await Profile.find({ startupId: startupId }).sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Create New Profile
router.post("/customer-profiles", async (req, res) => {
  try {
    const newProfile = new Profile(req.body);
    const saved = await newProfile.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
