const express = require("express");
const router = express.Router();
const {
  GenerateIdeaForUim,
  UnicornIdeasPrediction,
  SaveIdeasWithSelection,
} = require("../controller/chatGptControllers");

router.post("/generate-ideas", GenerateIdeaForUim);
router.post("/unicorn-prediction", UnicornIdeasPrediction);
router.post("/save-ideas", SaveIdeasWithSelection);

module.exports = router;
