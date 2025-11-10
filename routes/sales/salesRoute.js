const express = require("express");
const router = express.Router();
const {
  getProduct,
  createProduct,
  deleteProduct,
} = require("../../controller/sales/salesController");

router.get("/get", getProduct);
router.post("/create", createProduct);
router.delete("/delete/:id", deleteProduct);

module.exports = router;
