const MVPTeamModel = require("../../models/MVPTeamModel");
const StartupModel = require("../../models/signup/StartupModel");
const MVPConfig = require("../../models/MVP/MVPConfigModel");
const MvpSession = require("../../models/MVP/MvpSession");
const StoryPoint = require("../../models/MVP/StoryPoint");
const MvpScope = require("../../models/MVP/MvpScope");


const OpenAI = require("openai");
const { CallOpenAi } = require("../helper/helper");
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });


 const createCompany = async (req, res) => {
  try {
    const company = new MVPTeamModel(req.body);
    await company.save();
    res.status(201).json({ success: true, company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

 const getCompanies = async (req, res) => {
  try {
    const { category, location, search } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (location) filter.location = location;
    if (search) filter.companyName = new RegExp(search, "i");

    const companies = await MVPTeamModel.find(filter);
    res.json({ success: true, companies });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


 const updateCompany = async (req, res) => {
  try {
    const company = await MVPTeamModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

 const deleteCompany = async (req, res) => {
  try {
    await MVPTeamModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Company removed" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};




const GenerateINhousePlan = async (req, res) => {
  try {
    const { startup_id} = req.body;

    const startupDetails = await StartupModel.findById(startup_id);
    if (!startupDetails) {
      return res.status(404).json({ success: false, error: "Startup not found" });
    }
   
    
 
    const aiValidationService = require("../../utils/aiValidationService");
    const{ plan} = await aiValidationService.generateInhousePlan(startupDetails);

    res.json({ success: true, plan });
  }
  catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}


/* STEP 1 — Generate Story Points */
const generateStoryPoints = async (req, res) => {
  try {
    const { startupId, productType } = req.body;

    const startup = await StartupModel.findById(startupId);
    if (!startup) return res.status(404).json({ message: "Startup not found" });

    const session = await MvpSession.create({
      startupId,
      productType,
      status: "story_points_generated",
    });

    const prompt = `
Generate 10 MVP story points as JSON array only.

Each item:
- title
- description

Context:
MVP Type: ${productType}
Problem: ${startup.problemStatement}
Solution: ${startup.solutionDescription}
Audience: ${startup.targetedAudience}
Industry: ${startup.industry}
`;

    const aiPoints = await CallOpenAi(prompt);

    const saved = await StoryPoint.insertMany(
      aiPoints.map((p) => ({
        sessionId: session._id,
        title: p.title,
        description: p.description,
      }))
    );

    res.json({
      success: true,
      sessionId: session._id,
      storyPoints: saved,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

/* STEP 2 — Select / Remove Story Point */
const toggleStoryPoint = async (req, res) => {
  const { id } = req.params;
  const { isSelected, priority } = req.body;

  const updated = await StoryPoint.findByIdAndUpdate(
    id,
    { isSelected, priority },
    { new: true }
  );

  res.json({ success: true, storyPoint: updated });
};

/* STEP 3 — Generate Scope */
const generateProductScope = async (req, res) => {
 

  try {
    const { sessionId } = req.body;

    const session = await MvpSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const startup = await StartupModel.findById(session.startupId);
    if (!startup) {
      return res.status(404).json({ success: false, message: "Startup not found" });
    }

    const selected = await StoryPoint.find({
      sessionId,
      isSelected: true,
    });

    if (!selected.length) {
      return res.status(400).json({
        success: false,
        message: "No story points selected",
      });
    }

        const features = selected
      .map(
        (f) =>
          `- ${f.title} (${f.priority}): ${f.description}`
      )
      .join("\n");

     const prompt = `
You are a backend API that returns ONLY valid JSON.

RULES (VERY IMPORTANT):
- Output MUST be valid JSON
- No text, no explanation, no markdown
- No headings outside JSON
- No comments
- If unsure, return an empty JSON object {}

Return the product scope strictly in the following JSON structure:

{
  "executiveSummary": "",
  "problemOverview": "",
  "targetUsers": [],
  "mvpObjectives": [],
  "detailedScope": [
    {
      "featureTitle": "",
      "description": "",
      "priority": ""
    }
  ],
  "outOfScope": [],
  "techStack": {
    "frontend": [],
    "backend": [],
    "database": [],
    "hosting": [],
    "others": []
  },
  "developmentTimeline": [
    {
      "phase": "",
      "durationWeeks": 0,
      "deliverables": []
    }
  ],
  "totalEstimatedDurationWeeks": 0
}

Startup Name: ${startup.startupName}
Problem: ${startup.problemStatement}
Solution: ${startup.solutionDescription}
Target Audience: ${startup.targetedAudience}
MVP Type: ${session.productType}

Selected Features:
${features}

RETURN ONLY JSON.
`;


    const scopeJson = await CallOpenAi(prompt, "json");

  // 🔹 derive useful fields from JSON
const totalWeeks = scopeJson.totalEstimatedDurationWeeks || null;

const techStack = scopeJson.techStack || {
  frontend: [],
  backend: [],
  database: [],
  hosting: [],
  others: [],
};

// optional team inference
const teamRequired = [];
if (techStack.frontend?.length) teamRequired.push("Frontend");
if (techStack.backend?.length) teamRequired.push("Backend");
if (techStack.database?.length) teamRequired.push("Database");
if (techStack.others?.length) teamRequired.push("Others");

const scope = await MvpScope.create({
  sessionId,
  scopeData: scopeJson,
  totalEstimatedDurationWeeks: totalWeeks,
  techStack,
  teamRequired,
});

session.status = "scope_generated";
await session.save();
    res.json({
      success: true,
      scope,
    });
  } catch (e) {
    console.error("Generate Scope Error:", e);
    res.status(500).json({
      success: false,
      message: "Scope generation failed",
      error: e.message,
    });
  }
};



 const saveMVPConfig = async (req, res) => {
  try {
    const { startupId, productType, storyPoints } = req.body;

    if (!startupId || !productType || !storyPoints) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const doc = new MVPConfig({
      startupId,
      productTypeId: productType.id,
      productTypeLabel: productType.label,
      storyPoints,
    });

    await doc.save();

    res.json({
      success: true,
      message: "MVP config saved",
      data: doc,
    });
  } catch (error) {
    console.error("Save MVP Error:", error);
    res.status(500).json({ success: false, message: "Failed to save" });
  }
};



module.exports = {
  toggleStoryPoint,
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
  GenerateINhousePlan,
  generateStoryPoints,
  generateProductScope,
  saveMVPConfig,
};


