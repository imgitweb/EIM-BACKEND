const express = require("express");
const router = express.Router();
const { getFunnelData, createFunnelData } = require("../controller/salesFunnelController");

router.get("/api/sales-funnel", getFunnelData);
router.post("/api/sales-funnel", createFunnelData);

module.exports = router;