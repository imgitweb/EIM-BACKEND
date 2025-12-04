const express = require('express');
const router = express.Router();
const { calculateAndSaveValuation } = require('../controller/valuationController');

router.post('/calculate', calculateAndSaveValuation);

module.exports = router;