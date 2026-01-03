const express = require("express");
const router = express.Router();
const {
  calculateAndSaveValuation,
} = require("../controller/valuationController");
const { gtm_strategy } = require("../controller/GTM-strategy/gtm_controller");

router.post("/calculate", calculateAndSaveValuation);
router.post("/gtm-strategy", gtm_strategy);
module.exports = router;
