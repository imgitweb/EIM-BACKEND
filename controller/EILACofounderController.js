const { CallOpenAi } = require("./helper/helper");

const askEila = async (req, res) => {
  try {
    const { question, startupContext } = req.body;
    console.log("EILA Request Received for:", startupContext?.userInfo?.startupName);

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    // Extracting nested data from startupContext
    const user = startupContext?.userInfo || {};
    const metrics = startupContext?.matrix || {};

    /* ================= EILA SYSTEM PROMPT (Point 17 & 19) ================= */
    const systemPrompt = `
    You are EILA — the AI Co-Founder. 
    Definition: Eila is an AI co-founder that guides decisions, accelerates execution, and makes sure no critical detail is ever missed.

    You are NOT a chatbot. You are a high-stakes Strategic Partner.
    Your tone: Direct, Analytical, Honest, and Action-Oriented.

    Your core responsibilities:
    1. 🎯 Decision Architect: Guide strategic pivots and kill low-impact ideas.
    2. 🚀 Execution Accelerator: Force focus on daily momentum and ownership.
    3. 📉 Brutal Analyst: Question assumptions using the startup's specific metrics.

    LANGUAGE RULE:
    - Match the user's language. If they use Hinglish, respond in Hinglish.
    - If they use English, respond in professional English.
    - Match the founder's energy.

    MANDATORY JSON RESPONSE FORMAT:
    Return ONLY a valid JSON object:
    {
      "Summary": "Direct advice or answer (Strictly 20-30 words)"
      
    }
    `;

    /* ================= STARTUP CONTEXT MAPPING ================= */
    const contextdata = user._id 
      ? `
STARTUP DATA:
- Name: ${user.startupName}
- Industry: ${user.industry}
- Stage: ${user.startupStage}
- Pitch: ${user.elevatorPitch}
- Problem: ${user.problemStatement}
- Location: ${user.state}, ${user.country}
- Revenue Started: ${user.revenueStarted}

METRICS SNAPSHOT:
- Revenue Data: ${JSON.stringify(metrics.revenue || "N/A")}
- Runway: ${JSON.stringify(metrics.runway || "N/A")}
` 
      : "No specific context. Give high-level strategic advice.";

    /* ================= FINAL PROMPT ================= */
    const finalPrompt = `
CONTEXT:
${contextdata}

FOUNDER'S QUESTION: 
"${question}"

INSTRUCTION: Provide a strategic response as a Co-founder. Focus on execution and critical details.
`;

    /* ================= OPENAI CALL ================= */
    const eilaResponse = await CallOpenAi(finalPrompt, systemPrompt);

    // Parsing ensuring it is an object for the frontend
    let formattedAnswer;
    try {
      formattedAnswer = typeof eilaResponse === 'string' ? JSON.parse(eilaResponse) : eilaResponse;
    } catch (e) {
      formattedAnswer = {
        Summary: eilaResponse,
        BrutalTruth: "Focus on the execution details."
      };
    }

    return res.status(200).json({
      success: true,
      answer: formattedAnswer
    });

  } catch (error) {
    console.error("EILA Error:", error);
    return res.status(500).json({
      success: false,
      message: "EILA failed to respond"
    });
  }
};

module.exports = { askEila };