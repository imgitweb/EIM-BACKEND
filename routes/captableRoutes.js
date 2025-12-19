const express = require("express");
const { saveCaptable, getCaptable } = require("../controller/captableController");

const router = express.Router();

router.get("/", getCaptable);
router.post("/", saveCaptable);

module.exports = router;