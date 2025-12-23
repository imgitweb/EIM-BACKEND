const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const StartupModel = require("../../models/signup/StartupModel.js");
const saveMilestoneDataToDB = require("../../models/alphaPath.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { openAI } = require("../milistoneController.js");
const videoCoursesModel = require("../../models/courses/Course.js");
const {
  ActivityModel,
} = require("../../models/ActivityModel/activityModel.js");
const {
  deliverableModel,
} = require("../../models/DeliverablesModel/deliverables.js");
const templateModel = require("../../models/templateModel.js");
const wellcomeEmails = require("../../utils/wellcomeEmails");

// Load plans with error handling
const getPlans = () => {
  try {
    const plansPath = path.join(__dirname, "../../config/Plans.json");
    if (!fs.existsSync(plansPath)) {
      throw new Error("Plans configuration file not found");
    }
    const plansData = JSON.parse(fs.readFileSync(plansPath, "utf8"));
    return plansData.plans;
  } catch (error) {
    console.error("Failed to load plans:", error);
    return [];
  }
};

exports.getPlans = (req, res) => {
  try {
    const plans = getPlans();

    console.log("secound getPlans ");
    if (!plans || plans.length === 0 || plans.length === "Free") {
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
    const plans = getPlans();
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
    console.log("req.body", req.body);
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const saltRounds = 10;
    const bpassword = await bcrypt.hash(password, saltRounds);

    const existingStartup = await StartupModel.findOne({
      $or: [{ email }, { startupName: startupName ? startupName : undefined }],
    });

    if (existingStartup) {
      if (existingStartup.email === email) {
        return res.status(409).json({ error: "Email already registered" });
      } else if (startupName && existingStartup.startupName === startupName) {
        return res.status(409).json({ error: "Startup name already exists" });
      }
    }

    // Create new startup with available information
    const startupData = {
      firstName,
      lastName,
      email,
      password: bpassword, // Note: Assuming password hashing is handled in the model's pre-save hook
      selectedPlan: validPlanIds.includes(selectedPlan)
        ? selectedPlan
        : "alpha",
    };
    const plansinfo = getPlans(); // assuming this returns an array of plans
    const planData = plansinfo.find((plan) => plan.id === selectedPlan);
    console.log("planData", planData);

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
    // if (logoUrl) startupData.logoUrl = logoUrl;

    const startup = new StartupModel(startupData);
    await startup.save();

    const { password: pwd, ...startupDataWithoutPassword } = startup.toObject();
    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: startup._id, email: startup.email },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "24h" }
    );

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
      startupElevatorPitch: elevatorPitch, // No fallback
      country: country, // No fallback
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
      // Proceed with startup creation even if milestones fail
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
    await wellcomeEmails({ email: startup.email, startupName: startupName });
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

    // Reject password or plan updates if attempted
    if ("password" in req.body || "selectedPlan" in req.body) {
      console.warn(
        "Attempted to update restricted fields for startup:",
        startupId
      );
    }

    // Update only profile-related fields
    if (firstName) startup.firstName = firstName;
    if (lastName) startup.lastName = lastName;
    if (email) startup.email = email;
    if (startupName) startup.startupName = startupName;
    if (problemStatement) startup.problemStatement = problemStatement;
    if (revenueStarted) startup.revenueStarted = revenueStarted;
    if (contactPersonName) startup.contactPersonName = contactPersonName;
    if (country) startup.country = country;
    if (state) startup.state = state;
    if (industry) startup.industry = industry;
    if (website) startup.website = website;
    if (startupStage) startup.startupStage = startupStage;
    if (contactNumber) startup.contactNumber = contactNumber;
    if (elevatorPitch) startup.elevatorPitch = elevatorPitch;

    // Handle photo/logo upload if file provided
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
    // Assume user ID is extracted from JWT token in auth middleware
    const startupId = req.user.id;

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

    // Store CSRF token using same structure as OTP (which works)
    req.session.csrf = {
      token: csrfToken,
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
      sessionId: req.sessionID,
    };

    console.log("CSRF token generated:", csrfToken);

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
