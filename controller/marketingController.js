const OpenAI = require("openai");
const MarketingPlan = require("../models/MarketingPlan");
const { CallOpenAi } = require("../controller/helper/helper");

exports.generateMarketingPlan = async (req, res) => {
  try {
    const { userId, budget, currency, targetUsers, city } = req.body;

    if (!userId || !budget || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = `
      You are a professional Chief Marketing Officer. 
      Create a tactical marketing plan for a startup in ${city}.
      
      Constraints:
      - Budget: ${currency} ${budget}
      - Reach Goal: ${targetUsers} users
      
      Return a JSON object with exactly 4 campaigns.
      Structure:
      {
        "campaigns": [
          {
            "title": "Short Strategy Name (max 5 words)",
            "type": "Category (e.g. Social, Offline, SEO)",
            "budgetAllocation": Number,
            "platform": "Specific Channel (e.g. Instagram, Local Radio)",
            "outcome": "Reach estimate (e.g. +2k Users)"
          }
        ],
        "conclusion": "One sentence strategic summary."
      }
      
      Ensure total budget allocation equals ${budget}.
    `;

    const completion = await CallOpenAi(prompt);

    // Parse JSON safely (in case OpenAI wraps it in markdown)
    let aiContent = completion;
    if (typeof completion === "string") {
      // Try to find JSON if wrapped in ```json
      const jsonMatch = completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiContent = JSON.parse(jsonMatch[0]);
      }
    }

    const newPlan = new MarketingPlan({
      startupId: userId,
      budget,
      currency,
      targetUsers,
      city,
      campaigns: aiContent.campaigns,
      conclusion: aiContent.conclusion,
    });

    await newPlan.save();
    return res.status(200).json(newPlan);
  } catch (error) {
    console.error("Marketing Generation Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate plan", error: error.message });
  }
};

exports.getLatestPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const plan = await MarketingPlan.findOne({ startupId: userId }).sort({
      createdAt: -1,
    });
    if (!plan)
      return res.status(200).json({ message: "No plan found", campaigns: [] });
    return res.status(200).json(plan);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
