const mongoose = require("mongoose");
const StartupModel = require("../models/signup/StartupModel");
const {
  deliverableModel,
} = require("../models/DeliverablesModel/deliverables");

const weeks = {
  week1: [
    { deliverable_name: "Problem Statement Document" },
    { deliverable_name: "Founder Fit Scorecard" },
    { deliverable_name: "Idea Summary Sheet" },
    { deliverable_name: "Top Problem Selection Justification" },
  ],
  week2: [
    { deliverable_name: "Interview Insights Summary" },
    { deliverable_name: "Persona Deck" },
    { deliverable_name: "SOM Estimation Sheet" },
    { deliverable_name: "Validation Summary Note" },
  ],
  week3: [
    { deliverable_name: "Completed Lean Canvas" },
    { deliverable_name: "Revenue Hypothesis Document" },
    { deliverable_name: "GTM Approach Plan" },
    { deliverable_name: "Resource Inventory Sheet" },
    { deliverable_name: "Bootstrapping Plan with Timeline" },
    { deliverable_name: "Assumption and Risk List" },
  ],
  week4: [
    { deliverable_name: "Readiness Score Report" },
    { deliverable_name: "Mentor Review Sheet" },
    { deliverable_name: "Startup Roadmap" },
    { deliverable_name: "Final Decision Note" },
  ],
};

module.exports.seedDeliverables = async () => {
  try {
    console.log("✅ Connected to MongoDB");

    const startups = await StartupModel.find();
    console.log(`Found ${startups.length} startups.`);

    // if (!startups.length) {
    //   console.log("⚠️ No startups found. Add startups first.");
    //   process.exit(0);
    // }

    let totalCreated = 0;

    for (const startup of startups) {
      const existing = await deliverableModel.findOne({
        startup_id: startup._id,
      });
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
            deliverable_name: act.deliverable_name,
            week,
            is_completed: false,
            is_deleted: false,
          });
        });
      }

      await deliverableModel.insertMany(activities);
      totalCreated += activities.length;
      console.log(
        `✅ Created ${activities.length} activities for ${startup.startupName}`
      );
    }

    console.log(`🎉 Done! Created ${totalCreated} new deliverables in total.`);
    // process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding activities:", err);
    // process.exit(1);
  }
};
