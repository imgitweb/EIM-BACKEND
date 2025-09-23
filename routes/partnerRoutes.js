const express = require('express');
const { createPartner, getAllPartners, getPartnerById, updatePartner, deletePartner } = require('../controller/partner/partnerController');
const router = express.Router();


router.post('/', createPartner);
router.get('/', getAllPartners);
router.get('/:id', getPartnerById);
router.put('/:id', updatePartner);
router.delete('/:id', deletePartner);

module.exports = router;
