const { CallOpenAi } = require("../helper/helper");

const gtm_strategy = async (req, res) => {
  try {
    const { product, customerPersona, marketingBudget } = req.body;
    if (!product || !customerPersona || !marketingBudget) {
      return res.status(400).json({
        message:
          "Missing required fields: product, customerPersona, marketingBudget",
        success: false,
      });
    }
    const prompt = `
    You are a senior Go-To-Market (GTM) strategist.

    Your task is to generate a comprehensive GTM strategy STRICTLY in the JSON format defined below.
    DO NOT add explanations, comments, markdown, or extra text.
    DO NOT wrap the response in backticks.
    DO NOT change key names.
    DO NOT omit any fields.
    If a value is unknown, infer a realistic value.

    INPUT DATA:
    Product: ${JSON.stringify(product)}
    Target Customer: ${JSON.stringify(customerPersona)}
    Marketing Budget: ${JSON.stringify(marketingBudget)}

    OUTPUT FORMAT (RETURN ONLY THIS JSON OBJECT):

    {
    "go_to_market_strategy": {
        "product_overview": {
        "name": "",
        "category": "",
        "description": "",
        "business_model": "",
        "ideal_price": 0,
        "average_deal_value": 0,
        "currency": ""
        },
        "target_customer": {
        "geography": {
            "continent": "",
            "country": "",
            "city_focus": "",
            "area_types": []
        },
        "demographics": {
            "gender": "",
            "age_range": "",
            "profession": []
        },
        "profile_name": ""
        },
        "market_positioning": {
        "value_proposition": "",
        "key_differentiators": []
        },
        "launch_goals": {
        "user_acquisition": 0,
        "target_revenue": 0,
        "brand_awareness": "",
        "customer_engagement": ""
        },
        "messaging_strategy": {
        "core_message": "",
        "taglines": [],
        "content_pillars": []
        },
        "channel_strategy": {
        "digital": [
            {
            "platform": "",
            "objective": "",
            "tactics": ""
            }
        ],
        "offline": [
            {
            "locations": [],
            "objective": "",
            "tactics": ""
            }
        ]
        },
        "marketing_budget_allocation": {
        "total": 0,
        "currency": "",
        "distribution": [
            {
            "title": "",
            "type": "",
            "platform": "",
            "allocation": 0,
            "expected_outcome": ""
            }
        ]
        },
        "sales_strategy": {
        "lead_generation": [],
        "conversion_tactics": [],
        "sales_enablement": []
        },
        "partnerships_and_community": {
        "micro-influencer collaborations": [],
        "local community organizations": []
        },
        "measurement_and_optimization": {
        "KPIs": [],
        "tools_and_processes": []
        },
        "timeline": [
        {
            "phase": "Messaging & Foundation",
            "weeks": "Week 1",
            "activities": [
                "Finalize regional-language messaging in Hindi/Marathi",
                "Prepare posters, flyers, QR codes, and short videos",
                "Recruit 3–5 field agents and local shop partners"
            ]
        },
        {
            "phase": "Awareness & Trust Building",
            "weeks": "Week 2",
            "activities": [
                "Launch Instagram Reels and YouTube Shorts",
                "Collaborate with 2–3 local influencers",
                "Deploy posters/flyers in agri shops and high-footfall areas",
                "Field agents assist farmers in understanding service"
            ]
        },
        {
            "phase": "Lead Conversion & Activation",
            "weeks": "Week 3",
            "activities": [
                "Use WhatsApp Business for follow-ups",
                "Offer first-rental discount to encourage signups",
                "Conduct 1–2 demo events showing equipment",
                "Ensure easy booking & fast delivery for first users"
            ]
        },
        {
            "phase": "Retention & Referral Loop",
            "weeks": "Week 4",
            "activities": [
                "Send seasonal rental reminders",
                "Launch referral program with wallet credits",
                "Track repeat rentals and customer satisfaction",
                "Collect testimonials for social proof"
            ]
        },
        {
            "phase": "Scale & Optimize",
            "weeks": "Week 5+",
            "activities": [
                "Analyze top-performing channels",
                "Double down on successful outreach (offline + digital)",
                "Expand into neighboring villages and semi-urban clusters",
                "Adjust messaging and incentives based on results"
            ]
        }
        ],
        "risk_mitigation": [
            "Focus on local trust to reduce adoption risk",
            "Maintain equipment availability to avoid negative reviews",
            "Monitor subscription uptake weekly to adjust budget allocation",
            "Have fallback outreach channels if digital campaigns underperform"
        ]
    }
    }

    IMPORTANT:
    - Output MUST be valid JSON
    - No trailing commas
    - No text before or after JSON
    - All fields MUST be filled with relevant content
    - Budget allocation MUST sum to the total marketing budget.
    - Ensure cultural and regional relevance for the target customer
    `;

    const completions = await CallOpenAi(prompt);
    return res.status(200).json({
      message: "GTM strategy generated successfully",
      success: true,
      data: completions,
    });
  } catch (error) {
    console.error("GTM strategy error:", error);
    return res.status(500).json({
      message: "Failed to generate GTM strategy",
      success: false,
    });
  }
};

module.exports.gtm_strategy = gtm_strategy;
