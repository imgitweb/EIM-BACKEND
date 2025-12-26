// CourseRoutes.js (CommonJS version)
const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  getFullCourseByID,
} = require('../controller/Courses/courseController');

const {
  addModule,
  deleteModule,
  getModulesByCourse,
  updateModule,
} = require('../controller/Courses/moduleController');

const {
  uploadVideo,
  getVideosByModule,
  deleteVideo,
  updateVideo,
  getVimeoTranscript,
  saveTranscript,
  getAllVideos,
  getVideoById,
} = require('../controller/Courses/videoController');

const {
  createQuiz,
  getQuizByVideo,
  updateQuiz,
  deleteQuiz,
} = require("../controller/Courses/quizController");

const { upload } = require('../utils/vimeoUploader');
const upload1 = multer({ dest: 'uploads/' });

/* ===========================
   COURSE ROUTES
=========================== */
router.post('/courses', upload1.single('thumbnail'), createCourse);
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

/* ===========================
   MODULE ROUTES
=========================== */
router.post('/modules', addModule);
router.get('/modules/:courseId', getModulesByCourse);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

/* ===========================
   VIDEO ROUTES
=========================== */
router.post('/videos/upload', upload.single('video'), uploadVideo);
router.get('/videos/vimeo-transcript/:vimeoId', getVimeoTranscript);
router.get('/videos', getAllVideos);
router.get('/video/:id', getVideoById);

router.post('/videos/transcript', saveTranscript);
router.get('/videos/:moduleId', getVideosByModule);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);
router.get('/full-course/:id', getFullCourseByID);

/* ===========================
   QUIZ ROUTES
=========================== */
router.post("/quizzes/:videoId", createQuiz);
router.get("/quizzes/video/:videoId", getQuizByVideo);
router.put("/quizzes/:quizId", updateQuiz);
router.delete("/quizzes/:quizId", deleteQuiz);

module.exports = router;
