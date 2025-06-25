require("dotenv").config();
const axios = require("axios");
const OpenAI = require("../config/ChecklistPrompt");

const mileStonePrompt = (data) => {
  const escapeString = (str) => str.replace(/[`"\\]/g, "\\$&");

  const alphaPlanData = {
    id: "alpha",
    name: "Alpha",
    duration: "30 days",
    description: "Alpha Quadrant – 30 days entrepreneurship program",
  };

  const faqItems = [
    {
      title: "Week 1 - Introduction to Entrepreneurship",
      content: [
        "Understanding the startup ecosystem",
        "Identifying market needs",
        "Define problem statement and potential market size in your country and globally.",
        "Idea Ranking and chances of success meter (ESM Score out of 100)",
        "Introduction to UIM and UIM Network",
      ],
    },
    {
      title: "Week 2 - Business Idea Validation", // Fixed from "Week 5"
      content: [
        "Techniques for validating ideas",
        "Customer interviews and feedback",
        "Identify potential sales and distribution channels.",
        "List out similar businesses, their success and failure patterns",
        "List out the potential impediments with this idea and execution such as founders' knowledge, resources, money, technology exposure, etc.",
      ],
    },
    {
      title: "Week 3 - First Cut of Business Model",
      content: [
        "Introduction to business model canvas",
        "List out the potential competitors and prepare a matrix.",
        "Examples of successful and failed business models",
        "List out 10 potential customers who would pay for your services and create a customer persona.",
        "Fine-tune revenue model for your idea",
        "List out the required budget and resources for MLP and for full-fledged product development.",
      ],
    },
    {
      title: "Week 4 - Finalizing Numbers and Decision Making",
      content: [
        "Recalculate ESM",
        "Create a viable plan to arrange the required budget and resources listed out last week.",
        "Create Potential Roadmap to 100 Crore Revenue and positive EBITDA",
        "Decision time – if you would like to pursue this idea further or drop it right here.",
      ],
    },
  ];

  const milestoneStructureText = faqItems
    .map((item, index) => {
      const description = item.content.slice(0, 2).join(" and ");
      return `"Milestone ${index + 1}": {
        "Timeline": {
          "Start Date": "Month YYYY",
          "End Date": "Month YYYY",
          "Duration (Days)": "${Math.round(30 / faqItems.length)}"
        },
        "Title": "${escapeString(item.title)}",
        "Description": "${escapeString(description)}",
        "Goals": {
          "Primary Goal": "${escapeString(item.title)}",
          "Measurable Goals": ${JSON.stringify(item.content)}
        },
        "TechVerse": {
          "Top 5 Relevant Technical Courses": [
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" }
          ]
        },
        "ProVision": {
          "Top 5 Relevant Non-Technical Courses": [
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" }
          ]
        },
        "SkillForge": {
          "Top 5 Relevant Certification Courses": [
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" }
          ]
        },
        "NetX": {
          "Top 5 Relevant Key Activity Courses": [
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" },
            { "Title": "", "Category": "" }
          ]
        }
      }`;
    })
    .join(",\n");

  return `You are an expert AI career planner for the Alpha Quadrant 30-day entrepreneurship program.

Create a ${
    faqItems.length
  }-step career roadmap based on the resume, desired role, and job goal, using only courses from the provided video course list.

### Plan:
${alphaPlanData.description}

### Milestones:
${faqItems
  .map(
    (item, index) =>
      `Milestone ${index + 1}: ${item.title} - ${item.content
        .slice(0, 2)
        .join(" and ")}`
  )
  .join("\n")}

### Input:
- Target Startup Name: ${data.startupName}
- Target Country: ${data.country}

### Conditions:
- Use only {data.videoCourses}. Do not invent courses.
- Select 5 courses per section based on keyword and semantic matching to entrepreneurship, role, and resume.
- If fewer than 5 relevant courses, use "Insufficient relevant courses" and pick the next best.
- No course reuse across milestones or sections.
- Infer course level: Milestone 1 (Beginner), Milestones 2-3 (Intermediate), Milestone 4 (Advanced).

### Sections:
- TechVerse: 5 technical courses (e.g., market analysis, business tools).
- ProVision: 5 soft skills courses (e.g., communication, leadership).
- SkillForge: 5 certification courses (e.g., business certifications).
- NetX: 5 networking/branding courses (e.g., pitching, networking).

### Timeline:
- Total duration: 30 days, ~${Math.round(
    30 / faqItems.length
  )} days per milestone.
- Use sequential, non-overlapping dates starting from ${new Date().toLocaleString(
    "default",
    { month: "long", year: "numeric" }
  )}.
- Format: "Month YYYY".

### Output:
Return valid JSON:
{
  ${milestoneStructureText}
}

### Instructions:
- Align courses with Alpha Quadrant entrepreneurship goals.
- No course repetition.
- Return only raw JSON, no extra text.
`;
};

const validateMilestoneStructure = (milestone) => {
  try {
    if (!milestone || typeof milestone !== "object") return false;

    const milestoneKeys = Object.keys(milestone).filter((key) =>
      key.startsWith("Milestone")
    );
    if (milestoneKeys.length !== 4) return false;

    const usedCourses = new Set();
    for (const key of milestoneKeys) {
      const ms = milestone[key];
      if (
        !ms.Timeline ||
        !ms.Timeline["Start Date"] ||
        !ms.Timeline["End Date"] ||
        !ms.Timeline["Duration (Days)"]
      )
        return false;
      if (
        !ms.Goals ||
        !ms.Goals["Primary Goal"] ||
        !Array.isArray(ms.Goals["Measurable Goals"])
      )
        return false;

      const sections = [
        { section: "TechVerse", key: "Top 5 Relevant Technical Courses" },
        { section: "ProVision", key: "Top 5 Relevant Non-Technical Courses" },
        { section: "SkillForge", key: "Top 5 Relevant Certification Courses" },
        { section: "NetX", key: "Top 5 Relevant Key Activity Courses" },
      ];

      for (const { section, key } of sections) {
        if (
          !ms[section] ||
          !Array.isArray(ms[section][key]) ||
          ms[section][key].length !== 5
        )
          return false;
        for (const course of ms[section][key]) {
          if (
            !course ||
            !course.Title ||
            !course.Category ||
            usedCourses.has(course.Title)
          )
            return false;
          usedCourses.add(course.Title);
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
};

const callOpenAI = async (data) => {
  const MAX_ATTEMPTS = 1;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    try {
      attempt++;
      console.log(`Calling OpenAI - Attempt ${attempt}/${MAX_ATTEMPTS}`);

      const prompt = mileStonePrompt(data);
      const response = await callOpenAI.createCompletion({
        prompt: prompt,
        max_tokens: 2000, // Increased to handle larger output
        temperature: 0.7,
      });

      let milestoneData;
      try {
        milestoneData = JSON.parse(response.data.choices[0].text.trim());
      } catch (parseError) {
        console.log(`JSON parse error on attempt ${attempt}, trying repair...`);
        milestoneData = attemptJSONRepair(response.data.choices[0].text.trim());
        if (!milestoneData)
          throw new Error("Failed to parse AI response as JSON");
      }

      if (!validateMilestoneStructure(milestoneData)) {
        throw new Error("Invalid milestone structure");
      }

      console.log("Successfully generated valid milestone data");
      return milestoneData;
    } catch (error) {
      console.error(
        `OpenAI call failed (attempt ${attempt}): ${error.message}`
      );
      if (attempt >= MAX_ATTEMPTS) {
        return {
          error: "Failed to generate valid milestone data",
          debug: { error: error.message },
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
    }
  }
};

const attemptJSONRepair = (jsonString) => {
  try {
    let cleaned = jsonString.trim().replace(/^```json\s*|\s*```$/g, "");
    try {
      return JSON.parse(cleaned);
    } catch {
      cleaned = cleaned
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/'([^']+)'/g, '"$1"');
      return JSON.parse(cleaned);
    }
  } catch (error) {
    console.error("JSON repair failed:", error);
    return null;
  }
};

module.exports = { mileStonePrompt, validateMilestoneStructure, callOpenAI };
