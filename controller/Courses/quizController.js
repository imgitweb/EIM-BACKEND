// controllers/quizController.js
const Quiz = require("../../models/courses/Quiz");
const Video = require("../../models/courses/Video");

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
    const quiz = await Quiz.findOne({ video: videoId });
    if (!quiz) return res.status(404).json({ error: "No quiz found" });
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
