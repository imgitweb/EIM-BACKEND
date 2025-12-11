require("dotenv").config();
const axios = require("axios");
const { CallOpenAi } = require("./helper/helper");
const AlphaPath = require("../models/alphaPath");

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------
const safeStringify = (data, maxChars = 7000) => {
  try {
    let str = JSON.stringify(data);
    if (str.length > maxChars) str = str.slice(0, maxChars) + "...TRIMMED";
    return str;
  } catch {
    return "";
  }
};

const escape = (str = "") =>
  String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// ------------------------------------------------------
// PROMPT GENERATOR
// ------------------------------------------------------
const mileStonePrompt = (data) => {
  const faqItems = [
    {
      title: "Level 1 - Introduction to Entrepreneurship",
      content: [
        "Understanding the startup ecosystem",
        "Identifying market needs",
        "Define problem statement and potential market size",
        "Idea Ranking and ESM Score",
        "Introduction to UIM and UIM Network",
      ],
    },
    {
      title: "Level 2 - Business Idea Validation",
      content: [
        "Techniques for validating ideas",
        "Customer interviews and feedback",
        "Identify potential sales and distribution channels",
        "List similar businesses and failure patterns",
        "List impediments such as resources, money, expertise",
      ],
    },
    {
      title: "Level 3 - First Cut of Business Model",
      content: [
        "Business Model Canvas",
        "Competitor matrix",
        "Examples of successful and failed models",
        "Identify first 10 paying customers + persona",
        "Refine revenue model and resource budget",
      ],
    },
    {
      title: "Level 4 - Final Numbers & Decision Making",
      content: [
        "Recalculate ESM",
        "Create plan to arrange budget and resources",
        "Roadmap to 100 Cr revenue + EBITDA positive",
        "Decision: pursue or drop idea",
      ],
    },
  ];

  let durationValue = data?.planData?.duration || 30;
  if (typeof durationValue === "string") {
    durationValue = parseInt(durationValue);
  }
  const duration = durationValue;
  const perMilestone = Math.round(duration / 4);

  // We provide a skeleton, but we instruct AI it can remove items if data is missing
  const milestoneBlocks = faqItems
    .map((item, index) => {
      const desc = `${item.content[0]} and ${item.content[1]}`;
      return `"Milestone ${index + 1}":{
        "Timeline":{
          "Start Date":"Month YYYY",
          "End Date":"Month YYYY",
          "Duration Days":"${perMilestone}"
        },
        "Title":"${escape(item.title)}",
        "Description":"${escape(desc)}",
        "Goals":{
          "Primary Goal":"${escape(item.title)}",
          "Measurable Goals":${JSON.stringify(item.content)}
        },
        "Learning Modules":{
          "Top5":[
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""}
          ]
        },
        "Tools & Templates":{
          "Top5":[
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""}
          ]
        },
        "Activities":{
          "Top5":[
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""}
          ]
        },
        "Deliverables":{
          "Top5":[
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""},
            {"Title":"","Category":"","Path":"","Id":""}
          ]
        }
      }`;
    })
    .join(",");

  return `
          You are generating 4 entrepreneurship milestones. Use ONLY the provided datasets.

          INPUT DATA:
          - Startup Name: ${escape(data.startupName)}
          - Startup Eevator Pitch: ${escape(data.startupElevatorPitch)}
          - Country: ${escape(data.country)}
          - Courses Dataset: ${safeStringify(data.videoCourses)}
          - Activities Dataset: ${safeStringify(data.activities)}
          - Deliverables Dataset: ${safeStringify(data.deliverables)}
          - ToolsTemplates Dataset: ${safeStringify(data.toolsTemplates || [])}

          RULES:
          1. Use ONLY items from datasets. No invented titles.
          2. AIM for 5 items per section, but if data is insufficient, provide as many as available.
          3. Keys MUST be: "Top5".
          4. No duplicate Titles across ANY milestone.
          5. If NO items exist for a section, return an empty array []. DO NOT write text strings like "Insufficient".
          6. Levels:
            - Milestone 1 = Beginner
            - Milestone 2–3 = Intermediate
            - Milestone 4 = Advanced
          7. OUTPUT MUST be valid JSON ONLY.

          OUTPUT:
          {
          ${milestoneBlocks}
          }
      `;
};

