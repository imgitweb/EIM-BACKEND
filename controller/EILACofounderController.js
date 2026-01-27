const { CallOpenAi } = require("./helper/helper");

const askEila = async (req, res) => {
  try {
    const { question, startupContext } = req.body;
    console.log("EILA Request Received for:", startupContext);
    console.log("Question:", question);

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    /* ================= EXTRACT DATA ================= */

    const user = startupContext?.userInfo || {};
    const metrics = startupContext?.metrics || {};

    // ✅ Founder name
    const founderName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Founder";

    /* ================= DETECT MORNING BRIEF ================= */

    const isMorningBrief =
      question.toLowerCase().includes("morning brief") ||
      question.toLowerCase().includes("morning update");

    /* ================= EILA SYSTEM PROMPT ================= */

    const systemPrompt = `
You are EILA — a female AI Co-Founder and strategic partner.

You behave like a real startup co-founder.

PERSONALITY:
- Strategic
- Honest
- Execution focused
- Data driven
- Protective of startup success

BEHAVIOR:
1. Always prioritize today's most important actions
2. Highlight risks clearly
3. Avoid fluff
4. Use startup data to guide decisions

LANGUAGE:
Match user's language (English/Hinglish)

${isMorningBrief ? `
MORNING BRIEF RULE:
Start Summary with:
"Good Morning, ${founderName}."
Then give today's top priorities.
` : ""}

MANDATORY RESPONSE JSON:
{
  "Summary": "Sharp strategic guidance in 20–25 words"
}
`;

    /* ================= CONTEXT ================= */

    const contextdata = user._id
      ? `
STARTUP DETAILS:

Founder: ${founderName}
Startup: ${user.startupName}
Industry: ${user.industry}
Stage: ${user.startupStage}
Business Model: ${user.businessModel}
Revenue Started: ${user.revenueStarted}
Location: ${user.city}, ${user.state}, ${user.country}

PROBLEM:
${user.problemStatement}

SOLUTION:
${user.solutionDescription}

PITCH:
${user.elevatorPitch}

FINANCIALS:
Bootstrap: ${JSON.stringify(user.bootstrap || "N/A")}
Revenue: ${JSON.stringify(user.revenue || "N/A")}

METRICS:
${JSON.stringify(metrics || "N/A")}
`
      : "No startup data provided.";

    /* ================= FINAL PROMPT ================= */

    const finalPrompt = `
CONTEXT:
${contextdata}

FOUNDER QUESTION:
"${question}"

INSTRUCTION:
Respond as a real startup co-founder.
Be practical, strategic, and execution focused.
`;

    /* ================= OPENAI ================= */

    const eilaResponse = await CallOpenAi(finalPrompt, systemPrompt);

    /* ================= SAFE JSON ================= */

    let formattedAnswer;

    try {
      formattedAnswer =
        typeof eilaResponse === "string"
          ? JSON.parse(eilaResponse)
          : eilaResponse;
    } catch {
      formattedAnswer = { Summary: eilaResponse };
    }

    return res.status(200).json({
      success: true,
      answer: formattedAnswer
    });

  } catch (error) {
    console.error("EILA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "EILA failed to respond"
    });
  }
};

module.exports = { askEila };
