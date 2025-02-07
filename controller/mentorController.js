const Mentor = require("../models/mentorModel");
const fs = require("fs");
const path = require("path");

// creating a new mentor
exports.addMentor = async (req, res) => {
  try {
    // Destructure data from the request body
    const {
      name,
      designation,
      totalExp,
      aboutUs,
      higherEducation,
      skills,
      languages,
      rating,
      category,
      gender,
      institute,
      email,
      mo_number,
      country,
      city,
      linkedin,
      specializationIn
    } = req.body;

    // Validate all required fields
    if (
      !name ||
      !designation ||
      !totalExp ||
      !aboutUs ||
      !higherEducation ||
      !skills ||
      !languages ||
      !rating ||
      !category ||
      !gender ||
      !institute ||
      !email ||
      !mo_number ||
      !country ||
      !city ||
      !linkedin ||
      !specializationIn
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the mentor already exists based on the unique combination of fields
    const existingMentor = await Mentor.findOne({
      email,
    });

    console.log(existingMentor);
    if (existingMentor) {
      // If a mentor exists with the same details, delete the uploaded file if present
      if (req.file) {
        fs.unlinkSync(
          path.join(__dirname, "..", "uploads", "mentors", req.file.filename)
        );
      }
      return res.status(409).json({
        success: false,
        message: "Mentor with this email already exists",
        data: existingMentor,
      });
    }

    // If no mentor exists, proceed with adding a new mentor
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const image = `/uploads/mentors/${req.file.filename}`;
    console.log("image added");

    // Create a new mentor object
    const newMentor = new Mentor({
      name,
      designation,
      totalExp,
      aboutUs,
      higherEducation,
      skills,
      languages,
      rating,
      category,
      gender,
      institute,
      email,
      mo_number,
      country,
      city,
      linkedin,
      specializationIn,
      image,
    });

    // console.log("saving new mentor data:", newMentor);
    await newMentor.save(); // Save the new mentor to the database

    res.status(201).json({
      success: true,
      message: "Mentor created successfully!",
      data: newMentor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      success: false,
    });
  }
};
// get all mentors

// get all mentors
exports.getAllMentors = async (req, res) => {
  const { category } = req.query; // Get the category from query params
  try {
    let query = { isDeleted: false };

    if (category) {
      console.log("category", category);
      query.category = category; // If category is provided, filter by category
    }

    const allMentors = await Mentor.find(query);

    if (allMentors.length > 0) {
      return res.status(200).json({
        message: "all mentors data",
        success: true,
        data: allMentors,
      });
    } else {
      return res.status(404).json({
        message: "No mentors found",
        success: false,
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// delete mentor

exports.deleteMentor = async (req, res) => {
  try {
    console.log(req.body);
    const { mentorID } = req.body;
    const mentor = await Mentor.findByIdAndUpdate(
      {
        _id: mentorID,
        isDeleted: false,
      },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!mentor) {
      return res.status(404).json({
        message: "Mentor not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Mentor deleted successfully",
      success: true,
      data: mentor,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      message: "Internal server error",
      success: false,
    });
  }
};
