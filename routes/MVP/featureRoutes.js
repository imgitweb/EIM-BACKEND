const express = require("express");
const { createFeature, getAllFeatures, getFeatureById, updateFeature, deleteFeature, generateFeatures, generateBUilderAI } = require("../../controller/MVP/featureController");
const router = express.Router();

router.post("/", createFeature);
router.post('/generate-ai',generateFeatures )
router.post("/builder-ai", generateBUilderAI);
router.get("/", getAllFeatures);
router.get("/:id", getFeatureById);
router.put("/:id", updateFeature);
router.delete("/:id", deleteFeature);


module.exports = router;
