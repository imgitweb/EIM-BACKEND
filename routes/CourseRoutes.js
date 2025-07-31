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
} = require('../controller/Courses/videoController');
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

router.post('/videos/transcript', saveTranscript);

router.get('/videos/:moduleId', getVideosByModule);

router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

module.exports = router;
