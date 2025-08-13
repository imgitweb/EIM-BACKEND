const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  order: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const module = mongoose.model("Module", ModuleSchema);
module.exports = module;
