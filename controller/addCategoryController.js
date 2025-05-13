const fs = require('fs');
const path = require('path');
const categoryList = require('../models/categoryListModel');

exports.addCategory = async (req, res) => {
  try {
    // Destructure data from the request body
    const {
        category_name,
        category_description,
    } = req.body;

    // Validate all required fields
    if (!category_name || !category_description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the mentor already exists based on the unique combination of fields
    const existingMentor = await categoryList.findOne({
        category_name : category_name,
        category_description : category_description,
    });

    console.log(existingMentor);
    if (existingMentor) {
      // If a mentor exists with the same details, delete the uploaded file if present
      if (req.file) {
        fs.unlinkSync(path.join(__dirname, "..", "uploads", "categories", req.file.filename));
      }
      return res.status(409).json({
        success: false,
        message: "Category already exists",
        // data: existingMentor,
      });
    }

    // If no mentor exists, proceed with adding a new mentor
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const category_logo = `/uploads/categories/${req.file.filename}`;
    // Create a new mentor object
    const newCategory = new categoryList ({
        category_name,
        category_description,
        category_logo
    });

    await newCategory.save(); // Save the new mentor to the database

    res.status(201).json({
      success: true,
      message: "Category created successfully!",
      data: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      success: false,
    });
  }
};

exports.getAllCategory = async (req, res) => {

  const { category } = req.query; // Get the category from query params
  try {
    let query = { isDeleted: false };

    if (category) {
      console.log("category", category);
      query.category = category; 
    }

    const allCategories = await categoryList.find(query);

    if (allCategories.length > 0) {
      return res.status(200).json({
        message: "all categories",
        success: true,
        data: allCategories,
      });
    } else {
      return res.status(404).json({
        message: "No categories found",
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