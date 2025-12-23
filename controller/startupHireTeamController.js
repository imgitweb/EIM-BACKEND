const StartupHireTeam = require("../models/StartupHireTeamModel");

const validateHireTeamData = (data) => {
  const errors = {};

  const isEmpty = (val) =>
    !val || (typeof val === "string" && !val.trim());

  // Basic info
  if (isEmpty(data.startupName))
    errors.startupName = "Company Name is required";

  if (isEmpty(data.recruiterName))
    errors.recruiterName = "Recruiter's Full Name is required";

  if (isEmpty(data.email)) {
    errors.email = "Official Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address";
  }

  if (isEmpty(data.contactNumber)) {
    errors.contactNumber = "Contact Number is required";
  } else if (
    !/^\d{10,}$/.test(data.contactNumber.replace(/[\s\-]/g, ""))
  ) {
    errors.contactNumber = "Enter a valid phone number";
  }

  // Company/startup info — optional for anonymous posts. Validate only if provided.
  if (data.website) {
    if (!/^https?:\/\//i.test(data.website) && !/^www\./i.test(data.website)) {
      errors.website = "Enter a valid website URL (include protocol or start with www)";
    }
  }

  if (data.linkedin) {
    if (!/linkedin\.com/i.test(data.linkedin)) {
      errors.linkedin = "Enter a valid LinkedIn URL";
    }
  }

  if (isEmpty(data.jobTitle))
    errors.jobTitle = "Job Title is required";

  if (isEmpty(data.jobType))
    errors.jobType = "Work Type is required";

  if (isEmpty(data.jobDescription))
    errors.jobDescription = "Job Description is required";

  if (isEmpty(data.workLocation))
    errors.workLocation = "Job Location is required";

  if (isEmpty(data.skills))
    errors.skills = "Required Skills are required";

  if (isEmpty(data.experience))
    errors.experience = "Experience Level is required";

  if (isEmpty(data.education))
    errors.education = "Education Qualification is required";

  // Salary
  if (data.salaryMin === undefined || data.salaryMin === null) {
    errors.salaryMin = "Minimum Salary is required";
  } else if (isNaN(data.salaryMin) || data.salaryMin < 0) {
    errors.salaryMin = "Minimum Salary must be a valid number";
  }

  if (data.salaryMax === undefined || data.salaryMax === null) {
    errors.salaryMax = "Maximum Salary is required";
  } else if (isNaN(data.salaryMax) || data.salaryMax < 0) {
    errors.salaryMax = "Maximum Salary must be a valid number";
  }

  if (
    !errors.salaryMin &&
    !errors.salaryMax &&
    Number(data.salaryMin) > Number(data.salaryMax)
  ) {
    errors.salaryMax = "Maximum Salary must be greater than Minimum Salary";
  }

  if (isEmpty(data.currency))
    errors.currency = "Currency is required";

  if (!data.applicationDeadline) {
    errors.applicationDeadline = "Application Deadline is required";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(data.applicationDeadline);
    deadlineDate.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      errors.applicationDeadline =
        "Application Deadline must be today or later";
    }
  }

  return errors;
};

exports.createStartupHireTeam = async (req, res) => {
  try {
    const dataToValidate = { ...req.body };

    try {
      if (req.user) {
        if (!dataToValidate.website && req.user.website) {
          dataToValidate.website = req.user.website;
        }

        // linkedin may be stored in socialLinks array
        if (!dataToValidate.linkedin && Array.isArray(req.user.socialLinks)) {
          const ln = req.user.socialLinks.find((s) => /linkedin/i.test(s.platform || "") || /linkedin\.com/i.test(s.url || ""));
          if (ln && ln.url) dataToValidate.linkedin = ln.url;
        }

        if (!dataToValidate.country && req.user.country) {
          dataToValidate.country = req.user.country;
        }

        if (!dataToValidate.stage && req.user.startupStage) {
          dataToValidate.stage = req.user.startupStage;
        }

        if (!dataToValidate.sector && req.user.industry) {
          dataToValidate.sector = req.user.industry;
        }

        dataToValidate.createdBy = req.userId || req.user._id || dataToValidate.createdBy;
      }
    } catch (err) {
      console.warn("Auto-fill startup fields failed:", err.message || err);
    }

    const validationErrors = validateHireTeamData(dataToValidate);

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const newEntry = new StartupHireTeam({
      ...dataToValidate,
      isActive: true,
    });

    const savedEntry = await newEntry.save();

    return res.status(201).json({
      success: true,
      message: "Job posting created successfully",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error creating Startup Hire Team:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save job posting",
      error: error.message,
    });
  }
};


exports.getAllStartupHireTeams = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { startupName: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const entries = await StartupHireTeam.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await StartupHireTeam.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: entries,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching job posts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job postings",
      error: error.message,
    });
  }
};

/**
 * GET JOB BY ID
 */
exports.getStartupHireTeamById = async (req, res) => {
  try {
    const entry = await StartupHireTeam.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job posting",
      error: error.message,
    });
  }
};

/**
 * SOFT DELETE / CLOSE JOB
 */
exports.closeJobPosting = async (req, res) => {
  try {
    const updatedEntry = await StartupHireTeam.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job posting closed successfully",
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Error closing job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to close job posting",
      error: error.message,
    });
  }
};
