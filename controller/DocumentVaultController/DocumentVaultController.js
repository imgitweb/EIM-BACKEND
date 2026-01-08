const fs = require("fs");
const {
  DocumentVaultSchema,
} = require("../../models/DocumentVault/DocumentVaultMode");

const Add_document = async (req, res) => {
  try {
    const { user_id } = req.body;
    const { folder_name } = req.query;
    const file = req.file;

    if (!user_id || !folder_name) {
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({
        message: "user_id and folder_name are required",
        success: false,
      });
    }

    if (!file) {
      return res.status(400).json({
        message: "File is required",
        success: false,
      });
    }

    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: "Only PDF and image files are allowed",
        success: false,
      });
    }

    const MAX_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: "File size must be less than 5MB",
        success: false,
      });
    }
    const document_vault = new DocumentVaultSchema({
      userId: user_id,
      document_path: file.path,
      folder: folder_name,
      document_name: file.originalname,
    });

    await document_vault.save();

    return res.status(201).json({
      message: "Document uploaded successfully",
      success: true,
      document_vault,
    });
  } catch (error) {
    console.error("Error while adding the document", error);

    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const Get_compliances = async (req, res) => {
  try {
    const { folder_name, user_id } = req.body;
    if (!folder_name || !user_id) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    const compliances = await DocumentVaultSchema.find({
      userId: user_id,
      folder: folder_name,
      is_deleted: {
        $ne: true,
      },
    });
    if (!compliances) {
      return res.status(404).json({
        message: "No compliance data found",
        success: false,
      });
    }
    return res.status(201).json({
      message: "Data found",
      success: true,
      compliances: compliances,
    });
  } catch (error) {
    console.lof("error", error);
    return res.status(500).json({
      message: "Internal sever error",
      success: false,
      error: error,
    });
  }
};

const Soft_delete = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        message: "Id is required",
        success: false,
      });
    }
    const data = await DocumentVaultSchema.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          is_deleted: true,
        },
      },
      {
        new: true,
      }
    );
    return res.status(201).json({
      message: "Data deleted successfully",
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("❌ Something went wrong", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = {
  Add_document,
  Get_compliances,
  Soft_delete,
};
