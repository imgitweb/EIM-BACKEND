const express = require("express");
const router = express.Router();

const {
    createPostCoFounder,
    getAllPostCoFounders,
  } = require("../controller/postCoFounderController");

router.post("/", createPostCoFounder);
router.get("/", getAllPostCoFounders);

module.exports = router;
