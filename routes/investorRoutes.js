// routes/investorRoutes.js
const express = require('express');
const router = express.Router();
const {
  addInvestor,
  getInvestors,
  getInvestor,
  updateInvestor,
  deleteInvestor,
  getAngelInvestors,
  getVCInvestors
} = require('../controller/investorController');

module.exports = (upload) => {
  // The file upload field name changes based on investor type
  // For angels, no file upload needed
  // For VCs, we use firmLogo instead of companyLogo
  router.post('/', upload.single('firmLogo'), addInvestor);
  
  // Get all investors (optional query params can filter by type)
  router.get('/', getInvestors);
  
  // New routes for specific investor types
  router.get('/angel', getAngelInvestors);
  router.get('/vc', getVCInvestors);
  
  // Get specific investor by ID
  router.get('/:id', getInvestor);
  
  // Update investor - handle file upload for VC firms
  router.put('/:id', upload.single('firmLogo'), updateInvestor);
  
  // Delete investor
  router.delete('/:id', deleteInvestor);

  return router;
};