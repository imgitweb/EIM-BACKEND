const express = require("express");
const multer = require("multer");
const {
  createOrUpdate,
  getCompanyInfoById,
} = require("../controller/companyController");
const router = express.Router();
const upload = multer();
router.post("/add_company", createOrUpdate);
router.get("/get_company/:startup_id", getCompanyInfoById);

module.exports = router;
