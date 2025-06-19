const express = require("express");
const router = express.Router();

const { getChecklist } = require("./../controller/openaiController");

router.get("/checklist", getChecklist);

module.exports = router;
