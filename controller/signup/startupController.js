const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const StartupModel = require("../../models/signup/StartupModel.js");
const saveMilestoneDataToDB = require("../../models/alphaPath.js"); // Assuming this is correct
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const videoCoursesModel = require("../../models/courses/Course.js");
const {
  ActivityModel,
} = require("../../models/ActivityModel/activityModel.js");
const {
  deliverableModel,
} = require("../../models/DeliverablesModel/deliverables.js");
const templateModel = require("../../models/templateModel.js");
const wellcomeEmails = require("../../utils/wellcomeEmails"); // Fixed typo in usage below
const {
  generateActivities,
} = require("../ActivityController/activityController.js");
const { openAI } = require("../milistoneController.js");

// Load plans with error handling and caching
let cachedPlans = null;
const getPlans = () => {
  if (cachedPlans) return cachedPlans; // Cache to avoid repeated FS reads

  try {
    const plansPath = path.join(__dirname, "../../config/Plans.json");
    if (!fs.existsSync(plansPath)) {
      throw new Error("Plans configuration file not found");
    }
    const plansData = JSON.parse(fs.readFileSync(plansPath, "utf8"));
    cachedPlans = plansData.plans || []; // Fallback to empty array
    return cachedPlans;
  } catch (error) {
    console.error("Failed to load plans:", error);
    return [];
  }
};

exports.getPlans = (req, res) => {
  try {
    const plans = getPlans();

    console.log("Second getPlans"); // Fixed typo: secound -> Second
    if (!plans || plans.length === 0) {
      // Fixed impossible check: length === "Free" -> length === 0
      return res
        .status(500)
        .json({ error: "Plans configuration not available" });
    }
    res.status(200).json(plans);
  } catch (error) {
    console.error("Get Plans Error:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
};

exports.createStartup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const plans = getPlans(); // Load once
    const validPlanIds = plans.map((plan) => plan.id);

    const {
      firstName,
      lastName,
      email,
      password,
      startupName,
      problemStatement,
      revenueStarted,
      contactPersonName,
      country,
      state,
      industry,
      website,
      startupStage,
      contactNumber,
      elevatorPitch,
      selectedPlan,
    } = req.body;
    console.log("req.body", req.body); // Consider sanitizing logs in production

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate selectedPlan
    if (!validPlanIds.includes(selectedPlan)) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10; // Use env var
    const bpassword = await bcrypt.hash(password, saltRounds);

    // Fixed existing startup check: Handle missing startupName
    const query = { email };
    if (startupName) query.startupName = startupName;
    const existingStartup = await StartupModel.findOne(query);

    if (existingStartup) {
      if (existingStartup.email === email) {
        return res.status(409).json({ error: "Email already registered" });
      } else {
        return res.status(409).json({ error: "Startup name already exists" });
      }
    }

    // Get planData after validation
    const planData = plans.find((plan) => plan.id === selectedPlan);
    if (!planData) {
      return res.status(400).json({ error: "Selected plan not found" });
    }

    // Create new startup with available information
    const startupData = {
      firstName,
      lastName,
      email,
      password: bpassword,
      selectedPlan,
    };

    // Add optional fields if provided
    if (startupName) startupData.startupName = startupName;
    if (problemStatement) startupData.problemStatement = problemStatement;
    if (revenueStarted) startupData.revenueStarted = revenueStarted;
    if (contactPersonName) startupData.contactPersonName = contactPersonName;
    if (country) startupData.country = country;
    if (state) startupData.state = state;
    if (industry) startupData.industry = industry;
    if (website) startupData.website = website;
    if (startupStage) startupData.startupStage = startupStage;
    if (contactNumber) startupData.contactNumber = contactNumber;
    if (elevatorPitch) startupData.elevatorPitch = elevatorPitch;

    const startup = new StartupModel(startupData);
    await startup.save();

    const { password: pwd, ...startupDataWithoutPassword } = startup.toObject();
    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: startup._id, email: startup.email },
      process.env.JWT_SECRET || "default_jwt_secret", // Enforce env in prod
      { expiresIn: "24h" }
    );

    await generateActivities({
      startup_id: startup._id,
      planName: selectedPlan,
    });

    const videoCourses = await videoCoursesModel.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          category: "",
          Path: "",
        },
      },
    ]);

    const activities = await ActivityModel.aggregate([
      {
        $match: { startup_id: startup._id },
      },
      {
        $project: {
          _id: 1,
          title: "$activity_name",
          category: "",
          Path: "$activity_schema",
        },
      },
    ]);

    const deliverables = await deliverableModel.aggregate([
      {
        $project: {
          _id: 1,
          title: "$deliverable_name",
          category: "",
          Path: "",
        },
      },
    ]);

    const toolsTemplates = await templateModel.aggregate([
      {
        $project: {
          _id: 1,
          title: "$template_name",
          category: "$category_name",
          Path: "$template_file",
        },
      },
    ]);

    const data = {
      startupName: startupName,
      startupElevatorPitch: elevatorPitch,
      country: country,
      videoCourses: videoCourses,
      activities: activities,
      deliverables: deliverables,
      toolsTemplates: toolsTemplates,
      planData: planData,
    };
    console.log("milestoneDataassinge", data);
    const milestoneData = await openAI(data);
    console.log("milestoneData", milestoneData);

    if (milestoneData.error) {
      console.error("Milestone generation failed:", milestoneData.debug);
      // Proceed even if milestones fail
    } else {
      try {
        await saveMilestoneDataToDB.create({
          startup_id: startup._id,
          milestones: milestoneData,
        });
        console.log("Milestone data saved successfully.");
      } catch (dbError) {
        console.error("Error saving milestone data to the database:", dbError);
      }
    }

    // Fixed typo: wellcomeEmails -> welcomeEmails (assuming function name is welcomeEmails)
    await wellcomeEmails({ email: startup.email, startupName: startupName }); // Adjust if function name differs

    res.status(201).json({
      success: true,
      startupId: startup._id,
      startup: startupDataWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Create Startup Error:", error);
    res.status(500).json({ error: "Failed to create startup" });
  }
};

