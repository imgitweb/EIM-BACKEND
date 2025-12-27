// routes/leadRoutes.js
const express = require("express");
const { createLead, getLeads } = require("../controller/leadController");

const router = express.Router();

// POST - Create a new lead
// router.post("/", createLead);

// GET - Retrieve all leads
// router.get("/", getLeads);

module.exports = router;
