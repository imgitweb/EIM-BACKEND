const fs = require("fs");
const path = require("path");
const Mentor = require("../models/mentorModel"); 

const seedMentorData = async () => {
  try {
    // Load and parse JSON data
    const filePath = path.join(__dirname, "../json_data/mentor.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    // Prepare and normalize mentor data
    const mentors = data.map((mentor) => ({
      image: mentor.image || "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // fallback image
      name: mentor.name,
      designation: mentor.designation,
      totalExp: mentor.totalExp || 0,
      skills: mentor.skills || ["N/A"],
      languages: mentor.languages || [],
      aboutUs: mentor.aboutUs || "N/A",
      higherEducation: mentor.higherEducation || "N/A",
      rating: mentor.rating || 5,
      category: mentor.category.toLowerCase() || "Tech", // must match enum: 'technical' | 'non technical' | 'subject expert'
      gender: mentor.gender.toLowerCase()  ,     // must match enum: 'male' | 'female' | 'other'
      institute: mentor.institute || "N/A",
      email: mentor.email.toLowerCase(),
      mo_number: mentor.mo_number || "0000000000",
      country: mentor.country || "India",
      city: mentor.city || "N/A",
      linkedin: mentor.linkedin,
      specializationIn: mentor.specializationIn || "N/A"
    }));

    // Prevent duplicate insertions
    const existingMentors = await Mentor.countDocuments();
    if (existingMentors > 0) {
      console.log("Mentor data already exists. Skipping seeding.");
    } else {
      await Mentor.insertMany(mentors);
      console.log("Mentor data seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding mentor data:", error);
  }
};

module.exports = seedMentorData;
