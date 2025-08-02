const express = require("express");
const router = express.Router();
const {
  GenerateIdeaForUim,
  UnicornIdeasPrediction,
  SaveIdeasWithSelection,
  SaveSummary,
  SaveUimRegister,
} = require("../controller/chatGptControllers");

router.post("/generate-ideas", GenerateIdeaForUim);
router.post("/unicorn-prediction", UnicornIdeasPrediction);
router.post("/save-ideas", SaveIdeasWithSelection);
router.post("/save-summary", SaveSummary);
router.post("/save-uim-register", SaveUimRegister);

module.exports = router;
