const express = require("express");
const router = express.Router();
const {
  getAllSchemes,
  getSchemesByCategory,
  getSchemeById,
} = require("../controller/schemeController");

router.get("/", getAllSchemes);

router.get("/detail/:id", getSchemeById);

router.get("/:category", getSchemesByCategory);

module.exports = router;
