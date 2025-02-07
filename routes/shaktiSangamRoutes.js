const express = require("express");
const {
  registerShaktiSangam,
} = require("../controller/shaktiSangamController");

const router = express.Router();

// POST route for Shakti Sangam registration
router.post("/register", registerShaktiSangam);

module.exports = router;
