// controllers/quizController.js
const Quiz = require("../../models/courses/Quiz");
const QuizResult = require("../../models/courses/QuizResult");
const Video = require("../../models/courses/Video");
const {CallOpenAi} = require("../../controller/helper/helper");


// ✅ Create Quiz for a Video
exports.createQuiz = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { questions } = req.body;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    // Check if quiz already exists
    if (video.quiz) {
      return res.status(400).json({ error: "Quiz already exists for this video" });
    }

    // Create quiz
    const quiz = new Quiz({ video: videoId, questions });
    await quiz.save();

    // Link quiz to video
    video.quiz = quiz._id;
    await video.save();

    res.status(201).json(
      { message: "Quiz created successfully", quiz }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Quiz by Video
exports.getQuizByVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const quiz = await Quiz
      .findOne({ video: videoId })
      .sort({ createdAt: -1 }); // 👈 latest first

    if (!quiz) return res.status(404).json({ error: "No quiz found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Quiz by Quiz ID
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Update Quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { questions },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // Remove reference from Video
    await Video.findOneAndUpdate({ quiz: quizId }, { $unset: { quiz: "" } });

    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Submit Quiz Answers
exports.SubmitQuiz =async (req, res) => {
  try {
    const {
      startupId,
      videoId,
      quizId,
      answers,
      totalQuestions,
      attempted,
      correct,
    } = req.body;

    // console.log("Received Quiz Submission:", req.body);

    const wrong = attempted - correct;
    const percentage = Math.round((correct / totalQuestions) * 100);

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const result = await QuizResult.create({
      startupId,
      videoId,
      quizId,
      answers,
      totalQuestions,
      attempted,
      correct,
      wrong,
      percentage,
      status: percentage >= 60 ? "PASS" : "FAIL",
    });

    // console.log("Quiz Result Saved:", result);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error saving quiz result:", err);
    res.status(500).json({ error: "Failed to save quiz result" });
  }
};

exports.GetRecentQuizResults = async (req, res) => {
  try {
    const { startupId, videoId } = req.params;





    const results = await QuizResult.find({ startupId, videoId })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent quiz results" });
  }
};

exports.GetQuizResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await QuizResult.findById(resultId);
    if (!result) return res.status(404).json({ error: "Result not found" });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz result" });
  }
};

// ✅ Generate New Quiz using AI (FINAL)
exports.generateNewQuiz = async (req, res) => {
  try {
    const { videoId } = req.body;

    // console.log("Received request to generate quiz for videoId:", videoId);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "videoId is required",
      });
    }

    // 🔹 1. Fetch video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (!video.generateAssessment) {
      return res.status(400).json({
        success: false,
        message: "Assessment generation is disabled for this video",
      });
    }

    console.log("🧠 Generating quiz using ChatGPT...");

    // 🔹 2. Prepare AI prompt
    const prompt = `
Generate exactly 5 high-quality multiple-choice questions in pure JSON format.
DO NOT use backticks.
DO NOT wrap in markdown.

Video title: "${video.title}"

${video.transcript ? `Transcript: ${video.transcript.slice(0, 2000)}` : ""}

Return only a JSON array like this:
[
  {
    "question": "",
    "options": ["", "", "", ""],
    "answer": 0,
    "explanation": ""
  }
]
`;

    // 🔹 3. Call AI
    const aiResponse = await CallOpenAi(prompt);

    if (!Array.isArray(aiResponse) || aiResponse.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI failed to generate quiz",
      });
    }

    // 🔹 4. Save quiz in DB
    const quiz = new Quiz({
      video: video._id,
      questions: aiResponse,
    });

    const savedQuiz = await quiz.save();

    // console.log("✅ Quiz generated:", savedQuiz._id);
    // console.log("Questions:, ", savedQuiz);

    // 🔹 5. Send response
    return res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      data: {
        quizId: savedQuiz._id,
        videoId: video._id,
        totalQuestions: savedQuiz.questions.length,
      },
    });
  } catch (error) {
    console.error("❌ Quiz Generation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate quiz",
    });
  }
};
