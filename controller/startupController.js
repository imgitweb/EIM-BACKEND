const User = require("./../models/signup/StartupModel");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const {
  validateIdeaWithAI,
  analyzeRisksAI,
  generateMarketCaseStudiesAI,
} = require("../utils/aiValidationService");
const { sendMail } = require("../utils/wellcomeEmails");
const StartupValidation = require("../models/StartupValidation");
const RiskAnalysis = require("../models/RiskAnalysis");
const RivalryInsight = require("../models/RivalryInsight");
const { CallOpenAi } = require("./helper/helper");
exports.getUsersByIndustry = async (req, res) => {
  try {
    const { industry } = req.params; // Get the industry from URL parameter

    // Find 3 users with the same industry
    const startup = await User.find({ industry: industry }).limit(3);

    if (!startup || startup.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found with the specified industry." });
    }

    res.status(200).json(startup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStartupById = async (req, res) => {
  try {
    const startupId = req.params.id;

    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    // Query the startup by ID
    const startup = await User.findOne({
      _id: new mongoose.Types.ObjectId(startupId),
    });

    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    // Find 3 more startups with the same industry
    const otherStartups = await User.find({
      industry: startup.industry,
      _id: { $ne: startup._id }, // Exclude the current startup
    }).limit(4); // Limit to 3 startups

    // Respond with the found startup and other startups in the same industry
    res.status(200).json({
      startup,
      otherStartups,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendStartupExchangeEmail = async (req, res) => {
  try {
    // Destructure startup IDs from the request body
    const startupId1 = req.params.startupId1;
    const startupId2 = req.params.startupId2;

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(startupId1) ||
      !mongoose.Types.ObjectId.isValid(startupId2)
    ) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    // Find both startups by ID
    const startup1 = await User.findById(startupId1);
    const startup2 = await User.findById(startupId2);

    if (!startup1 || !startup2) {
      return res
        .status(404)
        .json({ message: "One or both startups not found" });
    }

    // Create the email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email message for startup 1 to receive startup 2's details
    const mailOptions1 = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: startup1.email_id,
      subject: `Exchange Info with ${startup2.startup_name}`,
      text: `Hi ${startup1.startup_name},\n\nWe wanted to introduce you to ${startup2.startup_name}, a startup in the same industry. Here are their details:\n\n
        - Startup Name: ${startup2.startup_name}\n
        - Email: ${startup2.email_id}\n
        - Mobile: ${startup2.mobile_no}\n
        - Country: ${startup2.country_name}\n
        - Industry: ${startup2.industry}\n
        - City: ${startup2.city_name}\n
        - Startup Idea: ${startup2.startup_idea}\n\n
        Feel free to connect!\n\nBest Regards, Startup Exchange Team`,
    };

    // Email message for startup 2 to receive startup 1's details
    const mailOptions2 = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: startup2.email_id,
      subject: `Exchange Info with ${startup1.startup_name}`,
      text: `Hi ${startup2.startup_name},\n\nWe wanted to introduce you to ${startup1.startup_name}, a startup in the same industry. Here are their details:\n\n
        - Startup Name: ${startup1.startup_name}\n
        - Email: ${startup1.email_id}\n
        - Mobile: ${startup1.mobile_no}\n
        - Country: ${startup1.country_name}\n
        - Industry: ${startup1.industry}\n
        - City: ${startup1.city_name}\n
        - Startup Idea: ${startup1.startup_idea}\n\n
        Feel free to connect!\n\nBest Regards, Startup Exchange Team`,
    };

    // Send emails to both startups
    await transporter.sendMail(mailOptions1);
    await transporter.sendMail(mailOptions2);

    // Respond with a success message
    res.status(200).json({
      message: `Emails sent successfully to ${startup1.startup_name} and ${startup2.startup_name}`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStartupDetails = async (req, res) => {
  try {
    const startupId = req.params.id;
    const updateData = req.body;
    const logo = req.file;

    console.log("🟡 Received update data:", updateData);

    if (logo) {
      updateData.logoUrl = `/uploads/${logo.filename}`; // Assuming static folder setup
    }

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    const startup = await User.findById(startupId);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    // ✅ Parse socialLinks if it's a JSON string
    if (updateData.socialLinks) {
      try {
        if (typeof updateData.socialLinks === "string") {
          startup.socialLinks = JSON.parse(updateData.socialLinks);
        } else if (Array.isArray(updateData.socialLinks)) {
          startup.socialLinks = updateData.socialLinks;
        }
      } catch (err) {
        console.error("❌ Failed to parse socialLinks:", err);
      }
    }

    // ✅ Update other fields
    startup.startupName = updateData.title || startup.startupName;
    startup.elevatorPitch = updateData.pitch || startup.elevatorPitch;
    startup.targetedAudience =
      updateData.targetedAudience || startup.targetedAudience;
    startup.email = updateData.email || startup.email;
    startup.logoUrl = updateData.logoUrl || startup.logoUrl;
    startup.contactNumber = updateData.phoneNumber || startup.contactNumber;
    startup.problemStatement = updateData.problem || startup.problemStatement;
    startup.solutionDescription =
      updateData.solution || startup.solutionDescription;
    startup.businessModel = updateData.businessModel || startup.businessModel;
    startup.industry = updateData.industry || startup.industry;
    startup.country = updateData.country || startup.country;
    startup.startupStage = updateData.stage || startup.startupStage;

    await startup.save();

    console.log("✅ Updated Startup:", startup.socialLinks);

    res.status(200).json({
      message: "Startup details updated successfully",
      startup,
    });
  } catch (error) {
    console.error("❌ Error updating startup details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.validateStartup = async (req, res) => {
  try {
    const startupId = req.params.id;
    const { title, problem, solution, audience } = req.body;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    const startup = await User.findById(startupId);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    const validation = await validateIdeaWithAI({
      title,
      problem,
      solution,
      audience,
    });


    // ✅ SAVE RESULT TO DATABASE
    const savedValidation = await StartupValidation.create({
      startupId,
      score: validation.score || 0,
      strengths: validation.strengths || [],
      weaknesses: validation.weaknesses || [],
      opportunities: validation.opportunities || [],
      risks: validation.risks || [],
    });



    res.status(200).json({
      message: "✅ Idea validated successfully by AI",
      validation : savedValidation,
    });
  } catch (error) {
    console.error("❌ Error validating startup idea:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getRecentValidations = async (req, res) => {
  try {
    const startupId = req.params.id;

    const validations = await StartupValidation.find({ startupId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(validations);
  } catch (error) {
    console.error("Error fetching validations:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.analyzeRisks = async (req, res) => {
  try {
    const startupId = req.params.id;
    const { targetedAudience, generateCount = 10 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ message: "Invalid startup ID" });
    }

    const startup = await User.findById(startupId);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    // Merge targeted audience override
    const startupData = {
      ...startup.toObject(),
      targetedAudience:
        targetedAudience || startup.targetedAudience || "General Audience",
    };

    const aiResult = await analyzeRisksAI({
      startup: startupData,
      generateCount,
    });

        // ✅ SAVE RESULT
    const saved = await RiskAnalysis.create({
      startupId,
      radarScores: aiResult.radarScores,
      topRisks: aiResult.topRisks,
      swot: aiResult.swot,
    });


    res.status(200).json({
      message: "AI risk analysis completed successfully",
      data: saved,
    });
  } catch (error) {
    console.error("❌ AI Risk Analysis Error:", error);
    res.status(500).json({
      message: "Server error during AI risk analysis",
      error: error.message,
    });
  }
};

exports.getRecentRiskAnalysis = async (req, res) => {
  const startupId = req.params.id;

  const history = await RiskAnalysis.find({ startupId })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(history);
};


exports.generateMarketCaseStudies = async (req, res) => {
  try {
    const { idea, problem, solution, sector } = req.body;

    const result = await generateMarketCaseStudiesAI({
      idea,
      problem,
      solution,
      sector,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error generating market case studies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate market case studies.",
    });
  }
};

exports.generateRivalryInsight = async (req, res) => {
  try {
    const { scope } = req.body;
      const  startupId  = req.params.id;

    const user = await User.findById(startupId);
    if (!user) {
      return res.status(404).json({ message: "Startup not found" });
    }

    const startupName = user.startupName || "Your Startup";
    const industry = user.industry || "General";
    const primaryService =
      user.solutionDescription?.slice(0, 120) ||
      "Primary product or service";

    const location =
      scope === "global"
        ? "Global Market"
        : user.city || user.state || user.country || "Unknown";

    const prompt = `
You are a startup competition analyst.

Generate RIVALRY INSIGHTS (NOT market research).
Identify exactly 2 direct competitors operating at:
${scope.toUpperCase()} level – ${location}

Respond ONLY with valid JSON.

Startup:
Name: ${startupName}
Industry: ${industry}
Primary Offering: ${primaryService}

Return JSON:
{
  "startup_name": "${startupName}",
  "location": "${location}",
  "competitor_1": { "name": "", "location": "", "services": "" },
  "competitor_2": { "name": "", "location": "", "services": "" },
  "analysis": {
    "competitive_intensity": "",
    "differentiation_gap": "",
    "entry_barriers": "",
    "pricing_pressure": ""
  }
}
`;

    const aiResponse = await CallOpenAi(prompt);


    const saved = await RivalryInsight.create({
      startupId,
      scope,
      result: aiResponse,
    });

    res.status(200).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate rivalry insight",
    });
  }
};

/* ================= FETCH RECENT ================= */
exports.getRecentRivalryInsights = async (req, res) => {

  console.log("🔵 Fetching recent rivalry insights for startup:", req.params);
  try {
    const  startupId  = req.params.id;

    const data = await RivalryInsight.find({ startupId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load rivalry history",
    });
  }
};



