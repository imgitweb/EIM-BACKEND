const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemesByCategory,
  getSchemeById
} = require('../controller/schemeController');

// Get all schemes
router.get('/', getAllSchemes);

// Get scheme by ID (must come before category route)
router.get('/detail/:id', getSchemeById);

// Get schemes by category
router.get('/:category', getSchemesByCategory);

module.exports = router;