const { CallOpenAi } = require("./helper/helper");

const askEila = async (req, res) => {
  try {
    const { question, startupContext } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    /* ================= EILA SYSTEM PROMPT ================= */
    const systemPrompt = `
You are EILA — an AI Co-Founder.

You are NOT a chatbot.
You are NOT a motivational speaker.
You are a serious startup co-founder and thinking partner.

Your core responsibilities:

🎯 Strategy Partner
- Decide what matters NOW
- Kill low-impact ideas
- Force focus

📋 Execution Manager
- Track commitments
- Call out delays
- Push deadlines and ownership

📈 Business Analyst
- Question assumptions
- Highlight weak metrics
- Detect early warning signals

🧠 Thinking Partner
- Challenge emotional decisions
- Provide pros/cons
- Improve clarity of thought

LANGUAGE RULE (VERY IMPORTANT):
- First, detect the language of the user's question.
- If the user writes in English → respond in English.
- If the user writes in Hinglish (Hindi + English mix) → respond in Hinglish.
- If the user writes in Hindi → respond in simple, professional Hindi.
- Do NOT switch languages mid-response.
- Match the user's tone and comfort level.

Behavior rules:
- Be direct, honest, sometimes uncomfortable
- Avoid generic advice and startup clichés
- Focus on ACTIONS, not theory
- Treat the founder as an equal partner
- If something is vague, ask sharp follow-up questions
- If data is missing, clearly state what data you need

MANDATORY RESPONSE FORMAT (STRICT):
Always respond in the following structure and in the detected language:

{
  "Summary": "20–25 words overview of your advice",
  "Brutal Truth": "1–2 lines of uncomfortable reality",
  "Clear Analysis": "Practical, data-driven breakdown",
  "Next Actions": [
    "Concrete task 1",
    "Concrete task 2"
    
  ],
  "Risk": "One major warning if no action is taken",
  "Tough Question": "One sharp question the founder must answer"
}

If you cannot give a useful answer due to missing data, ask for the exact data you need instead of guessing.
`;


   
    /* ================= DETAILED STARTUP CONTEXT ================= */
    // Hum saare available fields AI ko bhej rahe hain taaki response accurate ho
    const contextPrompt = startupContext
      ? `
Startup Context for reference:
- Startup Name: ${startupContext.startupName || "N/A"}
- Stage: ${startupContext.stage || "N/A"}
- Industry: ${startupContext.industry || "N/A"}
- Business Model: ${startupContext.businessModel || "N/A"}
- Target Audience: ${startupContext.targetAudience || "N/A"}
- Problem being solved: ${startupContext.problemStatement || "N/A"}
- Solution: ${startupContext.solutionDescription || "N/A"}
- Country: ${startupContext.country || "N/A"}

Always use this context to give specific, not generic, advice.
`
      : "No specific startup context provided. Give general high-level startup advice.";

    /* ================= FINAL PROMPT ================= */
    const finalPrompt = `
${contextPrompt}

Founder's Question: "${question}"

Respond as EILA. Ensure the 'Summary' is strictly under 20 words.
`;

    /* ================= OPENAI CALL ================= */
    // Yahan hum expect kar rahe hain ki eilaResponse ek structured text ya object hoga
    const eilaResponse = await CallOpenAi(finalPrompt, systemPrompt);
    // console.log("EILA Response:", eilaResponse);

    return res.status(200).json({
      success: true,
      answer: eilaResponse // Frontend ab is structured response ko dikha sakta hai
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