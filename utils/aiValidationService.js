const { CallOpenAi } = require("../controller/helper/helper.js");

exports.validateIdeaWithAI = async (ideaData) => {
  const { title, problem, solution, audience } = ideaData;
  const prompt = `
    You are a startup idea evaluator. Analyze this idea and give a realistic assessment with a total score out of 100.

    Startup Idea Details:
    - Title: ${title}
    - Problem: ${problem}
    - Solution: ${solution}
    - Target Audience: ${audience}

    Please respond ONLY in valid JSON with the following structure:

    {
      "score": <number between 0-100>,
      "strengths": [<3 bullet points>],
      "weaknesses": [<3 bullet points>],
      "opportunities": [<3 bullet points>],
      "risks": [<3 bullet points>]
    }
    `;

  try {
    const completion = CallOpenAi(prompt);

    let result;
    try {
      result = completion;
    } catch (err) {
      console.warn("⚠️ AI returned invalid JSON, using fallback result");
      result = {
        score: Math.floor(Math.random() * 41) + 60,
        strengths: ["Creative concept", "Market relevance", "Good scalability"],
        weaknesses: [
          "Unclear differentiation",
          "Limited data",
          "Needs traction",
        ],
        opportunities: [
          "Growing segment",
          "Tech leverage",
          "Partnership potential",
        ],
        risks: ["Competition", "Funding dependency", "Execution risk"],
      };
    }

    return result;
  } catch (error) {
    console.error("❌ Error in AI validation service:", error.message);
    throw new Error("AI validation failed");
  }
};
exports.analyzeRisksAI = async ({ startup, generateCount }) => {
  const prompt = `
You are a senior startup risk analyst.

Respond ONLY with valid JSON (no markdown, no explanation).

Exact JSON structure:
{
  "radarScores": {
    "Market Fit": <0-100>,
    "Tech Viability": <0-100>,
    "Cost": <0-100>,
    "Execution": <0-100>,
    "Competition": <0-100>
  },
  "swot": {
    "strengths": [3 concise points],
    "weaknesses": [3 concise points],
    "opportunities": [3 concise points],
    "threats": [3 concise points]
  },
  "topRisks": [
    {
      "risk": "short title",
      "impact": "real business impact",
      "mitigation": "clear mitigation strategy"
    }
  ]
}

Generate exactly ${generateCount} risks.

Startup Details:
- Name: ${startup.startupName || "N/A"}
- Industry: ${startup.industry || "N/A"}
- Problem: ${startup.problemStatement || "N/A"}
- Solution: ${startup.solutionDescription || "N/A"}
- Target Audience: ${startup.targetedAudience || "N/A"}
- Stage: ${startup.startupStage || "N/A"}
`;

  try {
    const completion = await CallOpenAi(prompt);

    return completion; // assuming JSON already parsed
  } catch (error) {
    console.error("❌ AI Risk Analysis Error:", error.message);

    // 🔁 Safe fallback
    return {
      radarScores: {
        "Market Fit": 65,
        "Tech Viability": 70,
        "Cost": 60,
        "Execution": 68,
        "Competition": 75,
      },
      swot: {
        strengths: [
          "Clear problem identification",
          "Strong technical foundation",
          "Scalable idea",
        ],
        weaknesses: [
          "Unvalidated customer demand",
          "Limited capital runway",
          "Founder execution risk",
        ],
        opportunities: [
          "Growing digital adoption",
          "Niche market entry",
          "Potential strategic partnerships",
        ],
        threats: [
          "Well-funded competitors",
          "Changing regulations",
          "Customer acquisition costs",
        ],
      },
      topRisks: Array.from({ length: generateCount }).map((_, i) => ({
        risk: `Critical startup risk ${i + 1}`,
        impact: "This risk could significantly slow growth or cause failure.",
        mitigation:
          "Run controlled experiments, validate assumptions early, and monitor metrics weekly.",
      })),
    };
  }
};

