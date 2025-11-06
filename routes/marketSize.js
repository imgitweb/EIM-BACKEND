const express = require("express");
const router = express.Router();
const getMarketSize = require("../controller/marketSizeController");
router.post("/market_size", getMarketSize);

module.exports = router;
