const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Mentor = require("../models/mentorModel");

// Load environment variables from .env
dotenv.config();

const seedMentorData = async () => {
  try {
    // ✅ Connect to MongoDB
    await connectDB();

    // ✅ Load and parse JSON data
    const filePath = path.join(__dirname, "../json_data/mentor.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // ✅ Prepare and normalize mentor data
    const mentors = data.map((mentor) => ({
      image:
        mentor.image ||
        "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?q=80&w=1528&auto=format&fit=crop",
      name: mentor.name?.trim() || "Unknown Mentor",
      designation: mentor.designation?.trim() || "Mentor",
      currentCompany: mentor.currentCompany?.trim() || "N/A",
      totalExp: mentor.totalExp || 0,
      skills: mentor.skills?.length ? mentor.skills : ["N/A"],
      languages: mentor.languages?.length ? mentor.languages : ["English"],
      aboutUs: mentor.aboutUs?.trim() || "N/A",
      higherEducation: mentor.higherEducation?.trim() || "N/A",
      rating: mentor.rating || 5,
      category: mentor.category?.trim() || "Tech Mentors",
      subCategory: mentor.subCategory?.trim() || "",
      gender: mentor.gender?.toLowerCase() || "other",
      institute: mentor.institute?.trim() || "N/A",
      email:
        mentor.email?.toLowerCase() ||
        `unknown_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`,
      mo_number: mentor.contact?.toString() || "0000000000",
      contact: mentor.contact?.toString() || "0000000000",
      country: mentor.country?.trim() || "India",
      city: mentor.city?.trim() || "N/A",
      linkedin: mentor.linkedin?.trim() || "N/A",
      specializationIn:
        mentor.specializationIn?.trim() || mentor.subCategory || "N/A",
      isDeleted: false,
    }));

    // ✅ Prevent duplicate insertions
    const existingMentors = await Mentor.countDocuments();

    if (existingMentors > 0) {
      console.log("⚠️ Mentor data already exists. Skipping seeding.");
    } else {
      await Mentor.insertMany(mentors);
      console.log("✅ Mentor data seeded successfully.");
    }
  } catch (error) {
    console.error("❌ Error seeding mentor data:", error.message);
  } finally {
    // ✅ Always close connection after work
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
};

// Run the seeding function
seedMentorData();
