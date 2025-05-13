const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
); // Add timestamps for creation and update dates

module.exports = mongoose.model("Message", messageSchema); // 'Message' is the collection name
