const express = require('express');
const { createPartner, getAllPartners, getPartnerById, updatePartner, deletePartner, connectLegalPartner } = require('../controller/partner/partnerController');
const router = express.Router();

router.post("/", createPartner);
router.get("/", getAllPartners);
router.get("/:id", getPartnerById);
router.put("/:id", updatePartner);
router.delete("/:id", deletePartner);

// connect user with partner
router.post("/connect ", connectLegalPartner);

module.exports = router;