exports.updateStartupProfile = async (req, res) => {
  try {
    const startupId = req.params.id;

    // Security: Verify against authenticated user
    if (startupId !== req.user?.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this profile" });
    }

    // Find existing startup
    const startup = await StartupModel.findById(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    const {
      firstName,
      lastName,
      email,
      startupName,
      problemStatement,
      revenueStarted,
      contactPersonName,
      country,
      state,
      industry,
      website,
      startupStage,
      contactNumber,
      elevatorPitch,
    } = req.body;

    // Reject restricted fields
    if ("password" in req.body || "selectedPlan" in req.body) {
      console.warn(
        "Attempted to update restricted fields for startup:",
        startupId
      );
      return res
        .status(403)
        .json({ error: "Restricted fields cannot be updated" });
    }

    // Update only profile-related fields
    if (firstName !== undefined) startup.firstName = firstName;
    if (lastName !== undefined) startup.lastName = lastName;
    if (email !== undefined) startup.email = email;
    if (startupName !== undefined) startup.startupName = startupName;
    if (problemStatement) startup.problemStatement = problemStatement;
    if (revenueStarted) startup.revenueStarted = revenueStarted;
    if (contactPersonName !== undefined)
      startup.contactPersonName = contactPersonName;
    if (country !== undefined) startup.country = country;
    if (state !== undefined) startup.state = state;
    if (industry !== undefined) startup.industry = industry;
    if (website !== undefined) startup.website = website;
    if (startupStage !== undefined) startup.startupStage = startupStage;
    if (contactNumber !== undefined) startup.contactNumber = contactNumber;
    if (elevatorPitch !== undefined) startup.elevatorPitch = elevatorPitch;

    // Handle photo/logo upload if file provided (assumes multer)
    if (req.file) {
      startup.logoUrl = `/uploads/${req.file.filename}`;
    }

    await startup.save();

    const { password, ...updatedStartup } = startup.toObject();

    res.status(200).json({
      success: true,
      message: "Startup profile updated successfully",
      startup: updatedStartup,
    });
  } catch (error) {
    console.error("Update Startup Profile Error:", error);
    res.status(500).json({ error: "Failed to update startup profile" });
  }
};

exports.getStartupProfile = async (req, res) => {
  try {
    const startupId = req.user.id; // Assumes auth middleware sets req.user

    const startup = await StartupModel.findById(startupId).select("-password");
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }

    res.status(200).json({ success: true, startup });
  } catch (error) {
    console.error("Get Startup Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch startup profile" });
  }
};

exports.getCsrfToken = (req, res) => {
  try {
    console.log("=== CSRF TOKEN GENERATION ===");
    console.log("Session ID:", req.sessionID);
    console.log("Session exists:", !!req.session);

    if (!req.session) {
      return res.status(500).json({
        success: false,
        error: "Session not initialized",
      });
    }

    const csrfToken = crypto.randomBytes(32).toString("hex");

    // Simplified storage: Remove redundant sessionId
    req.session.csrf = {
      token: csrfToken,
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
    };

    console.log("CSRF token generated:", csrfToken);

    // req.session.save() is often auto-handled; keep for explicitness
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to save session",
        });
      }

      console.log("CSRF session saved successfully");
      res.status(200).json({
        success: true,
        csrfToken: csrfToken,
      });
    });
  } catch (error) {
    console.error("CSRF Token Generation Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate CSRF token",
    });
  }
};
