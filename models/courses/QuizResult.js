const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    answers: [
      {
        questionIndex: Number,
        selectedOption: Number,
        correctOption: Number,
        isCorrect: Boolean,
      },
    ],

    totalQuestions: Number,
    attempted: Number,
    correct: Number,
    wrong: Number,
    percentage: Number,
    status: {
      type: String,
      enum: ["PASS", "FAIL"],
      default: "FAIL",
    },
  },
  { timestamps: true }
);


/* 🔥 AUTO-DELETE OLD RESULTS (KEEP ONLY LAST 3) */
// quizResultSchema.post("save", async function (doc, next) {
//   try {
//     const QuizResult = mongoose.model("QuizResult");

//     const results = await QuizResult.find({
//       startupId: doc.startupId,
//       videoId: doc.videoId,
//     })
//       .sort({ createdAt: -1 });

//     if (results.length > 3) {
//       const excessResults = results.slice(3); // 4th onward
//       const idsToDelete = excessResults.map((r) => r._id);

//       await QuizResult.deleteMany({
//         _id: { $in: idsToDelete },
//       });
//     }

//     next();
//   } catch (err) {
//     console.error("QuizResult cleanup failed:", err);
//     next(err);
//   }
// });





module.exports = mongoose.model("QuizResult", quizResultSchema);
