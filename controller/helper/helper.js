const { OpenAI } = require("openai");
require("dotenv").config();


const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



const generateApi = async (prompt) => {
  try {
    const resp = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    });
    return resp.choices[0].message.content;
  } catch (error) {
    console.error("Error with OpenAI:", error.message);
    throw new Error(`OpenAI API error: ${error.message}`);
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
  generateApi,
  generateUimPrompt,
  unicornIdeasPredictionPrompt,
};