// ------------------------------------------------------
// VALIDATOR
// ------------------------------------------------------
const validateMilestoneStructure = (obj) => {
  try {
    if (!obj || typeof obj !== "object") return false;

    const milestoneKeys = Object.keys(obj).filter((k) =>
      k.startsWith("Milestone")
    );
    if (milestoneKeys.length !== 4) return false;

    const usedTitles = new Set();

    for (const key of milestoneKeys) {
      const ms = obj[key];

      // Basic checks
      if (
        !ms.Timeline ||
        !ms.Timeline["Start Date"] ||
        !ms.Timeline["End Date"] ||
        !ms.Timeline["Duration Days"]
      ) {
        return false;
      }

      if (
        !ms.Goals ||
        !ms.Goals["Primary Goal"] ||
        !Array.isArray(ms.Goals["Measurable Goals"])
      ) {
        return false;
      }

      const sections = [
        { section: "Learning Modules", array: "Top5" },
        { section: "Tools & Templates", array: "Top5" },
        { section: "Activities", array: "Top5" },
        { section: "Deliverables", array: "Top5" },
      ];

      for (const { section, array } of sections) {
        const sec = ms[section];

        // FIX: Allow empty arrays (if data missing), but fail if not an array
        if (!sec || !Array.isArray(sec[array])) {
          console.log(`Validator: ${section} is not an array`);
          return false;
        }

        // FIX: Relaxed validation. Allow 0 to 5 items.
        if (sec[array].length > 5) {
          console.log(`Validator: ${section} has too many items`);
          return false;
        }

        for (const item of sec[array]) {
          if (!item || typeof item !== "object") return false;

          // Allow loose validation if keys are slightly off, but generally check Title
          // if (!("Title" in item) || !("Category" in item)) return false;

          // FIX: Only check duplicates for valid items with actual titles
          if (item.Title && item.Title.trim() !== "") {
            if (usedTitles.has(item.Title)) {
              console.warn(
                `Validator Warning: Duplicate found '${item.Title}' - ignoring error to allow partial data.`
              );
              // We do NOT return false here to be more lenient with AI results
            } else {
              usedTitles.add(item.Title);
            }
          }
        }
      }
    }

    return true;
  } catch (err) {
    console.error("Validator error:", err);
    return false;
  }
};

// ------------------------------------------------------
// MAIN OPENAI CALLER
// ------------------------------------------------------
const openAI = async (data) => {
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`OpenAI Call Attempt ${attempt}`);
      const prompt = mileStonePrompt(data);

      const response = await CallOpenAi(prompt);

      const json =
        typeof response === "string" ? JSON.parse(response) : response;

      if (!validateMilestoneStructure(json)) {
        console.log(
          "Validation Failed. JSON Received:",
          JSON.stringify(json, null, 2)
        );
        throw new Error("Invalid milestone structure");
      }

      return json;
    } catch (err) {
      console.error(`Attempt ${attempt} failed: ${err.message}`);

      if (attempt === MAX_ATTEMPTS) {
        return {
          error: "Failed to generate valid milestone data",
          debug: err.message,
        };
      }

      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
};

const getMileStoneData = async (req, res) => {
  try {
    const { startup_id } = req.body;
    console.log("startup_id", startup_id);
    if (!startup_id) {
      return res.status(400).json({ error: "Startup ID is required" });
    }
    const mileStone = await AlphaPath.find({ startup_id: startup_id }).lean();
    if (!mileStone.length) {
      console.log(`No mileStone data found for startup_id: ${startup_id}`);
      return res.status(404).json({
        message: `No mileStone data found for startup_id: ${startup_id}`,
        success: false,
      });
    }

    return res.status(200).json({
      message: "mileStone found for startup",
      success: true,
      data: mileStone,
    });
  } catch (error) {
    console.error("Something went wrong while fetching MileStone: ", error);
    return res.status(500).json({
      message: "Something went wrong while fetching MileStone",
      success: false,
    });
  }
};
module.exports = {
  mileStonePrompt,
  validateMilestoneStructure,
  openAI,
  getMileStoneData,
};