exports.generateMarketCaseStudiesAI = async (caseData) => {
  const { idea, problem, solution, sector } = caseData;

  const prompt = `
You are an expert startup market analyst. Based on the startup details below, generate **exactly 5** realistic case studies of startups that tackled similar problems or worked in related domains.

Startup Info:
- Idea: ${idea}
- Problem: ${problem}
- Solution: ${solution}
- Sector: ${sector}

Requirements:
1. Output must be **valid JSON only** — no explanations, no notes, no markdown.
2. Out of the 5 case studies:
   - **2 must be Indian startups**
   - **3 must be from other countries** (different continents if possible)
3. Each startup should include:
   - **name**: Real or realistic startup name
   - **country**: Country of origin
   - **model**: One-line description of the business or tech model
   - **funding**: Funding stage and/or amount
   - **learning**: A key learning, pivot, or strategic insight

4. After the list, include a short **"insight"** field summarizing what can be learned overall.

Return JSON strictly in this structure:

{
  "cases": [
    {
      "name": "Startup Name",
      "country": "Country",
      "model": "Short model overview",
      "funding": "Funding Stage / Amount",
      "learning": "What they learned or pivoted"
    }
  ],
  "insight": "Brief summary of cross-case learnings"
}
`;

  try {
    const completion = await CallOpenAi(prompt);

    let result;
    try {
      result = completion;
    } catch (err) {
      console.warn(
        "⚠️ AI returned invalid JSON for case studies, using fallback."
      );

      // Reliable fallback
      result = {
        cases: [
          {
            name: "AgroSense",
            country: "India",
            model: "IoT-driven soil analytics for small farmers",
            funding: "$2.5M Seed Round",
            learning:
              "Built rural partnerships early to reduce deployment costs",
          },
          {
            name: "HealthBridge",
            country: "India",
            model: "Telemedicine platform connecting patients to local doctors",
            funding: "$4M Series A",
            learning: "Localized user experience improved adoption rates",
          },
          {
            name: "FarmVision",
            country: "USA",
            model: "AI-based crop monitoring SaaS for agribusinesses",
            funding: "$7M Series A",
            learning:
              "Pivoted to enterprise clients after B2C traction stalled",
          },
          {
            name: "EcoGrow",
            country: "Netherlands",
            model: "Smart vertical farming system for urban agriculture",
            funding: "$5M Seed Round",
            learning: "Shifted focus to B2B restaurant partnerships",
          },
          {
            name: "CropChain",
            country: "Brazil",
            model: "Blockchain-based produce traceability system",
            funding: "$6M Pre-Series A",
            learning:
              "Leveraged partnerships with cooperatives for faster scaling",
          },
        ],
        insight:
          "Cross-case learning: Indian startups excel through localization and partnerships, while global peers highlight the power of pivots, B2B transitions, and technology-led scalability.",
      };
    }

    return result;
  } catch (error) {
    console.error("❌ AI Market Case Studies Error:", error.message);
    throw new Error("AI market case studies generation failed");
  }
};

exports.generateFeaturesAI = async (featureList) => {
  try {
    const prompt = `
You are a senior product strategist specializing in MVP planning.

For each of the following features, provide a detailed and concise JSON response in the exact structure below.
Do NOT include explanations or markdown.

Input features: ${featureList}

Respond with JSON in this exact format:
{
  "features": [
    {
      "description": "Payment Gateway",
      "priority": "Must-Have",
      "tasks": [
        "Integrate secure payment processor (Stripe, PayPal).",
        "Implement payment API and webhook event handlers.",
        "Add transaction history and receipts."
      ],
      "techStack": ["Node.js", "Stripe API", "React"],
      "effort": "High",
      "notes": "Essential for monetization; ensure compliance with PCI DSS."
    },
    {
      "description": "Analytics Dashboard",
      "priority": "Should-Have",
      "tasks": [
        "Implement admin analytics UI.",
        "Integrate metrics API for user activity tracking.",
        "Create summary visualization charts."
      ],
      "techStack": ["React", "Chart.js", "Node.js"],
      "effort": "Medium",
      "notes": "Useful for business insights and growth metrics."
    }
  ]
}`;

    // 🔥 Call OpenAI
    const completion = await CallOpenAi(prompt);

    let result;
    try {
      result = completion;
    } catch (err) {
      console.warn("⚠️ AI returned malformed JSON, applying fallback.");

      // Fallback — minimal, but safe structured response
      const features = featureList
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
      result = {
        features: features.map((f) => ({
          description: f,
          priority: "Could-Have",
          tasks: [
            `Define key functional requirements for ${f}.`,
            `Design frontend UI components for ${f}.`,
            `Implement backend endpoints for ${f}.`,
          ],
          techStack: ["React", "Node.js", "MongoDB"],
          effort: "Medium",
          notes: "Generated via fallback mode; AI response was invalid JSON.",
        })),
      };
    }

    return result;
  } catch (error) {
    console.error("❌ AI Feature Generation Error:", error.message);
    throw new Error("AI market case studies generation failed");
  }
};

