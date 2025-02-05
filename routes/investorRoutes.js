// routes/investorRoutes.js
const express = require('express');
const router = express.Router();
const {
  addInvestor,
  getInvestors,
  getInvestor,
  updateInvestor,
  deleteInvestor,
} = require('../controller/investorController');

module.exports = (upload) => {
  router.post('/', upload.single('companyLogo'), addInvestor);
  router.get('/', getInvestors);
  router.get('/:id', getInvestor);
  router.put('/:id', upload.single('companyLogo'), updateInvestor);
  router.delete('/:id', deleteInvestor);

  return router;
};