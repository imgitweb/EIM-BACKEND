const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema({
  idea: { 
    type: String,
    required: true
     },

  response: {
     type: String,
      required: true 
    },

  userId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User"
     },

  createdAt: {
     type: Date,
     default: Date.now },
});

module.exports = mongoose.model("Idea", ideaSchema);
