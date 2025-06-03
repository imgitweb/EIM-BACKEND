const fs = require("fs");
const path = require("path");
const Category = require("../models/categoryListModel");

const seedCategoryData = async () => {
  try {
    // Load and parse JSON data
    const filePath = path.join(__dirname, "../json_data/category.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Prepare and normalize category data
    const categories = data.map((cat) => ({
      category_name: cat.category_name.trim(),
      category_description: cat.category_description.trim(),
      category_logo: cat.category_logo || "https://example.com/default-logo.png",
    }));

    // Prevent duplicate insertions
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log("Category data already exists. Skipping seeding.");
    } else {
      await Category.insertMany(categories);
      console.log("Category data seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding category data:", error);
  }
};

module.exports = seedCategoryData;
