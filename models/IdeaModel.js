const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ideaSchema = new mongoose.Schema({
  idea: {
    type: String,
    required: true
  },
   response: {
    type: Object,
    required: true,
  },
  userId: {
    type: String, 
    required: true
  },userId: {
    type: String,
    default: uuidv4, // ✅ unique uuid
  },
});

module.exports = mongoose.model("Idea", ideaSchema);