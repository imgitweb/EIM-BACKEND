// CourseRoutes.js (CommonJS version)
const express = require('express');
const router = express.Router();

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
} = require('../controller/Courses/videoController');

/* ===========================
   COURSE ROUTES
=========================== */
router.post('/courses', createCourse);
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
router.post('/videos', uploadVideo);
router.get('/videos/:moduleId', getVideosByModule);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

module.exports = router;
