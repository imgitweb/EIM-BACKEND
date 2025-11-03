const express = require("express");
const multer = require("multer");
const { createOrUpdateMrr, getMRR , createOrUpdateGr , getGR} = require("../controller/matrixController");

const router = express.Router();
const upload = multer();
router.post("/add_mrr", createOrUpdateMrr);
router.get("/get_mrr/:startup_id", getMRR);
router.post ("/add_gr", createOrUpdateGr )
router.get ("/get_gr/:startup_id", getGR )
module.exports = router;
