const OpenAI = require("openai");
const MarketingPlan = require("../models/MarketingPlan");
const { CallOpenAi } = require("../controller/helper/helper");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- GENERATE NEW PLAN ---
exports.generateMarketingPlan = async (req, res) => {
  try {
    const { userId, budget, currency, targetUsers, city } = req.body;

    if (!userId || !budget || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Construct the Prompt
    const prompt = `
      You are a professional Chief Marketing Officer (CMO). 
      Create a detailed marketing campaign plan for a startup based on the following constraints:
      
      - Budget: ${currency} ${budget}
      - Target Location: ${city}
      - Target Users Reach Goal: ${targetUsers}
      
      Output Requirements:
      Return a STRICT JSON object containing exactly 4 distinct campaigns and a conclusion.
      
      Structure:
      {
        "campaigns": [
          {
            "title": "Campaign Headline",
            "type": "Category (e.g. Social Media, Influencer, Offline, SEO)",
            "description": "2 sentence strategy description specific to ${city}",
            "budgetAllocation": Number (The specific amount allocated from the total budget),
            "platform": "Specific channels (e.g. Instagram Reels, Local Newspaper)",
            "outcome": "Projected result (e.g. +2000 Visits)",
            "icon": "String (MUST be exactly one of: 'Megaphone', 'Users', 'MapPin', 'Share2')"
          }
        ],
        "conclusion": "A brief strategic summary (max 30 words) encouraging the user."
      }

      Ensure the total budget allocation across campaigns equals roughly ${budget}. 
      Make the campaigns realistic for the city of ${city}.
    `;

    // 2. Call OpenAI
    const completion = await CallOpenAi(prompt);
    console.log("completion", completion);
    // 3. Parse Response
    const aiContent = completion;

    // 4. Save to Database
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

    // 5. Send Response
    return res.status(200).json(newPlan);
  } catch (error) {
    console.error("Marketing Generation Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate plan", error: error.message });
  }
};

// --- GET LATEST PLAN ---
exports.getLatestPlan = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the most recently created plan for this user
    const plan = await MarketingPlan.findOne({ startupId: userId }).sort({
      createdAt: -1,
    });

    if (!plan) {
      return res.status(200).json({
        message: "No plan found",
        campaigns: [], // Return empty structure so frontend doesn't break
      });
    }

    return res.status(200).json(plan);
  } catch (error) {
    console.error("Fetch Plan Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
