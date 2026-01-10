const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Ensure this path points to your actual Mongoose Model
const TeamRegistration = require("../models/Hackthon/RegistrationModel");

// =============================
// CONFIG
// =============================
const INPUT_JSON = path.join(__dirname, "..", "selectstartup.json"); // Ensure this file exists
const OUTPUT_JSON = path.join(__dirname, "final3.json");

// =============================
// DB CONNECT
// =============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ DB Error", err);
    process.exit(1);
  });

// =============================
// MAIN PROCESS
// =============================
const run = async () => {
  try {
    if (!fs.existsSync(INPUT_JSON)) {
      throw new Error("selectstartup.json not found in the current directory");
    }

    const inputData = JSON.parse(fs.readFileSync(INPUT_JSON, "utf-8"));
    const finalList = [];
    const processedTeamIds = new Set(); // To avoid duplicates

    console.log(`📂 Processing ${inputData.length} entries...`);

    for (const entry of inputData) {
      // 1. Extract Email/Phone safely from mixed input formats
      // Format A: { leader: { email: "..." } } (Full Object)
      // Format B: { email: "...", phone: "..." } (Simple Object at bottom of your file)
      let searchEmail =
        entry.email || (entry.leader ? entry.leader.email : null);
      let searchPhone =
        entry.phone || (entry.leader ? entry.leader.phone : null);

      // Normalize strings
      if (searchEmail) searchEmail = searchEmail.toString().trim();
      if (searchPhone) searchPhone = searchPhone.toString().trim();

      if (!searchEmail && !searchPhone) continue;

      // 2. Build Search Query
      const query = {
        $or: [],
      };
      if (searchEmail)
        query.$or.push({
          "leader.email": { $regex: new RegExp(`^${searchEmail}$`, "i") },
        }); // Case insensitive match
      if (searchPhone) query.$or.push({ "leader.phone": searchPhone });

      if (query.$or.length === 0) continue;

      // 3. Find Team in DB
      const team = await TeamRegistration.findOne(query);

      if (!team) {
        console.warn(`⚠️ Team not found for: ${searchEmail || searchPhone}`);
        continue;
      }

      // 4. Check for duplicates (if input list has same team multiple times)
      if (processedTeamIds.has(team._id.toString())) {
        continue;
      }
      processedTeamIds.add(team._id.toString());

      const teamCategory = team.teamConfig.track || "Participate";

      // ================= PUSH LEADER =================
      finalList.push({
        name: `${team.leader.firstName} ${team.leader.lastName}`.trim(),
        role: "PARTICIPANT",
        phone: team.leader.phone || "",
        email: team.leader.email || "",
        photo: team.leader.photo || "",
        category: teamCategory,
      });

      // ================= PUSH MEMBERS =================
      if (team.members && team.members.length > 0) {
        team.members.forEach((member) => {
          finalList.push({
            name: member.name ? member.name.trim() : "Unknown Member",
            role: "PARTICIPANT",
            phone: member.phone || "",
            email: member.email || "",
            photo: member.photo || "",
            category: teamCategory, // Assigning same category as leader/team
          });
        });
      }
    }

    // ================= WRITE OUTPUT =================
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(finalList, null, 2));

    console.log("-----------------------------------------");
    console.log("✅ final.json generated successfully!");
    console.log(
      `👥 Total Individuals (Leaders + Members): ${finalList.length}`
    );
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

run();
