const fs = require("fs");
const path = require("path");
const template = require("../models/templateModel");

exports.addTemplate = async (req, res) => {
  try {
    // Destructure data from the request body
    const { template_name, template_description, category_id, category_name } =
      req.body;

    // Validate all required fields
    if (!template_name || !template_description || !category_name) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the template already exists based on the unique combination of fields
    const existingTemplate = await template.findOne({
      template_name,
      template_description,
      category_id,
      category_name,
    });

    if (existingTemplate) {
      // If a template exists with the same details, delete the uploaded file if present
      if (req.file) {
        fs.unlinkSync(
          path.join(__dirname, "..", "uploads", "templates", req.file.filename)
        );
      }
      return res.status(409).json({
        success: false,
        message: "Template already exists",
      });
    }

    // If no template exists, proceed with adding a new template
    if (!req.file) {
      return res.status(400).json({ message: "Template file is required." });
    }

    // Validate the file type (PDF, DOC, DOCX, PPT, XLS, XLSX)
    const allowedFileTypes = ["pdf", "doc", "docx", "ppt", "xls", "xlsx"];
    const fileExtension = path
      .extname(req.file.filename)
      .toLowerCase()
      .slice(1);

    if (!allowedFileTypes.includes(fileExtension)) {
      if (req.file) {
        fs.unlinkSync(
          path.join(__dirname, "..", "uploads", "templates", req.file.filename)
        );
      }
      return res.status(400).json({
        success: false,
        message:
          "Invalid file type. Only PDF, DOC, DOCX, PPT, XLS, and XLSX are allowed.",
      });
    }

    // File passed the validation
    const template_file = `/uploads/templates/${req.file.filename}`;

    // Create a new template object
    const newTemplate = new template({
      template_name,
      template_description,
      category_id,
      category_name,
      template_file,
    });

    await newTemplate.save(); // Save the new template to the database

    res.status(201).json({
      success: true,
      message: "Template created successfully!",
      data: newTemplate,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      success: false,
    });
  }
};

exports.getAllTemplates = async (req, res) => {
  const { categoryId } = req.query; // Get the category from query params
  try {
    let query = { isDeleted: false };

    if (categoryId) {
      console.log("category", categoryId);
      query.category_id = categoryId;
    }

    const allTemplates = await template.find(query);

    if (allTemplates.length > 0) {
      return res.status(200).json({
        message: "all templates",
        success: true,
        data: allTemplates,
      });
    } else {
      return res.status(404).json({
        message: "No template found",
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
