const express = require("express");
const router = express.Router();
const leadController = require("../controller/leadController");

// Matches frontend: axios.get(`${API_URL}/api/leads/${userId}`)
router.get("/:userId", leadController.getLeads);

// Matches frontend: axios.post(`${API_URL}/api/leads/add`, ...)
router.post("/add", leadController.addLead);

// Matches frontend: axios.put(`${API_URL}/api/leads/update/${editId}`, ...)
router.put("/update/:id", leadController.updateLead);

// Matches frontend: axios.post(`${API_URL}/api/leads/import`, ...)
router.post("/import", leadController.importLeads);

module.exports = router;
