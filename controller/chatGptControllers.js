const {
  generateUimPrompt,
  unicornIdeasPredictionPrompt,
} = require("../controller/helper/helper.js");
const UimRegister = require("../models/UimRegisterModel");
const Idea = require("../models/IdeaModel");
const { CallOpenAi } = require("./helper/helper");

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
    const response = await CallOpenAi(prompt);

    res
      .status(200)
      .json({ message: "Ideas generated successfully", data: response });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

const UnicornIdeasPrediction = async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ message: "Idea is required" });

    const prompt = unicornIdeasPredictionPrompt(idea);
    const response = await CallOpenAi(prompt);

    res.status(200).json({
      message: "Unicorn prediction generated successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

const SaveIdeasWithSelection = async (req, res) => {
  try {
    const { ideas, selectedIdea } = req.body;
    if (!selectedIdea || !selectedIdea.idea || !selectedIdea.response) {
      return res.status(400).json({ message: "Idea and response required" });
    }

    // Create a new document with all ideas
    const newIdeas = new Idea({
      ideas: ideas.map((i) => ({
        idea: i.idea,
        chance: `${i.chance}%`,
      })),
      idea: selectedIdea.idea,
      response: selectedIdea.response,
    });

    await newIdeas.save();

    res.status(200).json({
      message: "Idea saved successfully",
      data: newIdeas,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const SaveSummary = async (req, res) => {
  try {
    const { id, title, summary } = req.body;
    if (!id || !title || !summary) {
      return res.status(400).json({ message: "ID, title, summary required" });
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      {
        $push: {
          summaries: { title, summary, time: new Date() },
        },
      },
      { new: true }
    );

    if (!updatedIdea)
      return res.status(404).json({ message: "Idea not found" });

    res.status(200).json({
      message: "Summary saved successfully",
      data: updatedIdea,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const SaveUimRegister = async (req, res) => {
  try {
    const { sectors, focus, market, interest, skills } = req.body;

    if (!sectors || !focus || !market || !interest || !skills) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRegister = new UimRegister({
      sectors,
      focus,
      market,
      interest,
      skills,
    });

    await newRegister.save();

    res.status(201).json({
      message: "UIM Registration data saved successfully",
      data: newRegister,
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving UIM Register data", error });
  }
};

module.exports = {
  GenerateIdeaForUim,
  UnicornIdeasPrediction,
  SaveIdeasWithSelection,
  SaveSummary,
  SaveUimRegister,
};
