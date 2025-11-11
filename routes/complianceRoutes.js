const express = require('express');
const router = express.Router();
const {
  createCompliance,
  getAllCompliances,
  updateCompliance,
  deleteCompliance,
} = require('../controller/complianceController');

router.post('/', createCompliance);
router.get('/', getAllCompliances);
router.put('/:id', updateCompliance);
router.delete('/:id', deleteCompliance);

module.exports = router;