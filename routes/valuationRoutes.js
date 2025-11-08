const express = require('express');
const router = express.Router();
const valuationController = require('../controller/valuationController');

router.post('/calculate', valuationController.calculateAndSaveValuation);

module.exports = router;