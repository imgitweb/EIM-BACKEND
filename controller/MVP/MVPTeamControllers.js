const MVPTeamModel = require("../../models/MVPTeamModel");
const StartupModel = require("../../models/signup/StartupModel");
const MVPConfig = require("../../models/MVP/MVPConfigModel");
const MvpSession = require("../../models/MVP/MvpSession");
const StoryPoint = require("../../models/MVP/StoryPoint");
const MvpScope = require("../../models/MVP/MvpScope");


const OpenAI = require("openai");
const { CallOpenAi } = require("../helper/helper");
const InHousePlanModel = require("../../models/InHousePlanModel");
const MvpLaunchChecklistModel = require("../../models/MvpLaunchChecklistModel");
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
        // 💾 Save to DB
    const savedPlan = await InHousePlanModel.create({
      startupId: startup_id,
      overview: plan.overview,
      roles: plan.roles,
      estimatedTimeline: plan.estimatedTimeline,
      estimatedCost: plan.estimatedCost,
      recommendedTechStack: plan.recommendedTechStack,
      milestones: plan.milestones,
      aiInsight: plan.aiInsight,
    });

    res.json({
      success: true,
      plan: savedPlan,
    });


  }
  catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

const getRecentInhousePlans = async (req, res) => {
  try {
    const { startupId } = req.params;

    const plans = await InHousePlanModel.find({ startupId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("❌ Fetch InHouse Plans Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


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
You are a system that returns ONLY valid JSON.

STRICT RULES:
- Output ONLY valid JSON
- No text outside JSON
- No markdown
- No explanations
- Keep everything SHORT and CLEAR
- Use simple business language
- Focus ONLY on MVP (not future vision)
- Avoid currency symbols unless explicitly required

Return JSON strictly in this structure:

{
  "executiveSummary": "1–2 lines max",
  "problemOverview": "1–2 lines max",
  "targetUsers": ["Short bullet", "Short bullet"],
  "mvpObjectives": ["Clear objective", "Clear objective"],
  "detailedScope": [
    {
      "featureTitle": "Short title",
      "description": "1 line description",
      "priority": "Must-Have | Should-Have"
    }
  ],
  "outOfScope": ["Short bullet"],
  "techStack": {
    "frontend": [],
    "backend": [],
    "database": [],
    "hosting": [],
    "others": []
  },
  "developmentTimeline": [
    {
      "phase": "Phase name",
      "durationWeeks": 0,
      "deliverables": ["Short bullet"]
    }
  ],
  "totalEstimatedDurationWeeks": 0
}

Startup Context:
Startup Name: ${startup.startupName}
Problem: ${startup.problemStatement}
Solution: ${startup.solutionDescription}
Target Audience: ${startup.targetedAudience}
MVP Type: ${session.productType}

Selected MVP Features (ONLY THESE FEATURES):
${features}

IMPORTANT:
- Do NOT add extra features
- Do NOT repeat the same idea in multiple sections
- Keep everything concise
- Think like a product manager building MVP in limited time

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

const getRecentScopes = async (req, res) => {
  try {
    const { startupId } = req.params;

    const sessions = await MvpSession.find({ startupId }).sort({ createdAt: -1 });

    const scopes = await MvpScope.find({
      sessionId: { $in: sessions.map((s) => s._id) },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, scopes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch scopes", error: error.message });
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




const getChecklist = async (req, res) => {
  try {
    const { startupId } = req.params;

    let checklist = await MvpLaunchChecklistModel.findOne({ startupId });

    if (!checklist) {
      checklist = await MvpLaunchChecklistModel.create({ startupId });
    }

    res.json({ success: true, checklist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * UPDATE single checkbox
 */
const updateCheck = async (req, res) => {
  try {
    const { startupId, key, value } = req.body;

    const checklist = await MvpLaunchChecklistModel.findOne({ startupId });
    if (!checklist)
      return res.status(404).json({ success: false, message: "Checklist not found" });

    checklist.checks[key] = value;

    const values = Object.values(checklist.checks);
    checklist.completedCount = values.filter(Boolean).length;
    checklist.isReadyToLaunch =
      checklist.completedCount === checklist.totalCount;

    await checklist.save();

    res.json({ success: true, checklist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * MARK MVP AS LAUNCHED
 */
const launchMvp = async (req, res) => {
  try {
    const { startupId } = req.body;

    const checklist = await MvpLaunchChecklistModel.findOne({ startupId });

    if (!checklist || !checklist.isReadyToLaunch) {
      return res.status(400).json({
        success: false,
        message: "All checks not completed",
      });
    }

    res.json({
      success: true,
      message: " MVP Launched Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
  getRecentInhousePlans,
  getRecentScopes,
  getChecklist,
  updateCheck,
  launchMvp,
};


