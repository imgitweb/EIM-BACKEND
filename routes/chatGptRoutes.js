const express = require("express");
const router = express.Router();
const {GenerateIdeaForUim, UnicornIdeasPrediction,SaveUserSelectedIdea  } = require("../controller/chatGptControllers");


// Route to generate startup ideas for UIM
router.post("/generate-ideas", GenerateIdeaForUim);

// Route to predict unicorn potential of an idea
router.post("/unicorn-prediction", UnicornIdeasPrediction);

// Route to save user-selected idea
router.post("/save-idea", SaveUserSelectedIdea);


module.exports = router;