const Feature = require("../../models/ProductScopeModel");
const { generateFeaturesAI, generateBuilderAI } = require("../../utils/aiValidationService");


const createFeature = async (req, res) => {
  try {
    const { features } = req.body;


    if (!features && req.body.description) {
      const { description, priority, tasks, techStack, effort, notes } = req.body;

      if (!description || !priority) {
        return res.status(400).json({ message: "Description and priority are required." });
      }

      const feature = new Feature({
        description,
        priority,
        tasks: tasks || [],
        techStack: techStack || [],
        effort: effort || "Medium",
        notes: notes || "",
      });

      const savedFeature = await feature.save();
      return res.status(201).json({
        message: "Single feature created successfully",
        data: savedFeature,
      });
    }

    if (!Array.isArray(features)) {
      return res.status(400).json({ message: "Invalid input: 'features' must be an array." });
    }

    if (features.length === 0) {
      return res.status(400).json({ message: "Feature array cannot be empty." });
    }

    const validFeatures = features.map((f) => ({
      description: f.description,
      priority: f.priority,
      tasks: f.tasks || [],
      techStack: f.techStack || [],
      effort: f.effort || "Medium",
      notes: f.notes || "",
    }));

    const savedFeatures = await Feature.insertMany(validFeatures);

    res.status(201).json({
      message: `${savedFeatures.length} feature(s) created successfully`,
      data: savedFeatures,
    });
  } catch (error) {
    console.error("Error creating features:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllFeatures = async (req, res) => {
  try {
    const features = await Feature.find();
    res.status(200).json(features);
  } catch (error) {
    console.error("Error fetching features:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFeatureById = async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) return res.status(404).json({ message: "Feature not found" });
    res.status(200).json(feature);
  } catch (error) {
    console.error("Error fetching feature:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateFeature = async (req, res) => {
  try {
    const updatedFeature = await Feature.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedFeature) return res.status(404).json({ message: "Feature not found" });
    res.status(200).json({ message: "Feature updated successfully", data: updatedFeature });
  } catch (error) {
    console.error("Error updating feature:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteFeature = async (req, res) => {
  try {
    const deletedFeature = await Feature.findByIdAndDelete(req.params.id);
    if (!deletedFeature) return res.status(404).json({ message: "Feature not found" });
    res.status(200).json({ message: "Feature deleted successfully" });
  } catch (error) {
    console.error("Error deleting feature:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




const generateFeatures = async (req, res) => {
  try {
    const  featureList = req.body;
        console.log("📩 Received AI Feature Request:", featureList.featureList);



    if (!featureList) {
      return res.status(400).json({ message: "Feature list is required." });
    }


    const result = await generateFeaturesAI({ featureList });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error generating features with AI:", error);
    return res.status(500).json({ message: "AI generation failed." });
  }
};


const generateBUilderAI = async (req, res) => {
  try {
    const inputData = req.body;





    if (!inputData) {
      return res.status(400).json({ message: "Input data is required." });
    }
    
    const result = await generateBuilderAI(inputData);
    return res.status(200).json(result);
  }
  catch (error) {
    console.error("Error generating MVP roadmap with AI:", error);
    return res.status(500).json({ message: "AI generation failed." });
  }
};

module.exports = {
  createFeature,
  getAllFeatures,
  getFeatureById,
  updateFeature,
  deleteFeature,
  generateFeatures,
  generateBUilderAI

};
