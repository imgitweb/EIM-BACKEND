const {
  generateApi,
  generateUimPrompt,
  unicornIdeasPredictionPrompt,
} = require("../controller/helper/helper.js");

const Idea = require("../models/IdeaModel");

const GenerateIdeaForUim = async (req, res) => {
  try {
    const { sectors, focus, market, interest, skills } = req.body;

    // Validate required fields
    if (!sectors || !focus || !market || !interest || !skills) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const formData = { sectors, focus, market, interest, skills };
    const prompt = generateUimPrompt(formData);

    const response = await generateApi(prompt);
    console.log("Raw Response:", response);

   
    const ideasArray = response
      .split(/\n?\d+\.\s+/)
      .filter(Boolean)
      .map((idea) => idea.trim());

    console.log("Parsed Ideas:", ideasArray);

    res.status(200).json({
      message: "Ideas generated successfully",
      data: ideasArray,
    });
  } catch (error) {
    console.error("Error generating ideas:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

const UnicornIdeasPrediction = async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) {
      return res.status(400).json({ message: "Idea is required" });
    }

    const prompt = unicornIdeasPredictionPrompt(idea);
    const response = await generateApi(prompt);
    console.log("Unicorn Prediction Response:", response);

    res.status(200).json({
      message: "Unicorn prediction generated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error generating unicorn prediction:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

const SaveUserSelectedIdea = async (req, res) => {
  try {
    const {  idea, response} = req.body;

    console.log("Received body:", req.body); 

    if (!idea || !response ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newIdea = new Idea({ idea, response });
    await newIdea.save();

    res.status(200).json({ message: "Idea saved successfully", data: newIdea });
  } catch (error) {
    console.error(" Error in SaveUserSelectedIdea:", error); 
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {
  GenerateIdeaForUim,
  UnicornIdeasPrediction,
  SaveUserSelectedIdea,
  
};
