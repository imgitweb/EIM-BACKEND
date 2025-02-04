// routes/investorRoutes.js
const express = require('express');
const router = express.Router();
const {
  addInvestor,
  getInvestors,
  getInvestor
} = require('../controller/investorController');

module.exports = (upload) => {
  router.post('/', upload.single('companyLogo'), addInvestor);
  router.get('/', getInvestors);
  router.get('/:id', getInvestor);
  
  return router;
};