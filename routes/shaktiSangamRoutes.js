const express = require("express");
const {
  registerShaktiSangam,
  getAllShaktiSangam,
} = require("../controller/shaktiSangamController");

const router = express.Router();

// POST route for Shakti Sangam registration
router.post("/register", registerShaktiSangam);
router.get("/getAllRegistrations", getAllShaktiSangam);

module.exports = router;
