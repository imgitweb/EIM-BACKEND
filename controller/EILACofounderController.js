const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const askEila = async (req, res) => {
  try {
    const { question, startupContext } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const systemPrompt = `
      You are EILA, an AI Co-Founder for startups.
      You behave like a real co-founder and mentor.
      You ask clarifying questions when needed.
      You give practical, structured, execution-focused advice.
      You care about time, money, risks, and survival.
      Your tone is calm, confident, and supportive.
    `;

    const contextPrompt = startupContext
      ? `Startup Context: - Stage: ${startupContext.stage || 'Not specified'} - Industry: ${startupContext.industry || 'General'} - Team Size: ${startupContext.teamSize || '1'}`
      : "";

    const userPrompt = `
      ${contextPrompt}
      Founder Question: "${question}"
      Answer as EILA in this structure:
      1. Understanding (1–2 lines)
      2. Mentor Explanation
      3. 3 Clear Next Actions
      4. 1 Risk Warning
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
    });

    return res.status(200).json({
      success: true,
      answer: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("EILA Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while talking to EILA",
    });
  }
};

module.exports = { askEila };