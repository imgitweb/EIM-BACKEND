const express = require("express");
const { generatePitchDeck } = require("../controller/pitchDeckcontroller");

const router = express.Router();

// POST => /api/pitchdeck/generate
router.post("/generate", generatePitchDeck);

module.exports = router;
