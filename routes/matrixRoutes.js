const express = require("express");
const multer = require("multer");
const { 
    createOrUpdateMrr, 
    getMRR, 
    createOrUpdateGr, 
    getGR,
    createOrUpdateCac, 
    getCAC,
    createOrUpdateCb, 
    getCB,
    createOrUpdateClv, 
    getCLV,
    createOrUpdateGp, 
    getGP,
    createOrUpdateNr,
    getNR,
    createOrUpdateCr,
    getCR,
    getEilaStartupContext,
} = require("../controller/matrixController"); 

const router = express.Router();
const upload = multer(); 

router.post("/add_mrr", createOrUpdateMrr);
router.get("/get_mrr/:startup_id", getMRR);

router.post("/add_gr", createOrUpdateGr);
router.get("/get_gr/:startup_id", getGR);

router.post("/add_cac", createOrUpdateCac); 
router.get("/get_cac/:startup_id", getCAC); 

router.post("/add_cb", createOrUpdateCb); 
router.get("/get_cb/:startup_id", getCB); 

router.post("/add_clv", createOrUpdateClv); 
router.get("/get_clv/:startup_id", getCLV);

router.post("/add_gp", createOrUpdateGp); 
router.get("/get_gp/:startup_id", getGP); 

router.post("/add_nr", createOrUpdateNr);
router.get("/get_nr/:startup_id", getNR);

router.post("/add_cr", createOrUpdateCr);
router.get("/get_cr/:startup_id", getCR);

router.get("/get_eila_context/:startup_id", getEilaStartupContext);

module.exports = router;