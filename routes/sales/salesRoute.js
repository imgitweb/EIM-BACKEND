const express = require("express");
const router = express.Router();

// Direct access (NO destructuring)
const salesController = require("../../controller/sales/salesController");

router.get("/get", salesController.getProduct);
router.post("/create", salesController.createProduct);
router.delete("/delete/:id", salesController.deleteProduct);
router.post("/product-pricing", salesController.submitProductPricing);
router.post("/marketing-funnel", salesController.submitMarketingFunnel);
router.post("/sales-funnel", salesController.submitSalesFunnelLead);

module.exports = router;
