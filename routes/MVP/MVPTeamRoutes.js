const express = require("express");
const { createCompany, getCompanies, updateCompany, deleteCompany , GenerateINhousePlan} = require("../../controller/MVP/MVPTeamControllers");


const router = express.Router();


router.post("/", createCompany);
router.get("/", getCompanies);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);
router.post('/generate-plan', GenerateINhousePlan)










module.exports = router;
