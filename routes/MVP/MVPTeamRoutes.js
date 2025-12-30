const express = require("express");
const { createCompany, getCompanies, updateCompany, deleteCompany 

    
    , GenerateINhousePlan, generateStoryPoints, generateProductScope, saveMVPConfig,
    updateStoryPoint,
    getRecentScopes,
    toggleStoryPoint,
    getRecentInhousePlans} = require("../../controller/MVP/MVPTeamControllers");


const router = express.Router();



router.post("/", createCompany);
router.get("/", getCompanies);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);
router.post('/generate-plan', GenerateINhousePlan)
router.get("/recent-inhouse-plans/:startupId", getRecentInhousePlans);

// NEW MVP Builder Routes
router.post("/generate-story-points", generateStoryPoints);
router.patch("/story-point/:id", toggleStoryPoint);



router.post("/generate-scope", generateProductScope);
router.get("/recent-scopes/:startupId", getRecentScopes);

router.post("/save", saveMVPConfig);


module.exports = router;
