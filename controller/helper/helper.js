const { OpenAI } = require("openai");
require("dotenv").config();
const openAi = new OpenAI({ apiKey: process.env.OPEN_API_KEY });

const CallOpenAi = async (prompt, isJson = true) => {
  // <--- 1. Default true rakha
  try {
    const response = await openAi.chat.completions.create({
      model: "gpt-4.1", // Make sure model name is correct (e.g., gpt-4o or gpt-4)
      messages: [{ role: "user", content: prompt }],
    });

    let assistantReply = response.choices?.[0]?.message?.content;
    if (!assistantReply) throw new Error("No assistant reply found");

    // Clean whitespace
    assistantReply = assistantReply.trim();
    console.log("assistantReply:", assistantReply);

    // --- NEW LOGIC ADDED HERE ---
    // Agar hume JSON nahi chahiye (sirf number chahiye), to yahin se return kar do
    if (!isJson) {
      return assistantReply;
    }
    // -----------------------------

    // Clean markdown and whitespace for JSON
    assistantReply = assistantReply
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Attempt to extract first JSON object or array
    const jsonMatch = assistantReply.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

    if (!jsonMatch) {
      console.warn("Full assistant reply:", assistantReply);
      throw new Error("No JSON object found in assistant reply");
    }

    const cleanedJson = jsonMatch[0];

    // Attempt to parse JSON
    try {
      return JSON.parse(cleanedJson);
    } catch {
      // Fallback: minor repairs for single quotes or trailing commas
      const repaired = cleanedJson
        .replace(/'/g, '"') // single to double quotes
        .replace(/,\s*([}\]])/g, "$1"); // remove trailing commas

      try {
        return JSON.parse(repaired);
      } catch (jsonError) {
        console.error("Invalid JSON received after repair:", repaired);
        throw new Error("OpenAI returned invalid JSON: " + jsonError.message);
      }
    }
  } catch (error) {
    console.error("Error fetching data from OpenAI:", error.message || error);
    throw new Error("Failed to fetch from OpenAI: " + error.message);
  }
};
const generateUimPrompt = (formData) => {
  const { sectors, focus, market, interest, skills } = formData;

  const sectorList = sectors.length ? sectors.join(", ") : "various sectors";
  const userFocus = focus || "building something meaningful";
  const targetMarket = market || "a wide audience";
  const userInterest = interest || "solving real-world problems";
  const userSkills = skills || "general technical knowledge";

  return `Generate 10 short and catchy startup idea titles (one-liners only) for a user interested in ${sectorList}, aiming to ${userFocus}, focused on the ${targetMarket}, with interest in "${userInterest}" and skills in "${userSkills}". Format each idea as a single line, like a creative business name or tagline, without any description.`;
};

const unicornIdeasPredictionPrompt = (idea) => {
  return `You are a startup assistant. I will give you a business idea, and I want you to generate a detailed AI-driven startup summary in the exact structure shown below. The format must match the example and return the output **only as JSON**, with clearly labeled keys for each section.

Here is the required structure:
{
  "Startup Idea Summary": {
    "Title": "...",
    "One-line Pitch": "..."
  },
  "Problem Statement": "...",
  "Solution Statement": "...",
  "First 10 Customers (User Personas)": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ],
  "Global Inspiration": [
    "...",
    "...",
    "..."
  ],
  "Indian Market Opportunity": "...",
  "Business Model Canvas": {
    "Key Elements": [
      "Key partners, resources, activities",
      "Customer segments & channels",
      "Revenue & cost structure",
      "Tech stack suggestions"
    ],
    "PDF Download Link": "Download Canvas PDF"
  },
  "Unicorn Radar Score": {
    "Score": "XX%",
    "Insight": "Likelihood of becoming a unicorn in the next 5–7 years (Based on AI prediction model & market analysis)"
  }
}

Now, my business idea is: ${idea}. Please analyze the **Indian and global market trends** to calculate the "Unicorn Radar Score" as a percentage (0–100%) and provide insights for the score.`;
};
module.exports = {
  CallOpenAi,
  generateUimPrompt,
  unicornIdeasPredictionPrompt,
};
