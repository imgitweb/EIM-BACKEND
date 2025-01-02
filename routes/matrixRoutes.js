const express = require("express");
const multer = require("multer");
const { createOrUpdateMrr, getMRR } = require("../controller/matrixController");

const router = express.Router();
const upload = multer();
router.post("/add_mrr", createOrUpdateMrr);
router.get("/get_mrr/:startup_id", getMRR);
module.exports = router;
