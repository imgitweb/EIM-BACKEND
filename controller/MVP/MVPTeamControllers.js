const MVPTeamModel = require("../../models/MVPTeamModel");
const StartupModel = require("../../models/signup/StartupModel");
const MVPConfig = require("../../models/MVP/MVPConfigModel");

const OpenAI = require("openai");
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


const generateStoryPoints = async (req, res) => {
  try {
    const { startupId, productType } = req.body;

    console.log("Generate Story Points Request:", req.body);

    if (!startupId || !productType) {
      return res.status(400).json({ message: "startupId & productType required" });
    }

    const startup = await StartupModel.findById(startupId);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    const prompt = `
You are an expert product manager.

Generate 6–10 short MVP story points as JSON ONLY.  
No text, no comments, no markdown, no backticks — only a pure JSON array.

Each story point must include:
- id (string, unique)
- title (short)
- description (1 sentence)

Context:
- MVP Type: ${productType}
- Problem: ${startup.problemStatement}
- Solution: ${startup.solutionDescription}
- Audience: ${startup.targetedAudience}
- Industry: ${startup.industry}

Return JSON ONLY like this:
[
  { "id": "sp1", "title": "User Login", "description": "Allow users to log in using email." }
]
`;

    const aiRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    let raw = aiRes.choices[0].message.content;

    // CLEAN AI RESPONSE (remove code blocks)
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("JSON Parse Issue. Raw Output:", raw);
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON.",
      });
    }

    return res.json({
      success: true,
      storyPoints: parsed,
    });

  } catch (error) {
    console.error("AI Story Points Error:", error);
    res.status(500).json({
      success: false,
      message: "AI Error",
    });
  }
};



const generateProductScope = async (req, res) => {
  try {
    const { startupId, productType, selectedStoryPoints } = req.body;

    const startup = await StartupModel.findById(startupId);
    if (!startup) {
      return res.status(404).json({ success: false, message: "Startup not found" });
    }

    const storyPointsText = selectedStoryPoints
      .map(
        (sp, i) =>
          `${i + 1}. ${sp.title}\n   - Description: ${sp.description}\n   - Priority: ${sp.priority}`
      )
      .join("\n\n");

    const prompt = `
You are a senior product consultant. Create a full professional PRODUCT SCOPE DOCUMENT.

Write it clean, structured, and formatted as plain text (no markdown, no numbering issues).

Startup Info:
- Name: ${startup.startupName}
- Problem: ${startup.problemStatement}
- Solution: ${startup.solutionDescription}
- Audience: ${startup.targetedAudience}

MVP Type: ${productType}

Selected Story Points:
${storyPointsText}

Write the Product Scope using these exact sections:

1. EXECUTIVE SUMMARY  
   - 5–7 lines summarizing the product vision & MVP purpose.

2. PROBLEM OVERVIEW  
   - What problem exists and why it matters?

3. TARGET USERS  
   - Who will use the MVP and what are their motivations?

4. MVP OBJECTIVE  
   - What this MVP is supposed to validate? (Clear measurable goals)

5. DETAILED SCOPE  
   - Convert each story point into a scoped feature description  
   - Include purpose, inputs, outputs, and expected user flow

6. OUT OF SCOPE  
   - List features explicitly NOT included in this MVP

7. SUGGESTED TECH STACK  
   - 6–10 recommended technologies (Frontend, Backend, AI, DB, Hosting)

8. DEVELOPMENT TIMELINE  
   - 3–5 phases: Discovery → UI/UX → Development → Testing → Launch
   - Include deliverables for each phase

Return the final scope as plain clean text. No markdown. No code blocks.
`;

    const aiRes = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    let scopeText = aiRes.choices[0].message.content;

    scopeText = scopeText.replace(/```/g, "").trim();

    startup.scope = scopeText;
    await startup.save();

    res.json({
      success: true,
      scope: scopeText,
    });

  } catch (error) {
    console.error("Generate Scope Error:", error);
    res.status(500).json({
      success: false,
      message: "AI scope generation failed",
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
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
  GenerateINhousePlan,
  generateStoryPoints,
  generateProductScope,
  saveMVPConfig,
};


