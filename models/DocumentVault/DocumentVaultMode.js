var mongoose = require("mongoose");

var DocumentVaultModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    document_path: {
      type: String,
      required: true,
    },
    document_name: {
      type: String,
      required: true,
    },
    folder: {
      type: String,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports.DocumentVaultSchema = mongoose.model(
  "documentVault",
  DocumentVaultModel
);
