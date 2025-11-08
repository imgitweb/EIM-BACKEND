const mongoose = require("mongoose");
const StartupModel = require("../models/signup/StartupModel");
const { ActivityModel } = require("../models/ActivityModel/activityModel");

const weeks = {
  week1: [
    { name: "Define Startup Idea", route: "/submit-idea" },
    { name: "Validate Market Problem", route: "/validate-ai-review" },
    { name: "Conduct Market Research", route: "/market-research" },
    { name: "Get Risk & Feedback", route: "/feedback-risk" },
  ],
  week2: [
    { name: "Define Product Scope", route: "/mvp/scope" },
    { name: "Build MVP Prototype", route: "/mvp/builder" },
    { name: "Hire Product Team", route: "/mvp/hire" },
    { name: "Collect User Feedback", route: "/mvp/feedback" },
  ],
  week3: [
    { name: "Define Marketing Funnel", route: "/marketing-funnel" },
    { name: "Identify Target Customers", route: "/client-persona" },
    { name: "Build Sales Funnel", route: "/sales-funnel" },
    { name: "Track Revenue", route: "/revenu-trac" },
  ],
  week4: [
    { name: "Prepare Pitch Deck", route: "/funding/pitchdeck" },
    { name: "Find Investors", route: "/funding/investors" },
    { name: "Setup Legal Compliance", route: "/company-compliance" },
    { name: "Perform Valuation Analysis", route: "/company-valuation" },
  ],
};

module.exports.seedActivities = async () => {
  try {
    console.log("✅ Connected to MongoDB");

    const startups = await StartupModel.find();
    console.log(`Found ${startups.length} startups.`);

    if (!startups.length) {
      console.log("⚠️ No startups found. Add startups first.");
      process.exit(0);
    }

    let totalCreated = 0;

    for (const startup of startups) {
      const existing = await ActivityModel.findOne({ startup_id: startup._id });
      if (existing) {
        // console.log(
        //   `⏭️  Skipping ${startup.startupName} — activities already exist.`
        // );
        continue;
      }

      console.log(`🆕 Creating activities for ${startup.startupName}`);

      const activities = [];
      for (const [week, list] of Object.entries(weeks)) {
        list.forEach((act) => {
          activities.push({
            startup_id: startup._id,
            activity_name: act.name,
            week,
            activity_schema: act.route,
            is_completed: false,
            is_deleted: false,
          });
        });
      }

      await ActivityModel.insertMany(activities);
      totalCreated += activities.length;
      console.log(
        `✅ Created ${activities.length} activities for ${startup.startupName}`
      );
    }

    console.log(`🎉 Done! Created ${totalCreated} new activities in total.`);
    // process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding activities:", err);
    // process.exit(1);
  }
};
