const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemesByCategory,
  getSchemeById
} = require('../controller/schemeController');

<<<<<<< HEAD
// Get all schemes
router.get('/', getAllSchemes);

// Get scheme by ID (must come before category route)
router.get('/detail/:id', getSchemeById);

// Get schemes by category
=======
router.get('/', getAllSchemes);

router.get('/detail/:id', getSchemeById);

>>>>>>> 459c204bdf6256256ca54843cfd89b8d46523c27
router.get('/:category', getSchemesByCategory);

module.exports = router;