exports.generateBuilderAI = async (inputData) => {
  const { platform, idea, answers } = inputData;
  try {
    const prompt = `
You are an experienced startup product strategist and MVP planner.

Your job is to generate a **clean, production-ready HTML** roadmap for a startup's MVP (Minimum Viable Product),
based on the following input:

Platform: ${platform || "N/A"}
Idea: ${idea || "N/A"}
User Answers: ${JSON.stringify(answers, null, 2)}

Requirements for your output:
- Respond ONLY with valid HTML (no markdown, no code fences, no backticks).
- Use clean structure, headings, and bullet points.
- Keep tone professional, simple, and action-oriented.
- Each section should be concise, not verbose.
- Highlight tech recommendations clearly.
- Add short, insightful notes in <em>italic</em> when useful.

Your HTML must follow this exact layout:

<h2>1. Overview</h2>
<p>Briefly describe what this MVP is about and its strategic direction.</p>

<h2>2. Core Features</h2>
<ul>
  <li>List 4–6 key features that align with the idea and platform.</li>
</ul>

<h2>3. Recommended Tech Stack</h2>
<ul>
  <li><strong>Frontend:</strong> Suggest frameworks or tools.</li>
  <li><strong>Backend:</strong> Suggest core technology choices.</li>
  <li><strong>Database:</strong> Recommend storage option.</li>
  <li><strong>Hosting:</strong> Recommend deployment environment.</li>
</ul>

<h2>4. Timeline & Milestones</h2>
<ul>
  <li><strong>Week 1–2:</strong> Design – wireframes, prototypes.</li>
  <li><strong>Week 3–5:</strong> Development – core functionality build.</li>
  <li><strong>Week 6:</strong> QA and launch preparation.</li>
</ul>

<h2>5. Strategic Recommendations</h2>
<ul>
  <li>Give 3–4 concise business or product strategy suggestions.</li>
</ul>

At the end, add:
<p><em>This roadmap is AI-generated based on the provided inputs and should be refined before execution.</em></p>
`;

    const htmlResponse = await CallOpenAi(prompt);

    return { htmlResponse };
  } catch (error) {
    console.error("❌ AI MVP Generation Error:", error.message);
    throw new Error("AI generation failed");
  }
};

exports.generateInhousePlan = async (startup) => {
  console.log(
    "🚀 Generating In-House Team Plan for Startup:",
    startup.startupName
  );
  try {
    const prompt = `
You are an experienced startup HR and tech strategy consultant.
Based on the following startup information, generate a detailed in-house team hiring plan in JSON format.

Startup Details:
- Name: ${startup.startupName || "N/A"}
- Problem: ${startup.problemStatement || "N/A"}
- Solution: ${startup.solutionDescription || "N/A"}
- Target Audience: ${startup.targetedAudience || "N/A"}
- Industry: ${startup.industry || "N/A"}
- Stage: ${startup.startupStage || "N/A"}

Respond strictly with valid JSON using this structure:
{
  "overview": "Short summary of the hiring strategy.",
  "roles": [
    {
      "title": "Role name",
      "responsibilities": ["Task 1", "Task 2"],
      "skills": ["Skill 1", "Skill 2"],
      "estimatedSalary": "$ per year",
      "hiringPriority": "High/Medium/Low"
    }
  ],
  "estimatedTimeline": "Example: 4–6 months",
  "estimatedCost": "Approx total cost per year",
  "recommendedTechStack": ["React", "Node.js", "MongoDB"],
  "milestones": ["Define roadmap", "Hire team", "Build MVP", "Test & launch"],
  "aiInsight": "Short AI insight about optimizing hiring and team setup."
}
`;

    const completion = await CallOpenAi(prompt);

    let plan;
    try {
      plan = completion;
    } catch (err) {
      console.warn("⚠️ AI returned invalid JSON, applying fallback.");
      console.warn("Returned content:", content);

      // 🩹 Fallback plan if JSON invalid
      plan = {
        overview: "Fallback plan used because AI response was invalid JSON.",
        roles: [
          {
            title: "Full Stack Developer",
            responsibilities: [
              "Build and maintain the web application",
              "Integrate APIs and handle deployment",
            ],
            skills: ["React", "Node.js", "MongoDB"],
            estimatedSalary: "$80,000 / year",
            hiringPriority: "High",
          },
          {
            title: "UI/UX Designer",
            responsibilities: [
              "Create wireframes and design system",
              "Conduct user research and improve usability",
            ],
            skills: ["Figma", "UX Research"],
            estimatedSalary: "$60,000 / year",
            hiringPriority: "Medium",
          },
        ],
        estimatedTimeline: "4–6 months",
        estimatedCost: "$140,000 / year",
        recommendedTechStack: ["React", "Node.js", "MongoDB"],
        milestones: [
          "Hire core team",
          "Build MVP",
          "Conduct testing",
          "Launch public beta",
        ],
        aiInsight:
          "Start with a lean core team and scale gradually as the MVP stabilizes.",
      };
    }

    return { success: true, plan };
  } catch (error) {
    console.error("❌ AI In-House Plan Generation Error:", error.message);
    throw new Error("AI generation failed");
  }
};
