const express = require("express");
const { createCompany, getCompanies, updateCompany, deleteCompany , GenerateINhousePlan, generateStoryPoints, generateProductScope, saveMVPConfig} = require("../../controller/MVP/MVPTeamControllers");


const router = express.Router();



router.post("/", createCompany);
router.get("/", getCompanies);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);
router.post('/generate-plan', GenerateINhousePlan)

// NEW MVP Builder Routes
router.post("/generate-story-points", generateStoryPoints);
router.post("/generate-scope", generateProductScope);
router.post("/save", saveMVPConfig);


module.exports = router;
