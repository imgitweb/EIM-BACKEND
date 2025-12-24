// Routes: routes/UpdateCompanyDetailsRoutes.js
const express = require('express');
const { getCompanyDetails, updateCompanyDetails } = require('../controller/UpdateCompanyDetailsController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:id', protect, getCompanyDetails);
router.put('/:id', protect, updateCompanyDetails);

module.exports = router;