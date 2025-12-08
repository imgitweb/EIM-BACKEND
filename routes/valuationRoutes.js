const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authMiddleware')
const { calculateAndSaveValuation } = require('../controller/valuationController');

router.post('/calculate', protect, calculateAndSaveValuation);

module.exports = router;