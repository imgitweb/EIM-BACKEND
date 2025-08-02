const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    ideas: [
      {
        idea: String,
        chance: String,
      },
    ],
    idea: String,
    response: String,
    summaries: [
      {
        title: String,
        summary: String,
        time: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Idea", ideaSchema);
