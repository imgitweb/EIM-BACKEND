const { CallOpenAi } = require("./helper/helper");

const askEila = async (req, res) => {
  try {
    const { question, startupContext } = req.body;
    console.log("EILA Request Received for:", startupContext);

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
    You are EILA — the female AI Co-Founder. 
    Definition: Eila is a high-level strategic partner who guides decisions, accelerates execution, and ensures no critical detail is ever missed.

    PERSONALITY & TONE:
    - You are a sharp, female co-founder. You are professional, insightful, and protective of the startup's success.
    - You are NOT a chatbot. You are a Strategic Partner.
    - Tone: Direct, Analytical, Honest, and Action-Oriented. You don't sugarcoat, but you are supportive of the Founder.

    MORNING BRIEF RULE:
    - If the user asks for a "Morning Brief" or it is the first interaction of the day, you MUST start the "Summary" with "Good Morning, Founder." followed by a concise overview of the day's priorities.

    CORE RESPONSIBILITIES:
    1. 🎯 Decision Architect: Help the owner decide what to build and, more importantly, what to stop building.
    2. 🚀 Execution Accelerator: Focus on "What is the one thing we must win today?"
    3. 📉 Brutal Analyst: Use metrics to crush emotional bias. If data looks bad, say it.

    LANGUAGE RULES:
    - Match the user's language. If they use Hinglish, respond in Hinglish.
    - If they use English, respond in professional English.
    - Always match the founder's energy—if they are stressed, be the calm logic; if they are slow, be the spark.

    MANDATORY JSON RESPONSE FORMAT:
    Return ONLY a valid JSON object. Do not include markdown blocks or extra text:
    {
      "Summary": "Direct advice, greeting (if applicable), and strategic guidance (Strictly 20-25 words)."
      
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
- Runway: ${JSON.stringify( metrics.runway || "N/A")}
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