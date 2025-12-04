require("dotenv").config();
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error(
    "Missing OpenAI API Key. Set it in your .env file as OPENAI_API_KEY."
  );
}

exports.checklistLegal = async (prompt, maxTokens = 4000) => {
  const url = "https://api.openai.com/v1/chat/completions";
  try {
    const response = await axios.post(
      url,
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a startup planning assistant. 
              in **strictly valid JSON** format. 
            Ensure the output is a complete and properly formatted JSON object.  Do not include any explanatory text outside the JSON object.  The entire response should be parsable JSON.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = response.data.choices[0].message.content.trim();

    // 1. Check for empty response
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    // 2. Remove any backticks or code fences that LLMs sometimes add
    content = content.replace(/^`*|`*$/g, ""); //Removes backticks from start and end
    content = content.replace(/^json\n|json$/g, ""); //Removes "json" identifier if present

    // 3. Remove any leading/trailing whitespace again (just in case)
    content = content.trim();

    // 4. Robust JSON parsing with error handling:
    try {
      const parsedData = JSON.parse(content);
      return parsedData;
    } catch (jsonError) {
      console.error("Invalid JSON received:", content); // Log the raw content for debugging
      console.error("JSON parsing error:", jsonError); // Log the specific JSON parsing error
      throw new Error(
        "OpenAI returned invalid JSON format: " + jsonError.message
      ); // More informative error
    }
  } catch (error) {
    console.error(
      "Error fetching data from OpenAI:",
      error.response?.data || error.message || error // Log all error details
    );
    throw new Error("Failed to fetch  from OpenAI: " + error.message); // Include original error message
  }
};
