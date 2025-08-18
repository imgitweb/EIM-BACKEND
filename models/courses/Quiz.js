const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: Number, required: true }, // correct option index
  explanation: { type: String }, // optional
});

const QuizSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video", 
    required: true,
  },
  questions: [quizQuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

const Quiz = mongoose.model("Quiz", QuizSchema);
module.exports = Quiz;
