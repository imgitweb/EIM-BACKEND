const {
  generateApi,
  generateUimPrompt,
  unicornIdeasPredictionPrompt,
} = require("../controller/helper/helper.js");

const Idea = require("../models/IdeaModel");

const GenerateIdeaForUim = async (req, res) => {
  try {
    const { sectors, focus, market, interest, skills } = req.body;

    if (!sectors || !focus || !market || !interest || !skills) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const prompt = generateUimPrompt({
      sectors,
      focus,
      market,
      interest,
      skills,
    });
    const response = await generateApi(prompt);

    const ideasArray = response
      .split(/\n?\d+\.\s+/)
      .filter(Boolean)
      .map((idea) => idea.trim());

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

    res.status(200).json({
      message: "Unicorn prediction generated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error generating unicorn prediction:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

const SaveIdeasWithSelection = async (req, res) => {
  try {
    const { ideas, selectedIdea } = req.body;

    if (!ideas || ideas.length === 0 || !selectedIdea) {
      return res
        .status(400)
        .json({ message: "Ideas and selected idea are required" });
    }

    const { idea, response } = selectedIdea;

    const newIdeas = new Idea({
      ideas,
      idea,
      response,
    });

    await newIdeas.save();

    res.status(200).json({
      message: "Ideas and selected idea saved successfully",
      data: newIdeas,
    });
  } catch (error) {
    console.error("Error saving ideas and selected idea:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  GenerateIdeaForUim,
  UnicornIdeasPrediction,
  SaveIdeasWithSelection,
};
